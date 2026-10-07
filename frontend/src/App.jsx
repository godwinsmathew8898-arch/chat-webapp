import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/SignUp";

function App() {
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

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [chats, setChats] = useState([]);

  useEffect(() => {
    async function restoreSession() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, {
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
  if (!accessToken) return;
  async function fetchChats() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chats`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chats");
      }

      const data = await response.json();

      setChats(data.chats);
    } catch (error) {
      console.error(error);
    }
  }

  fetchChats();
}, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    async function searchUsers() {
      if (!search.trim()) {
        setSearchResults([]);
        setError("");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/search?username=${encodeURIComponent(search)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        if (!response.ok) {
          throw new Error("Failed to search users!");
        }
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    searchUsers();
  }, [search, accessToken]);

  useEffect(() => {
    async function fetchMessages() {
      if (!selectedUser || !accessToken) {
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/messages/${selectedUser._id}`,
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
  }, [selectedUser, accessToken]);

  async function handleLogout() {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to log out");
      }

      setAuth(null);
      setSelectedUser(null);
      setMessages([]);
      setChats([]);
      setSearch("");
      setSearchResults([]);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages`, {
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

  async function handleSelectUser(user) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/chats`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId: user._id,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to open chat");
    }

    const data = await response.json();

    setChats((prev) => {
  const alreadyExists = prev.some(
    (chat) => chat._id === data.chat._id,
  );

  if (alreadyExists) {
    return prev;
  }

  return [...prev, { ...data.chat, participantUsers: [currentUser, user] }];
});

    setSelectedUser(user);
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
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search username..."
            className="w-full rounded-lg border px-3 py-2"
          />
          <div className="mt-3 space-y-2">
            {loading && <p>Loading users...</p>}
            {error && <p>{error}</p>}
            {searchResults.map((user) => (
              <button key={user._id} onClick={() => handleSelectUser(user)}
                className="block w-full rounded-lg p-3 text-left hover:bg-gray-100">
                {user.username}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleLogout} className="rounded-lg border px-3 py-1 text-sm">
          Logout
        </button>
        <div className="mt-4 space-y-2">
          {chats.map((chat) => {
            const otherUser = chat.participantUsers.find(
              (user) => user._id !== currentUser._id,
            );
            if (!otherUser) return null;
            return (
              <button key={chat._id} onClick={() => setSelectedUser(otherUser)}
                className="block w-full rounded-lg p-3 text-left hover:bg-gray-100">
                <p className="font-medium">{otherUser.username}</p>
              </button>
            );
          })}
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
