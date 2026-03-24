// pages/RankingPage.jsx
import { useEffect, useState } from "react";
import { API_URL } from "../api/client";

export default function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadRanking();
  }, []);

  async function loadRanking() {
    try {
      setStatus("Loading ATP ranking...");
      const res = await fetch(`${API_URL}/api/atp/ranking`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRanking(data);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Error loading ATP ranking.");
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h2>ATP Ranking</h2>

      {status && <p>{status}</p>}

      {!status && ranking.length === 0 && <p>No ranking data available.</p>}

      {ranking.length > 0 && (
        <table
          style={{ borderCollapse: "collapse", width: "100%", maxWidth: 600 }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
              <th style={{ padding: "8px 12px" }}>#</th>
              <th style={{ padding: "8px 12px" }}>Player</th>
              <th style={{ padding: "8px 12px" }}>Country</th>
              <th style={{ padding: "8px 12px" }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((player) => (
              <tr key={player.rank} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px 12px", fontWeight: 700 }}>
                  {player.rank}
                </td>
                <td style={{ padding: "8px 12px" }}>{player.name}</td>
                <td style={{ padding: "8px 12px" }}>{player.country}</td>
                <td style={{ padding: "8px 12px" }}>
                  {player.points.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
