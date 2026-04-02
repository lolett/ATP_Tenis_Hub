// pages/TournamentsPage.jsx
// Tournament cards use a custom SVG court illustration as the visual header.
// Stadium photos abandoned: Wikimedia CDN rate-limits server IPs consistently.
// The court SVG is a deliberate design choice that clearly communicates
// the surface type (clay/hard/grass/indoor) through color + illustration.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api/client";

const SURFACE = {
  Clay: {
    bg: "#c2410c",
    accent: "#f97316",
    lines: "rgba(255,255,255,0.35)",
    label: "CLAY",
    surfaceColor: "#d97706",
  },
  Hard: {
    bg: "#1d4ed8",
    accent: "#3b82f6",
    lines: "rgba(255,255,255,0.3)",
    label: "HARD",
    surfaceColor: "#2563eb",
  },
  "I.hard": {
    bg: "#4338ca",
    accent: "#818cf8",
    lines: "rgba(255,255,255,0.25)",
    label: "INDOOR",
    surfaceColor: "#6366f1",
  },
  Grass: {
    bg: "#15803d",
    accent: "#22c55e",
    lines: "rgba(255,255,255,0.3)",
    label: "GRASS",
    surfaceColor: "#16a34a",
  },
  Carpet: {
    bg: "#7c3aed",
    accent: "#a78bfa",
    lines: "rgba(255,255,255,0.25)",
    label: "CARPET",
    surfaceColor: "#8b5cf6",
  },
};
function S(court) {
  return (
    SURFACE[court] ?? {
      bg: "#374151",
      accent: "#9ca3af",
      lines: "rgba(255,255,255,0.2)",
      label: court ?? "—",
      surfaceColor: "#6b7280",
    }
  );
}

// Grand Slam indicator (star)
const GRAND_SLAMS = [
  "grand slam",
  "australian open",
  "roland garros",
  "wimbledon",
  "us open",
];
function isGrandSlam(name, round) {
  const n = (name ?? "").toLowerCase();
  const r = (round ?? "").toLowerCase();
  return GRAND_SLAMS.some((gs) => n.includes(gs) || r.includes(gs));
}

// Full court SVG illustration - tennis court top-down view
function CourtSVG({ surf, tournamentName, grandSlam }) {
  const s = S(surf);
  return (
    <div
      style={{
        height: 175,
        background: `linear-gradient(160deg, ${s.bg} 0%, ${s.accent} 100%)`,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Court SVG */}
      <svg
        viewBox="0 0 280 175"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {/* Court background */}
        <rect
          x="40"
          y="20"
          width="200"
          height="135"
          rx="3"
          fill={s.surfaceColor}
          opacity="0.6"
        />
        {/* Court lines */}
        <rect
          x="40"
          y="20"
          width="200"
          height="135"
          rx="3"
          fill="none"
          stroke={s.lines}
          strokeWidth="2.5"
        />
        {/* Center line (net) */}
        <line
          x1="40"
          y1="87"
          x2="240"
          y2="87"
          stroke={s.lines}
          strokeWidth="3"
          strokeDasharray="0"
        />
        {/* Net post indicators */}
        <circle cx="40" cy="87" r="3" fill="rgba(255,255,255,0.6)" />
        <circle cx="240" cy="87" r="3" fill="rgba(255,255,255,0.6)" />
        {/* Service boxes */}
        <line
          x1="140"
          y1="20"
          x2="140"
          y2="155"
          stroke={s.lines}
          strokeWidth="1.5"
        />
        <line
          x1="70"
          y1="47"
          x2="210"
          y2="47"
          stroke={s.lines}
          strokeWidth="1.5"
        />
        <line
          x1="70"
          y1="128"
          x2="210"
          y2="128"
          stroke={s.lines}
          strokeWidth="1.5"
        />
        {/* Singles sidelines */}
        <line
          x1="70"
          y1="20"
          x2="70"
          y2="155"
          stroke={s.lines}
          strokeWidth="1.5"
        />
        <line
          x1="210"
          y1="20"
          x2="210"
          y2="155"
          stroke={s.lines}
          strokeWidth="1.5"
        />
        {/* Baseline center marks */}
        <line
          x1="140"
          y1="20"
          x2="140"
          y2="28"
          stroke={s.lines}
          strokeWidth="1.5"
        />
        <line
          x1="140"
          y1="147"
          x2="140"
          y2="155"
          stroke={s.lines}
          strokeWidth="1.5"
        />
      </svg>

      {/* Surface badge */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 10,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(8px)",
          color: "#fff",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.1em",
          padding: "4px 12px",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        {s.label}
      </div>

      {/* Grand Slam star */}
      {grandSlam && (
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(234,179,8,0.9)",
            backdropFilter: "blur(4px)",
            color: "#000",
            fontSize: 10,
            fontWeight: 900,
            padding: "3px 10px",
            borderRadius: 20,
          }}
        >
          ★ GRAND SLAM
        </div>
      )}
    </div>
  );
}

