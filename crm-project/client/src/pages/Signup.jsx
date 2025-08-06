import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!username || !email || !password || !confirm) {
      setError("Please fill all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSuccess("Signup request sent! Wait for admin approval.");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirm("");
    // Optionally, navigate after a delay:
    // setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center">
      <form
        className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-xl"
        onSubmit={handleSignup}
      >
        <h2 className="text-black text-center text-2xl font-bold mb-4">
          User Sign Up
        </h2>
        {error && (
          <div className="text-red-500 text-center mb-4">{error}</div>
        )}
        {success && (
          <div className="text-green-600 text-center mb-4">{success}</div>
        )}
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 px-4 py-2 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 placeholder-gray-700 focus:outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 placeholder-gray-700 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 placeholder-gray-700 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full mb-6 px-4 py-2 rounded-xl border border-gray-300 bg-gray-100 text-gray-900 placeholder-gray-700 focus:outline-none"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-gray-900 text-white font-semibold py-2 rounded-xl hover:bg-gray-800"
        >
          Sign Up
        </button>
        <div className="text-xs text-gray-500 mt-4 text-center">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </div>
      </form>
    </div>
  );
}