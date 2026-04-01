// pages/RegisterPage.jsx - with live password requirements checklist
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../api/client";

// Individual requirement check
function check(password, confirmPassword) {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /\d/.test(password),
    special: /[^A-Za-z\d]/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };
}

function RequirementRow({ met, label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        color: met ? "var(--success)" : "var(--text-muted)",
        transition: "color 0.2s",
      }}
    >
      <span style={{ fontSize: 14, width: 16, textAlign: "center" }}>
        {met ? "✓" : "○"}
      </span>
      {label}
    </div>
  );
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const reqs = check(password, confirmPassword);
  const allMet = Object.values(reqs).every(Boolean);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (!allMet) {
      setError("Please meet all password requirements.");
      return;
    }

    try {
      setLoading(true);
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
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: 20,
      }}
    >
      <div
        className="card"
        style={{ width: "100%", maxWidth: 400, padding: 40 }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎾</div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Create account</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Join ATP Tenis Hub
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                style={{ flex: 1 }}
              />
              <button type="button" onClick={() => setShowPass((p) => !p)}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Password requirements — shown when password field has been touched */}
          {(passwordFocused || password.length > 0) && (
            <div
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}
            >
              <RequirementRow
                met={reqs.length}
                label="Minimum of 8 characters long"
              />
              <RequirementRow
                met={reqs.uppercase && reqs.lowercase}
                label="A mix of uppercase and lowercase letters (A-Z a-z)"
              />
              <RequirementRow
                met={reqs.digit}
                label="At least one digit (0-9)"
              />
              <RequirementRow
                met={reqs.special}
                label="At least one special character (e.g. @;!$.)"
              />
              {confirmPassword.length > 0 && (
                <RequirementRow
                  met={reqs.match}
                  label="Password and confirm password should match"
                />
              )}
            </div>
          )}

          {/* Confirm password */}
          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError("");
                }}
                style={{
                  flex: 1,
                  borderColor:
                    confirmPassword.length > 0
                      ? reqs.match
                        ? "var(--success)"
                        : "var(--danger)"
                      : undefined,
                }}
              />
              <button type="button" onClick={() => setShowConfirm((p) => !p)}>
                {showConfirm ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !allMet}
            style={{ marginTop: 4, padding: "11px", opacity: allMet ? 1 : 0.6 }}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            fontSize: 14,
            color: "var(--text-muted)",
          }}
        >
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
