// pages/TournamentDetailPage.jsx — tournament results
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { API_URL } from "../api/client";

export default function TournamentDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tour = searchParams.get("tour") ?? "atp";
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [info, setInfo] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (id) loadAll();
  }, [id]);

  async function loadAll() {
    setStatus("Loading tournament...");
    const [resInfo, resResults] = await Promise.allSettled([
      fetch(`${API_URL}/api/atp/tournaments/${id}/info?tour=${tour}`).then(
        (r) => r.json(),
      ),
      fetch(`${API_URL}/api/atp/tournaments/${id}/results?tour=${tour}`).then(
        (r) => r.json(),
      ),
    ]);

    if (resInfo.status === "fulfilled") {
      const d = resInfo.value?.data ?? resInfo.value;
      setInfo(Array.isArray(d) ? d[0] : d);
    }
    if (resResults.status === "fulfilled") {
      const d = resResults.value?.data ?? resResults.value ?? [];
      setResults(Array.isArray(d) ? d : []);
    }
    setStatus("");
  }

  function getPlayerName(match, side) {
    return (
      match[`player${side}`]?.name ??
      match[`player${side}Name`] ??
      `Player ${side}`
    );
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  if (status)
    return (
      <div className="page">
        <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
          ← Back
        </button>
        <p style={{ color: "var(--text-muted)" }}>{status}</p>
      </div>
    );

  return (
    <div className="page">
      <button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Back
      </button>

      {/* Tournament header */}
      {info && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h2 style={{ marginBottom: 8 }}>
            {info.name ?? info.tourName ?? "Tournament"}
          </h2>
          <div
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              color: "var(--text-muted)",
              fontSize: 14,
            }}
          >
            {info.country?.name && <span>📍 {info.country.name}</span>}
            {info.court?.name && <span>🎾 {info.court.name}</span>}
            {info.dateStart && <span>📅 {formatDate(info.dateStart)}</span>}
            {info.prize && (
              <span>💰 ${Number(info.prize).toLocaleString()}</span>
            )}
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: 16 }}>Match Results</h3>

      {results.length === 0 && !status && (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)" }}>
            No results available yet for this tournament.
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Round</th>
                <th>Winner</th>
                <th>Loser</th>
                <th className="hide-mobile">Score</th>
                <th className="hide-mobile">Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((match, i) => (
                <tr key={match.id ?? i}>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {match.round?.name ?? match.roundName ?? "—"}
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--success)" }}>
                    {getPlayerName(match, 1)}
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>
                    {getPlayerName(match, 2)}
                  </td>
                  <td
                    className="hide-mobile"
                    style={{ fontFamily: "monospace", fontSize: 13 }}
                  >
                    {match.result ?? match.score ?? "—"}
                  </td>
                  <td
                    className="hide-mobile"
                    style={{ color: "var(--text-muted)", fontSize: 12 }}
                  >
                    {formatDate(match.date)}
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
