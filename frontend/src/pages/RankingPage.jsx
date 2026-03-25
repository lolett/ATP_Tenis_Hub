// pages/RankingPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api/client";

export default function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadRanking();
  }, []);

  async function loadRanking() {
    try {
      setStatus("Loading ATP ranking...");
      const res = await fetch(`${API_URL}/api/atp/ranking`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      // Real API: { data: [ { position, point, player: { id, name, countryAcr } } ] }
      const rows = json.data ?? json;
      setRanking(rows);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Error loading ATP ranking.");
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h2>ATP Singles Ranking</h2>

      {status && <p>{status}</p>}

      {!status && ranking.length === 0 && <p>No ranking data available.</p>}

      {ranking.length > 0 && (
        <table
          style={{ borderCollapse: "collapse", width: "100%", maxWidth: 700 }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
              <th style={{ padding: "8px 12px" }}>#</th>
              <th style={{ padding: "8px 12px" }}>Player</th>
              <th style={{ padding: "8px 12px" }}>Country</th>
              <th style={{ padding: "8px 12px" }}>Points</th>
              <th style={{ padding: "8px 12px" }}>Profile</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((item) => {
              const pos = item.position ?? item.rank;
              const pts = item.point ?? item.points;
              const player = item.player ?? item;
              return (
                <tr
                  key={item.id ?? pos}
                  style={{ borderBottom: "1px solid #eee" }}
                >
                  <td style={{ padding: "8px 12px", fontWeight: 700 }}>
                    {pos}
                  </td>
                  <td style={{ padding: "8px 12px" }}>{player.name}</td>
                  <td style={{ padding: "8px 12px" }}>
                    {player.countryAcr ?? player.country}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    {Number(pts).toLocaleString()}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <button onClick={() => navigate(`/players/${player.id}`)}>
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