function TCard({ t, onClick }) {
  const courtName = t.court?.name ?? "—";
  const countryName = t.coutry?.name ?? "—";
  const gs = isGrandSlam(t.name, t.round?.name);

  function fmt(d) {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return d;
    }
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.2s",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      <CourtSVG surf={courtName} tournamentName={t.name} grandSlam={gs} />

      <div style={{ padding: "14px 16px 16px", flex: 1 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 6,
            color: "var(--text)",
            lineHeight: 1.3,
          }}
        >
          {t.name}
        </div>
        <div
          style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}
        >
          📍 {countryName}
        </div>
        <div
          style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}
        >
          📅 {fmt(t.date)}
        </div>
        {t.round?.name && (
          <span
            style={{
              background: gs ? "rgba(234,179,8,0.15)" : "var(--primary-bg)",
              color: gs ? "#b45309" : "var(--primary)",
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 20,
              border: gs ? "1px solid rgba(234,179,8,0.3)" : "none",
            }}
          >
            {t.round.name}
          </span>
        )}
      </div>
    </div>
  );
}

export default function TournamentsPage() {
  const [atp, setAtp] = useState([]);
  const [wta, setWta] = useState([]);
  const [tab, setTab] = useState("atp");
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState("");
  const [year, setYear] = useState("current");
  const navigate = useNavigate();
  const cy = new Date().getFullYear();
  const yr = year === "prev" ? cy - 1 : cy;

  useEffect(() => {
    load();
  }, [yr]);

  async function load() {
    setStatus("Loading...");
    const [a, w] = await Promise.allSettled([
      fetch(`${API_URL}/api/atp/tournaments?tour=atp&year=${yr}`).then((r) =>
        r.json(),
      ),
      fetch(`${API_URL}/api/atp/tournaments?tour=wta&year=${yr}`).then((r) =>
        r.json(),
      ),
    ]);
    if (a.status === "fulfilled") setAtp(a.value.data ?? []);
    if (w.status === "fulfilled") setWta(w.value.data ?? []);
    setStatus("");
  }

  const list = [...(tab === "atp" ? atp : wta)]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .filter(
      (t) =>
        !filter ||
        t.name?.toLowerCase().includes(filter.toLowerCase()) ||
        t.coutry?.name?.toLowerCase().includes(filter.toLowerCase()),
    );

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ marginBottom: 0 }}>Tournament Calendar</h2>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            className={year === "current" ? "btn-primary" : ""}
            style={{ padding: "5px 12px", fontSize: 13 }}
            onClick={() => setYear("current")}
          >
            {cy}
          </button>
          <button
            className={year === "prev" ? "btn-primary" : ""}
            style={{ padding: "5px 12px", fontSize: 13 }}
            onClick={() => setYear("prev")}
          >
            {cy - 1}
          </button>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
        ⚠️ Free API plan shows ~11 tournaments per request. Full {cy} calendar
        shown via static data.
      </p>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div className="tabs" style={{ marginBottom: 0 }}>
          <button
            className={`tab ${tab === "atp" ? "active" : ""}`}
            onClick={() => setTab("atp")}
          >
            ATP Tour
          </button>
          <button
            className={`tab ${tab === "wta" ? "active" : ""}`}
            onClick={() => setTab("wta")}
          >
            WTA Tour
          </button>
        </div>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search tournament or country..."
          style={{ maxWidth: 260 }}
        />
      </div>

      {status && <p style={{ color: "var(--text-muted)" }}>{status}</p>}
      {!status && list.length === 0 && (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
            No data for {yr}. Try {cy - 1}.
          </p>
          <button className="btn-primary" onClick={load}>
            Retry
          </button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(270px,1fr))",
          gap: 20,
        }}
      >
        {list.map((t, i) => (
          <TCard
            key={t.id ?? i}
            t={t}
            onClick={() => t.id && navigate(`/tournaments/${t.id}?tour=${tab}`)}
          />
        ))}
      </div>
    </div>
  );
}
