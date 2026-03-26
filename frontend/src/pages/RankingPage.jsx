// pages/RankingPage.jsx — ATP + WTA tabs
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api/client";

export default function RankingPage() {
  const [atpRanking, setAtpRanking] = useState([]);
  const [wtaRanking, setWtaRanking] = useState([]);
  const [tab, setTab] = useState("atp"); // "atp" | "wta"
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadBoth();
  }, []);

  async function loadBoth() {
    setStatus("Loading rankings...");
    const [atp, wta] = await Promise.allSettled([
      fetch(`${API_URL}/api/atp/ranking`).then((r) => r.json()),
      fetch(`${API_URL}/api/atp/ranking?tour=wta`).then((r) => r.json()),
    ]);
    if (atp.status === "fulfilled") setAtpRanking(atp.value.data ?? []);
    if (wta.status === "fulfilled") setWtaRanking(wta.value.data ?? []);
    setStatus("");
  }

  const ranking = tab === "atp" ? atpRanking : wtaRanking;

  return (
    <div className="page">
      <h2>Singles Rankings</h2>

      <div className="tabs">
        <button
          className={`tab ${tab === "atp" ? "active" : ""}`}
          onClick={() => setTab("atp")}
        >
          🎾 ATP Men
        </button>
        <button
          className={`tab ${tab === "wta" ? "active" : ""}`}
          onClick={() => setTab("wta")}
        >
          🎾 WTA Women
        </button>
      </div>

      {status && <p style={{ color: "var(--text-muted)" }}>{status}</p>}
      {!status && ranking.length === 0 && <p>No ranking data available.</p>}

      {ranking.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Player</th>
                <th className="hide-mobile">Country</th>
                <th>Points</th>
                <th>Profile</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((item, i) => (
                <tr key={item.id ?? i}>
                  <td style={{ fontWeight: 800, color: "var(--primary)" }}>
                    {item.position}
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.player.name}</td>
                  <td
                    className="hide-mobile"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item.player.countryAcr}
                  </td>
                  <td>{Number(item.point).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn-primary"
                      style={{ padding: "5px 12px", fontSize: 12 }}
                      onClick={() =>
                        navigate(`/players/${item.player.id}?tour=${tab}`)
                      }
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
