// pages/PlayersPage.jsx
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
      // ATP WTA ITF: { data: [ { position, point, player: { id, name, countryAcr } } ] }
      setPlayers(json.data ?? []);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Error loading players. Is the backend running?");
    }
  }

  const filtered = players.filter((item) =>
    item.player?.name?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
      <h2>ATP Players</h2>

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search by name..."
        style={{ marginBottom: 20, maxWidth: 280 }}
      />

      {status && <p>{status}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {filtered.map((item) => (
          <div
            key={item.player.id}
            onClick={() => navigate(`/players/${item.player.id}`)}
            style={{
              width: 180,
              padding: 16,
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              cursor: "pointer",
              transition: "box-shadow 0.15s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "none";
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>🎾</div>
            <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14 }}>
              {item.player.name}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>
              {item.player.countryAcr}
            </div>
            <div style={{ fontSize: 12 }}>
              <span
                style={{
                  fontWeight: 700,
                  color: "#2d6cdf",
                  background: "#eff6ff",
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                #{item.position}
              </span>{" "}
              <span style={{ color: "#6b7280" }}>
                {Number(item.point).toLocaleString()} pts
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
