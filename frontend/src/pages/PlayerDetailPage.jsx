// pages/PlayerDetailPage.jsx
// Shows full ATP player profile fetched from backend proxy + Wikipedia photo
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../api/client";

// Fetch player photo from Wikipedia REST API (free, no key needed)
// Returns image URL string or null
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

const FORM_COLORS = { w: "#2f8f4e", l: "#c0392b" };

export default function PlayerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [surface, setSurface] = useState([]);
  const [titles, setTitles] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!id) return;
    loadAll();
  }, [id]);

  async function loadAll() {
    setStatus("Loading player...");
    setPlayer(null);
    setPhoto(null);
    setSurface([]);
    setTitles([]);

    try {
      // 1. Player profile
      const profileRes = await fetch(`${API_URL}/api/atp/players/${id}`);
      if (!profileRes.ok) throw new Error(`Profile HTTP ${profileRes.status}`);
      const profileJson = await profileRes.json();
      const p = profileJson.data ?? profileJson;
      setPlayer(p);
      setStatus("");

      // 2. Wikipedia photo (non-blocking)
      if (p.name) {
        fetchWikiPhoto(p.name).then(setPhoto);
      }

      // 3. Surface summary
      const surfaceRes = await fetch(
        `${API_URL}/api/atp/players/${id}/surface`,
      );
      if (surfaceRes.ok) {
        const surfaceJson = await surfaceRes.json();
        const rows = surfaceJson.data ?? [];
        // Use most recent year only
        if (rows.length > 0) setSurface(rows[0].surfaces ?? []);
      }

      // 4. Titles
      const titlesRes = await fetch(`${API_URL}/api/atp/players/${id}/titles`);
      if (titlesRes.ok) {
        const titlesJson = await titlesRes.json();
        setTitles(titlesJson.data ?? []);
      }
    } catch (err) {
      console.error(err);
      setStatus(`Error loading player: ${err.message}`);
    }
  }

  if (status) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "1px solid #e5e7eb",
            color: "#374151",
          }}
        >
          ← Back
        </button>
        <p style={{ marginTop: 16 }}>{status}</p>
      </div>
    );
  }

  if (!player) return null;

  const info = player.information ?? {};

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 32,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
          ← Back
        </button>

        {/* Header */}
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 8,
            padding: 20,
            marginBottom: 24,
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
          }}
        >
          {photo ? (
            <img
              src={photo}
              alt={player.name}
              style={{
                width: 120,
                height: 160,
                objectFit: "cover",
                borderRadius: 8,
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 120,
                height: 160,
                borderRadius: 8,
                background: "#eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                flexShrink: 0,
              }}
            >
              🎾
            </div>
          )}

          <div>
            <h1 style={{ margin: "0 0 4px" }}>{player.name}</h1>
            <p style={{ margin: "0 0 8px", color: "#666" }}>
              {player.country?.name ?? player.countryAcr} · {info.plays || "—"}
            </p>

            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <Stat label="Rank" value={player.curRank?.position ?? "—"} />
              <Stat
                label="Best Rank"
                value={player.bestRank?.position ?? "—"}
              />
              <Stat
                label="Points"
                value={
                  player.points ? Number(player.points).toLocaleString() : "—"
                }
              />
              <Stat label="Status" value={player.playerStatus ?? "—"} />
            </div>
          </div>
        </div>

        {/* Recent form */}
        {player.form?.length > 0 && (
          <Section title="Recent Form">
            <div style={{ display: "flex", gap: 6 }}>
              {player.form.map((r, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    width: 28,
                    height: 28,
                    lineHeight: "28px",
                    textAlign: "center",
                    borderRadius: "50%",
                    fontWeight: 700,
                    fontSize: 12,
                    color: "white",
                    backgroundColor: FORM_COLORS[r.toLowerCase()] ?? "#999",
                  }}
                >
                  {r.toUpperCase()}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Bio */}
        {info.coach && (
          <Section title="Bio">
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
          </Section>
        )}

        {/* Surface summary */}
        {surface.length > 0 && (
          <Section title="Surface Performance (current season)">
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                maxWidth: 400,
              }}
            >
              <thead>
                <tr
                  style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}
                >
                  <th style={{ padding: "6px 10px" }}>Surface</th>
                  <th style={{ padding: "6px 10px" }}>W</th>
                  <th style={{ padding: "6px 10px" }}>L</th>
                  <th style={{ padding: "6px 10px" }}>Win %</th>
                </tr>
              </thead>
              <tbody>
                {surface.map((s) => {
                  const w = Number(s.courtWins ?? 0);
                  const l = Number(s.courtLosses ?? 0);
                  const pct = w + l > 0 ? Math.round((w / (w + l)) * 100) : "—";
                  return (
                    <tr
                      key={s.courtId}
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <td style={{ padding: "6px 10px" }}>{s.court}</td>
                      <td
                        style={{
                          padding: "6px 10px",
                          color: "#2f8f4e",
                          fontWeight: 700,
                        }}
                      >
                        {w}
                      </td>
                      <td
                        style={{
                          padding: "6px 10px",
                          color: "#c0392b",
                          fontWeight: 700,
                        }}
                      >
                        {l}
                      </td>
                      <td style={{ padding: "6px 10px" }}>
                        {pct}
                        {typeof pct === "number" ? "%" : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Section>
        )}

        {/* Titles */}
        {titles.length > 0 && (
          <Section title="Career Titles by Tier">
            <table
              style={{
                borderCollapse: "collapse",
                width: "100%",
                maxWidth: 400,
              }}
            >
              <thead>
                <tr
                  style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}
                >
                  <th style={{ padding: "6px 10px" }}>Tier</th>
                  <th style={{ padding: "6px 10px" }}>Titles</th>
                  <th style={{ padding: "6px 10px" }}>Finals Lost</th>
                </tr>
              </thead>
              <tbody>
                {titles.map((t) => (
                  <tr
                    key={t.tourRankId}
                    style={{ borderBottom: "1px solid #eee" }}
                  >
                    <td style={{ padding: "6px 10px" }}>{t.tourRank}</td>
                    <td style={{ padding: "6px 10px", fontWeight: 700 }}>
                      {t.titlesWon}
                    </td>
                    <td style={{ padding: "6px 10px" }}>{t.titlesLost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}
      </div>
    </div>
  );
}

// Small helper components
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3
        style={{
          borderBottom: "1px solid #eee",
          paddingBottom: 8,
          marginBottom: 12,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "10px 16px",
        minWidth: 80,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>
        {value}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <p style={{ margin: "4px 0" }}>
      <strong>{label}:</strong> {value}
    </p>
  );
}
