import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function App() {
  const [activities, setActivities] = useState([]);
  const [status, setStatus] = useState("");
  const [ranking, setRanking] = useState([]);
  const [rankingStatus, setRankingStatus] = useState("");

  // form state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("2026-03-08");
  const [surface, setSurface] = useState("clay");
  const [notes, setNotes] = useState("");
  const [filterText, setFilterText] = useState("");

  // edit register state
  const [editingId, setEditingId] = useState(null);

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

  async function loadActivities() {
    try {
      const res = await fetch(`${API_URL}/api/activities`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      console.error(err);
      setStatus("Error loading activities");
    }
  }

  useEffect(() => {
    setStatus("Loading...");
    loadActivities().finally(() => setStatus(""));
    loadRanking();
  }, []);

  // Create activity funcion
  async function createActivity(e) {
    e.preventDefault();

    if (!title.trim()) {
      setStatus("Title is required");
      return;
    }

    try {
      setStatus("Saving...");

      const isEditing = editingId !== null;
      const url = isEditing
        ? `${API_URL}/api/activities/${editingId}`
        : `${API_URL}/api/activities`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "match",
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
    setDate(activity.date || "2026-03-08");
    setSurface(activity.surface || "");
    setNotes(activity.notes || "");
    setStatus("");
  }

  async function deleteActivity(id) {
    try {
      setStatus("Deleting...");

      const res = await fetch(`${API_URL}/api/activities/${id}`, {
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

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>ATP Tenis Hub</h1>

      <h2>Create match</h2>
      <form onSubmit={createActivity} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (e.g., vs Juan)"
          />

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
            {editingId ? "Save changes" : "Add match"}
          </button>
        </div>
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
                backgroundColor: a.type === "match" ? "#2d6cdf" : "#2f8f4e",
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
