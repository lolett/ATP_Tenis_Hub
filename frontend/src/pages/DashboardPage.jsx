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
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h2>{editingId ? "Edit activity" : "New activity"}</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}
        >
          <input
            placeholder="Title (e.g. vs Juan) *"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleError("");
            }}
            style={{
              border: titleError ? "1px solid red" : undefined,
              minWidth: 180,
            }}
          />

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

          <input
            placeholder="Surface (clay / hard / grass)"
            value={surface}
            onChange={(e) => setSurface(e.target.value)}
          />

          {/* Score field - only relevant for matches but available for all */}
          <input
            placeholder="Score (e.g. 6-3 7-5)"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />

          <input
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
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

      {status && <p>{status}</p>}

      <h2>My activities</h2>

      <input
        placeholder="Filter by title..."
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        style={{ marginBottom: 12 }}
      />

      <p>
        <strong>Total:</strong> {filteredActivities.length}
      </p>

      {activities.length === 0 && !status && <p>No activities yet.</p>}
      {activities.length > 0 && filteredActivities.length === 0 && (
        <p>No activities match the filter.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {filteredActivities.map((a) => (
          <li
            key={a.id}
            style={{
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <strong>{a.title}</strong>

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

            <span>{a.date}</span>
            {a.surface && <span>· {a.surface}</span>}
            {a.score && <span>· {a.score}</span>}
            {a.notes && <span>· {a.notes}</span>}

            <button onClick={() => startEdit(a)}>Edit</button>
            <button onClick={() => deleteActivity(a.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
