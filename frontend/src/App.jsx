import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function App() {
  const [activities, setActivities] = useState([]);
  const [status, setStatus] = useState("");
  const [ranking, setRanking] = useState([]);
  const [rankingStatus, setRankingStatus] = useState("");

  // form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState("match");
  const [date, setDate] = useState("2026-03-08");
  const [surface, setSurface] = useState("clay");
  const [notes, setNotes] = useState("");
  const [filterText, setFilterText] = useState("");
  const [titleError, setTitleError] = useState("");

  // auth and login states
  const [authMode, setAuthMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [currentUser, setCurrentUser] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // edit register state
  const [editingId, setEditingId] = useState(null);

  // activities styles
  const typeColors = {
    match: "#2d6cdf",
    training: "#2f8f4e",
    workout: "#d97706",
  };

  async function loadRanking() {
    try {
      setRankingStatus("Loading ATP ranking...");
      const res = await fetch(`${API_URL}/api/atp/ranking`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRanking(data);
      setRankingStatus("");
    } catch (err) {
      console.error(err);
      setRankingStatus("Error loading ATP ranking");
    }
  }

  // helper authFetch: token to localStorage & set Bearer header
  async function authFetch(url, options = {}) {
    const savedToken = token || localStorage.getItem("token") || "";

    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${savedToken}`,
      },
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      setToken("");
      setCurrentUser(null);
      setActivities([]);
      setAuthError("Your session has expired. Please log in again.");
    }

    return res;
  }

  function isValidPassword(password) {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    return passwordRegex.test(password);
  }

  // auth functions for register, login and logout
  async function handleRegister(e) {
    e.preventDefault();
    setAuthError("");

    // user register validation fields
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setAuthError("All fields are required.");
      return;
    }

    if (!isValidPassword(password)) {
      setAuthError(
        "Password must be at least 8 characters and include uppercase, lowercase, number and special character.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setAuthError("Passwords do not match.");
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
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setStatus("Registration successful. You can now log in.");
      setAuthMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();

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
      setToken(data.token);
      setCurrentUser(data.user);
      setStatus("");
      setPassword("");
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken("");
    setCurrentUser(null);
    setActivities([]);
    setStatus("");
    setAuthError("");
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  async function loadMe() {
    try {
      const res = await authFetch(`${API_URL}/api/auth/me`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCurrentUser(data);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      setToken("");
      setCurrentUser(null);
      setActivities([]);
    }
  }

  async function loadActivities() {
    try {
      const res = await authFetch(`${API_URL}/api/activities`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      console.error(err);
      if (!String(err.message).includes("401")) {
        setStatus("Error loading activities");
      }
    }
  }

  useEffect(() => {
    loadRanking();
  }, []);

  useEffect(() => {
    if (!token) return;

    setStatus("Loading...");
    loadMe()
      .then(() => loadActivities())
      .finally(() => setStatus(""));
  }, [token]);

  // Create activity funcion
  async function createActivity(e) {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }

    try {
      setStatus("Saving...");

      const isEditing = editingId !== null;
      const url = isEditing
        ? `${API_URL}/api/activities/${editingId}`
        : `${API_URL}/api/activities`;

      const method = isEditing ? "PUT" : "POST";

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          date,
          title: title.trim(),
          surface,
          notes,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }

      await loadActivities();

      setEditingId(null);
      setTitle("");
      setType("match");
      setNotes("");
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  }

  function startEdit(activity) {
    setEditingId(activity.id);
    setTitle(activity.title || "");
    setType(activity.type || "match");
    setDate(activity.date || "2026-03-08");
    setSurface(activity.surface || "");
    setNotes(activity.notes || "");
    setStatus("");
  }

  async function deleteActivity(id) {
    try {
      setStatus("Deleting...");

      const res = await authFetch(`${API_URL}/api/activities/${id}`, {
        method: "DELETE",
      });

      if (res.status === 404) {
        setStatus("Error: activity not found");
        await loadActivities();
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      await loadActivities();
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  }

  // filter activities by input field
  const filteredActivities = activities.filter((a) =>
    a.title.toLowerCase().includes(filterText.toLowerCase()),
  );

  // filter activities by date
  const sortedActivities = [...filteredActivities].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );

  if (!token || !currentUser) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
        <h1>ATP Tenis Hub</h1>
        <h2>{authMode === "login" ? "Login" : "Register"}</h2>

        <form
          onSubmit={authMode === "login" ? handleLogin : handleRegister}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxWidth: 320,
          }}
        >
          {authMode === "register" && (
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setAuthError("");
              }}
              placeholder="Name"
              type="text"
            />
          )}

          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setAuthError("");
            }}
            placeholder="Email"
            type="email"
          />

          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setAuthError("");
              }}
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {authMode === "register" && (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setAuthError("");
                }}
                placeholder="Confirm password"
                type={showConfirmPassword ? "text" : "password"}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          )}

          <button type="submit">
            {authMode === "login" ? "Login" : "Register"}
          </button>
        </form>

        {authError && <p style={{ color: "red" }}>{authError}</p>}

        <p style={{ marginTop: 12 }}>
          {authMode === "login"
            ? "No account yet?"
            : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === "login" ? "register" : "login");
              setAuthError("");
              setPassword("");
              setConfirmPassword("");
              setShowPassword(false);
              setShowConfirmPassword(false);
            }}
          >
            {authMode === "login" ? "Go to register" : "Go to login"}
          </button>
        </p>

        {status && <p>{status}</p>}
      </div>
    );
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>ATP Tenis Hub</h1>
      <p>
        Welcome, <strong>{currentUser.name}</strong>{" "}
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
      </p>

      <h2>Create activity</h2>
      <form onSubmit={createActivity} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleError("");
            }}
            placeholder="Title (e.g., vs Juan)"
            style={{
              border: titleError ? "1px solid red" : undefined,
            }}
          />

          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="match">match</option>
            <option value="training">training</option>
            <option value="workout">workout</option>
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            value={surface}
            onChange={(e) => setSurface(e.target.value)}
            placeholder="surface (clay/hard/grass)"
          />

          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="notes"
          />

          <button type="submit">
            {editingId ? "Save changes" : "Add activity"}
          </button>
        </div>

        {titleError && (
          <p style={{ color: "red", marginTop: 8 }}>{titleError}</p>
        )}
      </form>

      {status && <p>{status}</p>}

      <input
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        placeholder="Filter activities..."
        style={{ marginBottom: 12 }}
      />

      <h2>Activities</h2>

      <p>
        <strong>Total activities:</strong> {sortedActivities.length}
      </p>

      {!status && activities.length === 0 && <p>No activities yet.</p>}

      {!status && activities.length > 0 && sortedActivities.length === 0 && (
        <p>No activities found.</p>
      )}
      <ul>
        {sortedActivities.map((a) => (
          <li key={a.id} style={{ marginBottom: 8 }}>
            <strong>{a.title}</strong>{" "}
            <span
              style={{
                display: "inline-block",
                padding: "2px 8px",
                margin: "0 8px",
                borderRadius: 12,
                backgroundColor: typeColors[a.type] || "#666",
                color: "white",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {a.type}
            </span>
            — {a.date}
            {a.surface ? ` — ${a.surface}` : ""}
            {a.score ? ` — ${a.score}` : ""}
            {a.notes ? ` — ${a.notes}` : ""}{" "}
            <button onClick={() => startEdit(a)}>Edit</button>{" "}
            <button onClick={() => deleteActivity(a.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>ATP Ranking</h2>

      {rankingStatus && <p>{rankingStatus}</p>}

      {ranking.length === 0 ? (
        <p>No ranking loaded yet.</p>
      ) : (
        <ul>
          {ranking.map((player) => (
            <li key={player.rank}>
              #{player.rank} {player.name} ({player.country}) - {player.points}{" "}
              pts
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
