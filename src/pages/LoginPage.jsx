import { useState } from "react";
import { useLogin } from "../hooks/useLogin";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isPending, error } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="min-h-screen justify-center items-center flex bg-gray-200 ">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl p-10 bg-gray-100 shadow-2xl w-lg"
      >
        <h2 className="text-xl">Login</h2>
        {error && <p className="error">{error}</p>}
        <label>
          <span className="text-sm">Email:</span>
          <input
            required
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="p-6"
          />
        </label>
        <label>
          <span className="text-sm">Password:</span>
          <input
            required
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </label>
        {!isPending && (
          <button className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-large font-medium flex items-center gap-1 cursor-pointer">
            Login
          </button>
        )}
        {isPending && (
          <button
            className="bg-blue-200 hover:bg-blue-400 text-white px-3 py-1 rounded-lg text-large font-medium flex items-center gap-1 cursor-pointer"
            disabled
          >
            Loading...
          </button>
        )}
      </form>
    </div>
  );
}
