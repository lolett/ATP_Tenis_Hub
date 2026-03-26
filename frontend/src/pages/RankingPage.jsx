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
      // ATP WTA ITF: { data: [ { position, point, player: { id, name, countryAcr } } ] }
      setRanking(json.data ?? []);
      setStatus("");
    } catch (err) {
      console.error(err);
      setStatus("Error loading ranking. Is the backend running?");
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
      <h2>ATP Singles Ranking</h2>
      {status && <p>{status}</p>}
      {!status && ranking.length === 0 && <p>No data available.</p>}

      {ranking.length > 0 && (
        <div
          style={{
            background: "white",
            borderRadius: 12,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>#</th>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>
                  Player
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>
                  Country
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>
                  Points
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left" }}>
                  Profile
                </th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((item, i) => (
                <tr
                  key={item.id}
                  style={{
                    borderTop: "1px solid #f3f4f6",
                    background: i % 2 === 0 ? "white" : "#fafafa",
                  }}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 700 }}>
                    {item.position}
                  </td>
                  <td style={{ padding: "12px 16px" }}>{item.player.name}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {item.player.countryAcr}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {Number(item.point).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => navigate(`/players/${item.player.id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
