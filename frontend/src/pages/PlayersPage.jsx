// pages/PlayersPage.jsx
// Lists ATP top players sourced from the singles ranking endpoint
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api/client";

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    try {
      setStatus("Loading players...");
      const res = await fetch(`${API_URL}/api/atp/ranking`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rows = json.data ?? json;
      setPlayers(rows);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Error loading players.");
    }
  }

  const filtered = players.filter((item) => {
    const name = item.player?.name ?? item.name ?? "";
    return name.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h2>ATP Players</h2>

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search by name..."
        style={{ marginBottom: 16, padding: "6px 10px", width: 240 }}
      />

      {status && <p>{status}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {filtered.map((item) => {
          const player = item.player ?? item;
          const pos = item.position ?? item.rank;
          const pts = item.point ?? item.points;

          return (
            <div
              key={player.id}
              onClick={() => navigate(`/players/${player.id}`)}
              style={{
                width: 180,
                padding: 16,
                border: "1px solid #ddd",
                borderRadius: 8,
                cursor: "pointer",
                transition: "box-shadow 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.12)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>🎾</div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                {player.name}
              </div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
                {player.countryAcr ?? player.country}
              </div>
              <div style={{ fontSize: 12 }}>
                <span style={{ fontWeight: 700 }}>#{pos}</span>
                {" · "}
                {Number(pts).toLocaleString()} pts
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
