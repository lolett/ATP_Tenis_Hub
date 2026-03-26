// pages/TournamentsPage.jsx
// API confirmed field structure: { id, name, courtId, date, rankId,
//   court: { id, name }, round: { id, name }, coutry: { acronym, name } }
// NOTE: API typo "coutry" (missing 'n') is intentional here
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api/client";

// Alpha2 → flag emoji
function flag(alpha2) {
  if (!alpha2 || alpha2.length !== 2) return "🌍";
  const offset = 127397;
  return String.fromCodePoint(
    ...[...alpha2.toUpperCase()].map((c) => c.charCodeAt(0) + offset),
  );
}

// Surface → visual config
const SURFACE_CONFIG = {
  Clay: {
    color: "#92400e",
    bg: "#fef3c7",
    gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
    icon: "🟤",
  },
  Hard: {
    color: "#1e40af",
    bg: "#dbeafe",
    gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    icon: "🔵",
  },
  "I.hard": {
    color: "#1e40af",
    bg: "#dbeafe",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    icon: "🔵",
  },
  Grass: {
    color: "#166534",
    bg: "#dcfce7",
    gradient: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    icon: "🟢",
  },
  Carpet: {
    color: "#6b21a8",
    bg: "#f3e8ff",
    gradient: "linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)",
    icon: "🟣",
  },
};

function getSurface(courtName) {
  return (
    SURFACE_CONFIG[courtName] ?? {
      color: "#374151",
      bg: "#f3f4f6",
      gradient: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
      icon: "⚪",
    }
  );
}

// Simple tennis court SVG for the tournament card visual
function CourtVisual({ courtName }) {
  const surf = getSurface(courtName);
  const isGrass = courtName?.includes("Grass");
  const isClay = courtName?.includes("Clay");

  return (
    <div
      style={{
        height: 140,
        position: "relative",
        overflow: "hidden",
        background: surf.gradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Court lines SVG */}
      <svg
        viewBox="0 0 200 140"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.25,
        }}
      >
        {/* Court outline */}
        <rect
          x="20"
          y="15"
          width="160"
          height="110"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
        {/* Service boxes */}
        <line
          x1="100"
          y1="15"
          x2="100"
          y2="125"
          stroke="white"
          strokeWidth="1.5"
        />
        <line
          x1="20"
          y1="70"
          x2="180"
          y2="70"
          stroke="white"
          strokeWidth="1.5"
        />
        <line x1="50" y1="40" x2="150" y2="40" stroke="white" strokeWidth="1" />
        <line
          x1="50"
          y1="100"
          x2="150"
          y2="100"
          stroke="white"
          strokeWidth="1"
        />
        {/* Net */}
        <line
          x1="20"
          y1="70"
          x2="180"
          y2="70"
          stroke="white"
          strokeWidth="3"
          strokeDasharray="4,3"
        />
      </svg>
      {/* Surface label */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(4px)",
          color: "white",
          fontWeight: 700,
          fontSize: 13,
          padding: "5px 14px",
          borderRadius: 20,
        }}
      >
        {surf.icon} {courtName ?? "—"}
      </div>
    </div>
  );
}

function TournamentCard({ t, tour, onClick }) {
  const courtName = t.court?.name ?? "—";
  const surf = getSurface(courtName);
  const countryA2 = t.coutry?.acronym ?? ""; // API typo "coutry"
  const countryName = t.coutry?.name ?? "—";

  function formatDate(d) {
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
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      <CourtVisual courtName={courtName} />

      <div style={{ padding: "14px 16px 16px" }}>
        {/* Surface badge */}
        <span
          style={{
            display: "inline-block",
            marginBottom: 8,
            background: surf.bg,
            color: surf.color,
            fontSize: 11,
            fontWeight: 700,
            padding: "2px 10px",
            borderRadius: 20,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {courtName}
        </span>

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
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            marginBottom: 4,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>{flag(countryA2)}</span>
          <span>{countryName}</span>
        </div>

        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          📅 {formatDate(t.date)}
        </div>

        {t.round?.name && (
          <div
            style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}
          >
            {t.round.name}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TournamentsPage() {
  const [atpData, setAtpData] = useState([]);
  const [wtaData, setWtaData] = useState([]);
  const [tab, setTab] = useState("atp");
  const [status, setStatus] = useState("");
  const [filter, setFilter] = useState("");
  const [yearMode, setYearMode] = useState("current"); // "current" | "prev"
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const year = yearMode === "prev" ? currentYear - 1 : currentYear;

  useEffect(() => {
    loadBoth();
  }, [year]);

  async function loadBoth() {
    setStatus("Loading tournaments...");
    const [atp, wta] = await Promise.allSettled([
      fetch(`${API_URL}/api/atp/tournaments?tour=atp&year=${year}`).then((r) =>
        r.json(),
      ),
      fetch(`${API_URL}/api/atp/tournaments?tour=wta&year=${year}`).then((r) =>
        r.json(),
      ),
    ]);
    if (atp.status === "fulfilled") {
      const rows = atp.value.data ?? atp.value ?? [];
      setAtpData(Array.isArray(rows) ? rows : []);
    }
    if (wta.status === "fulfilled") {
      const rows = wta.value.data ?? wta.value ?? [];
      setWtaData(Array.isArray(rows) ? rows : []);
    }
    setStatus("");
  }

  const rawList = tab === "atp" ? atpData : wtaData;
  // Sort by date ascending
  const sorted = [...rawList].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
  const filtered = sorted.filter(
    (t) =>
      t.name?.toLowerCase().includes(filter.toLowerCase()) ||
      t.coutry?.name?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="page">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 8,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ marginBottom: 0 }}>Tournament Calendar</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className={yearMode === "current" ? "btn-primary" : ""}
            style={{ padding: "5px 12px", fontSize: 13 }}
            onClick={() => setYearMode("current")}
          >
            {currentYear}
          </button>
          <button
            className={yearMode === "prev" ? "btn-primary" : ""}
            style={{ padding: "5px 12px", fontSize: 13 }}
            onClick={() => setYearMode("prev")}
          >
            {currentYear - 1}
          </button>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
        ⚠️ Free API plan returns up to ~11 tournaments per request. Showing
        available data.
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
          style={{ maxWidth: 250 }}
        />
      </div>

      {status && <p style={{ color: "var(--text-muted)" }}>{status}</p>}

      {!status && filtered.length === 0 && (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
            No tournament data available for {year}.<br />
            <span style={{ fontSize: 13 }}>
              Try switching to {currentYear - 1} or check the backend is
              running.
            </span>
          </p>
          <button className="btn-primary" onClick={loadBoth}>
            Retry
          </button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {filtered.map((t, i) => (
          <TournamentCard
            key={t.id ?? i}
            t={t}
            tour={tab}
            onClick={() => t.id && navigate(`/tournaments/${t.id}?tour=${tab}`)}
          />
        ))}
      </div>
    </div>
  );
}
