import { useEffect, useState } from "react";

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch("https://localhost:5000/api/users");
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

        <div>
          <p>User list will come here</p>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center">
        <h2 className="text-xl text-gray-500">Select a conversation</h2>
      </main>
    </div>
  );
}

export default App;
