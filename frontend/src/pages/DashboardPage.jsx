// pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import { API_URL, authFetch } from "../api/client";

const TYPE_COLORS = {
  match: "#2d6cdf",
  training: "#2f8f4e",
  workout: "#d97706",
};

const TODAY = new Date().toISOString().split("T")[0];

export default function DashboardPage() {
  const [activities, setActivities] = useState([]);
  const [status, setStatus] = useState("");
  const [filterText, setFilterText] = useState("");

  // form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState("match");
  const [date, setDate] = useState(TODAY);
  const [surface, setSurface] = useState("");
  const [score, setScore] = useState("");
  const [notes, setNotes] = useState("");
  const [titleError, setTitleError] = useState("");

  // edit state
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    try {
      const res = await authFetch(`${API_URL}/api/activities`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      console.error(err);
      setStatus("Error loading activities");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }

    try {
      setStatus("Saving...");

      const url = editingId
        ? `${API_URL}/api/activities/${editingId}`
        : `${API_URL}/api/activities`;

      const method = editingId ? "PUT" : "POST";

      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          date,
          title: title.trim(),
          surface: surface.trim() || null,
          score: score.trim() || null,
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }

      await loadActivities();
      resetForm();
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  }

  async function deleteActivity(id) {
    if (!window.confirm("Delete this activity?")) return;

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

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      await loadActivities();
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
    setDate(activity.date || TODAY);
    setSurface(activity.surface || "");
    setScore(activity.score || "");
    setNotes(activity.notes || "");
    setTitleError("");
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setType("match");
    setDate(TODAY);
    setSurface("");
    setScore("");
    setNotes("");
    setTitleError("");
    setStatus("");
  }

  const filteredActivities = activities
    .filter((a) => a.title.toLowerCase().includes(filterText.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    /* G4: Page Wrapper */
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
      {/* G1: Form Card */}
      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {editingId ? "✏️ Edit activity" : "➕ New activity"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <input
                  placeholder="Title (e.g. vs Juan) *"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setTitleError("");
                  }}
                  style={{
                    border: titleError ? "1px solid red" : "1px solid #ddd",
                    minWidth: 180,
                    padding: "8px",
                    borderRadius: 4,
                  }}
                />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{ padding: "8px", borderRadius: 4 }}
                >
                  <option value="match">Match</option>
                  <option value="training">Training</option>
                  <option value="workout">Workout</option>
                </select>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{ padding: "8px", borderRadius: 4 }}
                />
                <input
                  placeholder="Surface"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  style={{ padding: "8px", borderRadius: 4 }}
                />
                <input
                  placeholder="Score"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  style={{ padding: "8px", borderRadius: 4 }}
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 10,
                  }}
                >
                  <input
                    placeholder="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ padding: "8px", borderRadius: 4 }}
                  />
                </div>
              </div>
            </div>

            {titleError && (
              <p style={{ color: "red", margin: "4px 0 8px" }}>{titleError}</p>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit">
                {editingId ? "Save changes" : "Add activity"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        {status && <p style={{ marginTop: 8, color: "#666" }}>{status}</p>}
      </div>

      {/* G1: Activities List Card */}
      <div
        style={{
          background: "white",
          padding: 24,
          borderRadius: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <h2 style={{ marginBottom: 16 }}>My activities</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <input
            placeholder="Filter by title..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{
              marginBottom: 12,
              padding: "8px",
              width: "100%",
              maxWidth: 300,
              borderRadius: 4,
              border: "1px solid #ddd",
            }}
          />
        </div>

        <p style={{ marginBottom: 16 }}>
          <strong>Total:</strong> {filteredActivities.length}
        </p>

        {activities.length === 0 && !status && <p>No activities yet.</p>}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredActivities.map((a) => (
            <li
              key={a.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 0",
                borderBottom: "1px solid #f3f4f6",
                listStyle: "none",
              }}
            >
              <strong style={{ flex: 1 }}>{a.title}</strong>
              <span
                style={{
                  padding: "2px 8px",
                  borderRadius: 12,
                  backgroundColor: TYPE_COLORS[a.type] || "#666",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {a.type}
              </span>
              <span style={{ color: "#6b7280" }}>{a.date}</span>
              <div style={{ flex: 1, fontSize: 14, color: "#6b7280" }}>
                {a.surface && <span> · {a.surface}</span>}
                {a.score && <span> · {a.score}</span>}
                {a.notes && <span> · {a.notes}</span>}
              </div>
              <button onClick={() => startEdit(a)}>Edit</button>
              <button
                onClick={() => deleteActivity(a.id)}
                style={{ color: "#dc2626", borderColor: "#fca5a5" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
