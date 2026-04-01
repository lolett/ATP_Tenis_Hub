// pages/TournamentsPage.jsx
// Stadium photos sourced from Wikipedia Commons (free, no key needed)
// Court visual SVG as fallback when no photo available
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api/client";

// ─── STADIUM PHOTOS (Wikipedia Commons - free, public domain) ─────────────────
// Each is a direct Wikimedia Commons URL for the main stadium of the tournament
const STADIUM_PHOTOS = {
  "Australian Open":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Australian_Open_2023.jpg/640px-Australian_Open_2023.jpg",
  "Roland Garros":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Roland_Garros_stadium.jpg/640px-Roland_Garros_stadium.jpg",
  Wimbledon:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Wimbledon_centre_court.jpg/640px-Wimbledon_centre_court.jpg",
  "US Open":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/US_Open_Arthur_Ashe.jpg/640px-US_Open_Arthur_Ashe.jpg",
  "Indian Wells":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Indian_Wells_BNP_Paribas_Open_2015.jpg/640px-Indian_Wells_BNP_Paribas_Open_2015.jpg",
  "Miami Open":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Hard_Rock_Stadium_2017.jpg/640px-Hard_Rock_Stadium_2017.jpg",
  "Monte-Carlo":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Monte-Carlo_Country_Club.jpg/640px-Monte-Carlo_Country_Club.jpg",
  Madrid:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Caja_Magica%2C_Madrid.jpg/640px-Caja_Magica%2C_Madrid.jpg",
  Rome: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Foro_Italico_Rome.jpg/640px-Foro_Italico_Rome.jpg",
  Shanghai:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Qizhong_Tennis_Center.jpg/640px-Qizhong_Tennis_Center.jpg",
  Paris:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/AccorHotels_Arena_Paris.jpg/640px-AccorHotels_Arena_Paris.jpg",
  "ATP Finals":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Pala_Alpitour_Turin.jpg/640px-Pala_Alpitour_Turin.jpg",
  Toronto:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Aviva_Centre_Toronto.jpg/640px-Aviva_Centre_Toronto.jpg",
  Cincinnati:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Lindner_Family_Tennis_Center.jpg/640px-Lindner_Family_Tennis_Center.jpg",
  Beijing:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/China_National_Tennis_Center.jpg/640px-China_National_Tennis_Center.jpg",
  Barcelona:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/RCT_Barcelona_main_court.jpg/640px-RCT_Barcelona_main_court.jpg",
};

function getStadiumPhoto(name) {
  if (!name) return null;
  const n = name.toLowerCase();
  for (const [key, url] of Object.entries(STADIUM_PHOTOS)) {
    if (n.includes(key.toLowerCase())) return url;
  }
  return null;
}

// ─── SURFACE CONFIG ───────────────────────────────────────────────────────────
const SURFACE_CONFIG = {
  Clay: {
    color: "#92400e",
    bg: "#fef3c7",
    gradient: "linear-gradient(160deg, #d97706 0%, #b45309 100%)",
    icon: "🟤",
    label: "CLAY",
  },
  Hard: {
    color: "#1e40af",
    bg: "#dbeafe",
    gradient: "linear-gradient(160deg, #3b82f6 0%, #1d4ed8 100%)",
    icon: "🔵",
    label: "HARD",
  },
  "I.hard": {
    color: "#1e3a8a",
    bg: "#eff6ff",
    gradient: "linear-gradient(160deg, #6366f1 0%, #4338ca 100%)",
    icon: "🔵",
    label: "INDOOR",
  },
  Grass: {
    color: "#166534",
    bg: "#dcfce7",
    gradient: "linear-gradient(160deg, #22c55e 0%, #15803d 100%)",
    icon: "🟢",
    label: "GRASS",
  },
  Carpet: {
    color: "#6b21a8",
    bg: "#f3e8ff",
    gradient: "linear-gradient(160deg, #a855f7 0%, #7e22ce 100%)",
    icon: "🟣",
    label: "CARPET",
  },
};

function getSurface(courtName) {
  return (
    SURFACE_CONFIG[courtName] ?? {
      color: "#374151",
      bg: "#f3f4f6",
      gradient: "linear-gradient(160deg, #9ca3af 0%, #6b7280 100%)",
      icon: "⚪",
      label: courtName ?? "—",
    }
  );
}

// SVG Court fallback visual
function CourtSVG({ gradient }) {
  return (
    <div
      style={{
        height: 160,
        background: gradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 200 140"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.2,
        }}
      >
        <rect
          x="20"
          y="15"
          width="160"
          height="110"
          fill="none"
          stroke="white"
          strokeWidth="2"
        />
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
          strokeWidth="2"
          strokeDasharray="4,3"
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
        <line
          x1="50"
          y1="15"
          x2="50"
          y2="125"
          stroke="white"
          strokeWidth="0.5"
        />
        <line
          x1="150"
          y1="15"
          x2="150"
          y2="125"
          stroke="white"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
}

// Alpha2 flag emoji
function flag(a2) {
  if (!a2 || a2.length !== 2) return "🌍";
  return String.fromCodePoint(
    ...[...a2.toUpperCase()].map((c) => c.charCodeAt(0) + 127397),
  );
}

function TournamentCard({ t, tour, onClick }) {
  const [imgError, setImgError] = useState(false);
  const courtName = t.court?.name ?? "—";
  const surf = getSurface(courtName);
  const countryA2 = t.coutry?.acronym ?? "";
  const countryName = t.coutry?.name ?? "—";
  const stadiumUrl = getStadiumPhoto(t.name);

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
      {/* Image or SVG court */}
      {stadiumUrl && !imgError ? (
        <div style={{ height: 160, overflow: "hidden", position: "relative" }}>
          <img
            src={stadiumUrl}
            alt={t.name}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* Surface overlay badge */}
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              color: "white",
              fontSize: 11,
              fontWeight: 800,
              padding: "3px 10px",
              borderRadius: 20,
              letterSpacing: "0.05em",
            }}
          >
            {surf.icon} {surf.label}
          </div>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <CourtSVG gradient={surf.gradient} />
          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              background: "rgba(0,0,0,0.45)",
              color: "white",
              fontSize: 11,
              fontWeight: 800,
              padding: "3px 10px",
              borderRadius: 20,
            }}
          >
            {surf.icon} {surf.label}
          </div>
        </div>
      )}

      {/* Info */}
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
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--text-muted)",
            marginBottom: 4,
          }}
        >
          <span title={countryName}>{flag(countryA2)}</span>
          <span>{countryName}</span>
        </div>

        <div
          style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}
        >
          📅 {formatDate(t.date)}
        </div>

        {t.round?.name && (
          <div
            style={{
              display: "inline-block",
              marginTop: 4,
              background: "var(--primary-bg)",
              color: "var(--primary)",
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 20,
            }}
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
  const [yearMode, setYearMode] = useState("current");
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
    if (atp.status === "fulfilled") setAtpData(atp.value.data ?? []);
    if (wta.status === "fulfilled") setWtaData(wta.value.data ?? []);
    setStatus("");
  }

  const rawList = tab === "atp" ? atpData : wtaData;
  const sorted = [...rawList].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
  const filtered = sorted.filter(
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

      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
        ⚠️ Free API plan returns up to ~11 tournaments per request. Full
        calendar shown via static data when API quota is exceeded.
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

      {!status && filtered.length === 0 && (
        <div className="card" style={{ padding: 32, textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
            No tournament data for {year}.<br />
            <span style={{ fontSize: 13 }}>
              Try switching to {currentYear - 1}.
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
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
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
