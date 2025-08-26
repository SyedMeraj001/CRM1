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

  const handleSignup = async (e) => {
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
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (res.ok) {
        setSuccess("Signup successful! You can now log in.");
        setUsername("");
        setEmail("");
        setPassword("");
        setConfirm("");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        const data = await res.json();
        setError(data.error || "Signup failed.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] p-8 text-white flex items-center justify-center">
      <form
          className="bg-[#16213E] rounded-3xl p-10 max-w-sm w-full shadow-xl border border-[#00ADB5]"
        onSubmit={handleSignup}
      >
          <h2 className="text-[#00ADB5] text-center text-2xl font-bold mb-4">
          User Sign Up
        </h2>
        {error && (
          <div className="text-[#FF5722] text-center mb-4">{error}</div>
        )}
        {success && (
          <div className="text-[#00ADB5] text-center mb-4">{success}</div>
        )}
        <input
          type="text"
          placeholder="Username"
          className="w-full mb-4 px-4 py-2 rounded-xl border border-[#00ADB5] bg-[#0F3460] text-white placeholder-[#B8C1EC] focus:outline-none"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 rounded-xl border border-[#00ADB5] bg-[#0F3460] text-white placeholder-[#B8C1EC] focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 rounded-xl border border-[#00ADB5] bg-[#0F3460] text-white placeholder-[#B8C1EC] focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full mb-6 px-4 py-2 rounded-xl border border-[#00ADB5] bg-[#0F3460] text-white placeholder-[#B8C1EC] focus:outline-none"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-[#00ADB5] text-white font-semibold py-2 rounded-xl hover:bg-[#FF5722] transition-colors"
        >
          Sign Up
        </button>
        <div className="text-xs text-[#B8C1EC] mt-4 text-center">
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