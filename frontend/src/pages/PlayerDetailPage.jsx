// pages/PlayerDetailPage.jsx — supports ?tour=wta query param
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { API_URL } from "../api/client";

async function fetchWikiPhoto(playerName) {
  try {
    const slug = playerName.trim().replace(/\s+/g, "_");
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail?.source ?? null;
  } catch {
    return null;
  }
}

export default function PlayerDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tour = searchParams.get("tour") ?? "atp";
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [surface, setSurface] = useState([]);
  const [titles, setTitles] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (id) loadAll();
  }, [id, tour]);

  async function loadAll() {
    setStatus("Loading player...");
    setPlayer(null);
    setPhoto(null);
    setSurface([]);
    setTitles([]);

    try {
      const profileRes = await fetch(
        `${API_URL}/api/atp/players/${id}?tour=${tour}`,
      );
      if (!profileRes.ok) throw new Error(`HTTP ${profileRes.status}`);
      const profileJson = await profileRes.json();
      const p = profileJson.data ?? profileJson;
      setPlayer(p);
      setStatus("");
      if (p.name) fetchWikiPhoto(p.name).then(setPhoto);

      const [surfaceRes, titlesRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/atp/players/${id}/surface?tour=${tour}`).then(
          (r) => r.json(),
        ),
        fetch(`${API_URL}/api/atp/players/${id}/titles?tour=${tour}`).then(
          (r) => r.json(),
        ),
      ]);
      if (surfaceRes.status === "fulfilled") {
        const rows = surfaceRes.value.data ?? [];
        if (rows.length > 0) setSurface(rows[0].surfaces ?? []);
      }
      if (titlesRes.status === "fulfilled") {
        setTitles(titlesRes.value.data ?? []);
      }
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  }

  if (status)
    return (
      <div className="page">
        <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
          ← Back
        </button>
        <p style={{ color: "var(--text-muted)", marginTop: 16 }}>{status}</p>
      </div>
    );
  if (!player) return null;

  const info = player.information ?? {};

  return (
    <div className="page">
      <button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        ← Back
      </button>

      {/* Header card */}
      <div className="card" style={{ padding: 28, marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* Photo */}
          <div
            style={{
              width: 110,
              height: 150,
              borderRadius: 10,
              overflow: "hidden",
              background: "var(--surface-2)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--border)",
            }}
          >
            {photo ? (
              <img
                src={photo}
                alt={player.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 44 }}>🎾</span>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 4,
              }}
            >
              <h1 style={{ marginBottom: 0 }}>{player.name}</h1>
              <span
                style={{
                  background: tour === "wta" ? "#fce7f3" : "var(--primary-bg)",
                  color: tour === "wta" ? "#be185d" : "var(--primary)",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 20,
                }}
              >
                {tour.toUpperCase()}
              </span>
            </div>
            <p
              style={{
                color: "var(--text-muted)",
                marginBottom: 16,
                fontSize: 14,
              }}
            >
              {player.country?.name ?? player.countryAcr} · {info.plays || "—"}
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { label: "Rank", value: player.curRank?.position ?? "—" },
                { label: "Best Rank", value: player.bestRank?.position ?? "—" },
                {
                  label: "Points",
                  value: player.points
                    ? Number(player.points).toLocaleString()
                    : "—",
                },
                { label: "Status", value: player.playerStatus ?? "—" },
              ].map(({ label, value }) => (
                <div key={label} className="stat-box">
                  <div className="stat-label">{label}</div>
                  <div className="stat-value">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent form */}
      {player.form?.length > 0 && (
        <Section title="Recent Form">
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {player.form.map((r, i) => (
              <span key={i} className={`form-dot ${r.toLowerCase()}`}>
                {r.toUpperCase()}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Bio */}
      {(info.coach || info.birthplace) && (
        <Section title="Biography">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "8px 24px",
            }}
          >
            <InfoRow label="Birthplace" value={info.birthplace} />
            <InfoRow label="Residence" value={info.residence} />
            <InfoRow
              label="Height"
              value={info.height ? `${info.height} cm` : null}
            />
            <InfoRow
              label="Weight"
              value={info.weight ? `${info.weight} kg` : null}
            />
            <InfoRow label="Coach" value={info.coach} />
            <InfoRow label="Turned Pro" value={info.turnedPro} />
            <InfoRow label="Plays" value={info.plays} />
          </div>
        </Section>
      )}

      {/* Surface */}
      {surface.length > 0 && (
        <Section title="Surface Performance (current season)">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Surface</th>
                  <th>W</th>
                  <th>L</th>
                  <th>Win %</th>
                </tr>
              </thead>
              <tbody>
                {surface.map((s) => {
                  const w = Number(s.courtWins ?? 0);
                  const l = Number(s.courtLosses ?? 0);
                  const pct =
                    w + l > 0 ? Math.round((w / (w + l)) * 100) : null;
                  return (
                    <tr key={s.courtId}>
                      <td style={{ fontWeight: 600 }}>{s.court}</td>
                      <td style={{ color: "var(--success)", fontWeight: 700 }}>
                        {w}
                      </td>
                      <td style={{ color: "var(--danger)", fontWeight: 700 }}>
                        {l}
                      </td>
                      <td>{pct !== null ? `${pct}%` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Titles */}
      {titles.length > 0 && (
        <Section title="Career Titles by Tier">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Titles</th>
                  <th>Finals Lost</th>
                </tr>
              </thead>
              <tbody>
                {titles.map((t) => (
                  <tr key={t.tourRankId}>
                    <td>{t.tourRank}</td>
                    <td style={{ fontWeight: 700, color: "var(--success)" }}>
                      {t.titlesWon}
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {t.titlesLost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: 24, marginBottom: 16 }}>
      <h3
        style={{
          marginBottom: 16,
          paddingBottom: 10,
          borderBottom: "1px solid var(--border)",
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <span
        style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}
      >
        {label}:{" "}
      </span>
      <span style={{ fontSize: 14 }}>{value}</span>
    </div>
  );
}
