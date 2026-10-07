import { useState } from "react";

function Register({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data.message);
      return;
    }

    onRegister(data);
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border p-6"
      >
        <h1 className="text-2xl font-semibold">Create account</h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />

        <button
          type="submit"
          className="w-full rounded-lg bg-black px-4 py-2 text-white"
        >
          Sign up
        </button>

        <button
          type="button"
          onClick={onSwitchToLogin}
          className="w-full text-sm text-gray-500"
        >
          Already have an account? Login
        </button>
      </form>
    </div>
  );
}

export default Register;
