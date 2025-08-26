import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    // Demo credentials
    const adminCred = { email: "admin@example.com", password: "admin123" };
    const userCred = { email: "user@example.com", password: "password123" };

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    if (
      role === "admin" &&
      email === adminCred.email &&
      password === adminCred.password
    ) {
      localStorage.setItem("role", "admin");
      localStorage.setItem("username", email.split("@")[0]); // Save username from email
      navigate("/dashboard");
    } else if (
      role === "user" &&
      email === userCred.email &&
      password === userCred.password
    ) {
      localStorage.setItem("role", "user");
      localStorage.setItem("username", email.split("@")[0]); // Save username from email
      navigate("/dashboard");
    } else {
      setError("Invalid email or password.");
    }
    };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] p-8 text-white font-sans">
      <form
        className="glass-card rounded-3xl p-10 max-w-sm w-full shadow-xl border border-[#FF5722]"
        onSubmit={handleLogin}
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div className="flex justify-center mb-6">
          <img
            src="/assets/logo1.png"
            alt="Logo"
            className="h-12 drop-shadow-glow"
          />
        </div>
        <h2 className="text-center text-3xl font-extrabold mb-4 text-[#00ADB5] drop-shadow-lg">
          ESGenius
        </h2>
        <div className="flex justify-center mb-4 gap-4">
          <button
            type="button"
            className={`px-4 py-1 rounded-full font-semibold border transition ${
              role === "admin"
                ? "bg-purple-600 text-white border-purple-600 drop-shadow-glow"
                : "bg-[#232946] text-purple-200 border-purple-300"
            }`}
            onClick={() => setRole("admin")}
          >
            Admin
          </button>
          <button
            type="button"
            className={`px-4 py-1 rounded-full font-semibold border transition ${
              role === "user"
                ? "bg-pink-500 text-white border-pink-500 drop-shadow-glow"
                : "bg-[#232946] text-purple-200 border-purple-300"
            }`}
            onClick={() => setRole("user")}
          >
            User
          </button>
        </div>
        {error && (
          <div className="text-red-400 text-center mb-4">{error}</div>
        )}
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 rounded-xl border border-purple-300 bg-[#232946] text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 px-4 py-2 rounded-xl border border-purple-300 bg-[#232946] text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#00ADB5] to-[#FF5722] text-white font-bold py-2 rounded-xl shadow-lg hover:scale-105 transition-transform"
        >
          Login
        </button>
        <div className="text-xs text-purple-200 mt-4 text-center">
          Admin: admin@example.com / admin123
          <br />
          User: user@example.com / password123
        </div>
        <div className="text-xs text-purple-400 mt-2 text-center">
          Don&apos;t have an account?{" "}
          <span
            className="text-pink-400 cursor-pointer hover:underline"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </div>
      </form>
      <style>{`
      .glass-card {
        background: rgba(36, 36, 62, 0.7);
        border-radius: 1.5rem;
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border: 1px solid rgba(255,255,255,0.18);
        padding: 2rem;
        margin-bottom: 2rem;
        transition: box-shadow 0.3s, transform 0.3s;
      }
      .glass-card:hover {
        box-shadow: 0 12px 40px 0 rgba(255, 0, 128, 0.25), 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        transform: translateY(-4px) scale(1.02);
      }
      .drop-shadow-glow {
        filter: drop-shadow(0 0 8px #e879f9) drop-shadow(0 0 16px #a78bfa);
      }
    `}</style>
    </div>
  );
}
