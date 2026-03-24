// pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../api/client";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setStatus("Logging in...");

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setStatus("");
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>ATP Tenis Hub</h1>
      <h2>Login</h2>

      <form
        onSubmit={handleLogin}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 320,
        }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            style={{ flex: 1 }}
          />
          <button type="button" onClick={() => setShowPassword((p) => !p)}>
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button type="submit">Login</button>
      </form>

      {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
      {status && <p style={{ marginTop: 8 }}>{status}</p>}

      <p style={{ marginTop: 12 }}>
        No account yet? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
