// pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../api/client";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (!PASSWORD_REGEX.test(password)) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number and special character.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setStatus("Registering...");

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      // Registration OK → redirect to login
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setStatus("");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f2f5",
        fontFamily: "system-ui, sans-serif",
        padding: 20, // Added padding for mobile responsiveness
      }}
    >
      <div
        style={{
          background: "forestgreen",
          padding: 40,
          borderRadius: 12,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: 380,
        }}
      >
        {/* 1. Header Block */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎾</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
            ATP Tenis Hub
          </h1>
        </div>

        <h2 style={{ textAlign: "center", marginBottom: 20 }}>Register</h2>

        {/* 2. Form - Now inside the card */}
        <form
          onSubmit={handleRegister}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
          />

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

          <div style={{ display: "flex", gap: 8 }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button type="submit" style={{ marginTop: 8, cursor: "pointer" }}>
            Register
          </button>
        </form>

        {/* 3. Feedback and Links - Also inside the card */}
        {error && (
          <p
            style={{
              color: "red",
              marginTop: 12,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}
        {status && (
          <p style={{ marginTop: 12, fontSize: 14, textAlign: "center" }}>
            {status}
          </p>
        )}

        <p style={{ marginTop: 20, textAlign: "center", fontSize: 14 }}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
