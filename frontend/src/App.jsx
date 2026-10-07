import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/SignUp";

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [auth, setAuth] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(true);

  const currentUser = auth?.user;
  const accessToken = auth?.accessToken;

  useEffect(() => {
    async function restoreSession() {
      try {
        const response = await fetch("http://localhost:5000/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) {
          setAuth(null);
          return;
        }
        const data = await response.json();
        setAuth(data);
      } catch (error) {
        console.error(error);
        setAuth(null);
      } finally {
        setAuthLoading(false);
      }
    }
    restoreSession();
  }, []);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("http://localhost:5000/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users!");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    async function fetchMessages() {
      if (!selectedUser) {
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/messages/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }

        const data = await response.json();

        setMessages(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchMessages();
  }, [selectedUser]);

  async function handleLogout() {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setAuth(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!auth) {
    if (authMode === "register") {
      return (
        <Register
          onRegister={setAuth}
          onSwitchToLogin={() => setAuthMode("login")}
        />
      );
    }

    return (
      <Login
        onLogin={setAuth}
        onSwitchToRegister={() => setAuthMode("register")}
      />
    );
  }

  async function handleSendMessage(event) {
    event.preventDefault();
    if (!message.trim()) {
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          receiverId: selectedUser._id,
          content: message,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to send message!");
      }
      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
      setMessage("");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="flex h-screen">
      <aside className="w-80 border-r border-gray-300 p-5">
        <h2 className="text-xl font-semibold">Chats</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users..."
            className="border border-gray-300 w-full rounded-md px-3 py-2 outline-none"
          />
        </div>
        <button
          onClick={handleLogout}
          className="rounded-lg border px-3 py-1 text-sm"
        >
          Logout
        </button>

        <div>
          <div className="space-y-2">
            {loading && <p>Loading users...</p>}
            {error && <p>{error}</p>}

            {!loading &&
              !error &&
              users.map((user) => (
                <div
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className="cursor-pointer rounded-lg p-3 hover:bg-gray-300"
                >
                  <p className="font-medium">{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              ))}
          </div>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center">
        {selectedUser ? (
          <>
            <div className="flex flex-col gap-5 w-full h-full">
              <div className="border-b border-gray-300 p-4">
                <h2 className="font-semibold ">{selectedUser.username}</h2>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
              <div className="flex flex-1 flex-col gap-3 items-end ">
                {messages.map((msg) => {
                  const isMine = msg.senderId === currentUser._id;
                  return (
                    <div
                      key={msg._id}
                      className={`w-fit max-w-xs rounded-lg px-3 py-2 break-words ${
                        isMine
                          ? "ml-auto bg-black text-white"
                          : "mr-auto bg-gray-200 text-black"
                      }`}
                    >
                      {msg.content}
                    </div>
                  );
                })}
              </div>
              <form
                onSubmit={handleSendMessage}
                className="relative flex gap-2 border-t border-gray-300 p-4"
              >
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-5 bottom-5.5 cursor-pointer rounded-lg bg-white px-2 py-1 text-black"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <h2 className="text-xl text-gray-500">Select a conversation</h2>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
