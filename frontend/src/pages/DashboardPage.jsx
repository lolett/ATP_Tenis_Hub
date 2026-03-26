// pages/DashboardPage.jsx - with date filter
import { useEffect, useState } from "react";
import { API_URL, authFetch } from "../api/client";

const TYPE_CONFIG = {
  match: { badge: "badge badge-match", label: "Match" },
  training: { badge: "badge badge-training", label: "Training" },
  workout: { badge: "badge badge-workout", label: "Workout" },
};

export default function DashboardPage() {
  const [activities, setActivities] = useState([]);
  const [status, setStatus] = useState("");
  const [filterText, setFilterText] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("match");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [surface, setSurface] = useState("");
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");
  const [titleError, setTitleError] = useState("");

  useEffect(() => {
    loadMe();
    loadActivities();
  }, []);

  async function loadMe() {
    try {
      const res = await authFetch(`${API_URL}/api/auth/me`);
      if (res.ok) setCurrentUser(await res.json());
    } catch {}
  }

  async function loadActivities() {
    try {
      const res = await authFetch(`${API_URL}/api/activities`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setActivities(await res.json());
    } catch {
      setStatus("Error loading activities.");
    }
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setType("match");
    setDate(new Date().toISOString().slice(0, 10));
    setSurface("");
    setScore("");
    setNotes("");
    setTitleError("");
    setStatus("");
  }

  function startEdit(a) {
    setEditingId(a.id);
    setTitle(a.title ?? "");
    setType(a.type ?? "match");
    setDate(a.date ?? "");
    setSurface(a.surface ?? "");
    setScore(a.score ?? "");
    setNotes(a.notes ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError("Title is required.");
      return;
    }
    const url = editingId
      ? `${API_URL}/api/activities/${editingId}`
      : `${API_URL}/api/activities`;
    const method = editingId ? "PUT" : "POST";
    try {
      setStatus("Saving...");
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          date,
          title: title.trim(),
          surface: surface || null,
          score: score || null,
          notes: notes || null,
        }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? `HTTP ${res.status}`);
      }
      await loadActivities();
      resetForm();
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function deleteActivity(id) {
    if (!window.confirm("Delete this activity?")) return;
    try {
      const res = await authFetch(`${API_URL}/api/activities/${id}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 404) throw new Error(`HTTP ${res.status}`);
      await loadActivities();
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  }

  // Apply all filters
  const filtered = activities
    .filter((a) => {
      if (
        filterText &&
        !a.title.toLowerCase().includes(filterText.toLowerCase())
      )
        return false;
      if (filterType !== "all" && a.type !== filterType) return false;
      if (filterFrom && a.date < filterFrom) return false;
      if (filterTo && a.date > filterTo) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const hasActiveFilter =
    filterText || filterFrom || filterTo || filterType !== "all";

  return (
    <div className="page">
      {currentUser && (
        <p
          style={{ marginBottom: 20, color: "var(--text-muted)", fontSize: 14 }}
        >
          Welcome back,{" "}
          <strong style={{ color: "var(--text)" }}>{currentUser.name}</strong>
        </p>
      )}

      {/* Form card */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h2 style={{ marginBottom: 20 }}>
          {editingId ? "✏️ Edit activity" : "➕ New activity"}
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Row 1: title, type, date */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleError("");
                }}
                placeholder="Title (e.g. vs Juan) *"
                style={{
                  borderColor: titleError ? "var(--danger)" : undefined,
                }}
              />
              {titleError && <p className="error-text">{titleError}</p>}
            </div>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="match">Match</option>
              <option value="training">Training</option>
              <option value="workout">Workout</option>
            </select>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Row 2: surface, score */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <input
              value={surface}
              onChange={(e) => setSurface(e.target.value)}
              placeholder="Surface (clay / hard / grass)"
            />
            <input
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Score (e.g. 6-3 7-5)"
            />
          </div>

          {/* Row 3: notes + submit */}
          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (optional)"
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ whiteSpace: "nowrap" }}
            >
              {editingId ? "Save changes" : "Add activity"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>

          {status && (
            <p
              style={{
                marginTop: 10,
                fontSize: 13,
                color: status.startsWith("Error")
                  ? "var(--danger)"
                  : "var(--text-muted)",
              }}
            >
              {status}
            </p>
          )}
        </form>
      </div>

      {/* Activities list card */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ marginBottom: 16 }}>My activities</h2>

        {/* Filters */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="🔍 Filter by title..."
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All types</option>
            <option value="match">Match</option>
            <option value="training">Training</option>
            <option value="workout">Workout</option>
          </select>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            title="From date"
            placeholder="From"
          />
          <input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            title="To date"
            placeholder="To"
          />
        </div>

        {hasActiveFilter && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Showing {filtered.length} of {activities.length} activities
            </span>
            <button
              onClick={() => {
                setFilterText("");
                setFilterFrom("");
                setFilterTo("");
                setFilterType("all");
              }}
              style={{
                fontSize: 12,
                padding: "3px 10px",
                color: "var(--danger)",
                borderColor: "var(--danger)",
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {!hasActiveFilter && (
          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginBottom: 12,
            }}
          >
            Total: <strong>{activities.length}</strong>
          </p>
        )}

        {activities.length === 0 && (
          <p
            style={{
              color: "var(--text-muted)",
              textAlign: "center",
              padding: 32,
            }}
          >
            No activities yet. Add your first one above!
          </p>
        )}
        {activities.length > 0 && filtered.length === 0 && (
          <p style={{ color: "var(--text-muted)" }}>
            No activities match your filters.
          </p>
        )}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {filtered.map((a) => (
            <li
              key={a.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                padding: "12px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <strong style={{ minWidth: 100, flex: 1 }}>{a.title}</strong>
              <span className={(TYPE_CONFIG[a.type] ?? {}).badge ?? "badge"}>
                {(TYPE_CONFIG[a.type] ?? {}).label ?? a.type}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {a.date}
              </span>
              {a.surface && (
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  · {a.surface}
                </span>
              )}
              {a.score && (
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "monospace",
                    fontWeight: 600,
                  }}
                >
                  {a.score}
                </span>
              )}
              {a.notes && (
                <span
                  className="hide-mobile"
                  style={{ fontSize: 12, color: "var(--text-muted)", flex: 1 }}
                >
                  · {a.notes}
                </span>
              )}
              <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                <button
                  onClick={() => startEdit(a)}
                  style={{ padding: "5px 10px", fontSize: 12 }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteActivity(a.id)}
                  className="btn-danger"
                  style={{ padding: "5px 10px", fontSize: 12 }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
