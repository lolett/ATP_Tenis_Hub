// pages/TournamentsPage.jsx
// Stadium photos fetched dynamically from Wikipedia REST API
// using verified article slugs → always real, verified URLs
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api/client";

// Map tournament name keywords → Wikipedia article slug
// These slugs are verified Wikipedia article names
const WIKI_SLUGS = {
  "Australian Open": "Australian_Open",
  "Roland Garros": "French_Open",
  Wimbledon: "Wimbledon_Championships",
  "US Open": "US_Open_(tennis)",
  "Indian Wells": "BNP_Paribas_Open",
  "Miami Open": "Miami_Open_(tennis)",
  "Monte-Carlo": "Monte-Carlo_Masters",
  "Monte Carlo": "Monte-Carlo_Masters",
  Madrid: "Madrid_Open_(tennis)",
  Rome: "Italian_Open_(tennis)",
  Italian: "Italian_Open_(tennis)",
  Shanghai: "Shanghai_Masters_(tennis)",
  "Paris Masters": "Rolex_Paris_Masters",
  "Rolex Paris": "Rolex_Paris_Masters",
  "ATP Finals": "Nitto_ATP_Finals",
  Nitto: "Nitto_ATP_Finals",
  "WTA Finals": "WTA_Finals",
  Toronto: "Canadian_Open_(tennis)",
  Montreal: "Canadian_Open_(tennis)",
  Cincinnati: "Western_%26_Southern_Open",
  "Western & Southern": "Western_%26_Southern_Open",
  Barcelona: "Barcelona_Open",
  Doha: "Qatar_TotalEnergies_Open",
  Dubai: "Dubai_Duty_Free_Tennis_Championships",
  Beijing: "China_Open_(tennis)",
  "China Open": "China_Open_(tennis)",
  Stuttgart: "Stuttgart_Open",
};

function getWikiSlug(name) {
  if (!name) return null;
  const n = name.toLowerCase();
  for (const [key, slug] of Object.entries(WIKI_SLUGS)) {
    if (n.includes(key.toLowerCase())) return slug;
  }
  return null;
}

// Fetch thumbnail from Wikipedia REST API using article slug
async function fetchWikiPhoto(slug) {
  if (!slug) return null;
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const url = data.thumbnail?.source;
    if (!url) return null;
    // Request a wider image for better stadium visibility
    return url.replace(/\/\d+px-/, "/600px-");
  } catch {
    return null;
  }
}

// ─── SURFACE CONFIG ───────────────────────────────────────────────────────────
const SURFACE = {
  Clay: {
    gradient: "linear-gradient(160deg,#d97706,#b45309)",
    label: "CLAY",
    icon: "🟤",
  },
  Hard: {
    gradient: "linear-gradient(160deg,#3b82f6,#1d4ed8)",
    label: "HARD",
    icon: "🔵",
  },
  "I.hard": {
    gradient: "linear-gradient(160deg,#6366f1,#4338ca)",
    label: "INDOOR",
    icon: "🟣",
  },
  Grass: {
    gradient: "linear-gradient(160deg,#22c55e,#15803d)",
    label: "GRASS",
    icon: "🟢",
  },
  Carpet: {
    gradient: "linear-gradient(160deg,#a855f7,#7e22ce)",
    label: "CARPET",
    icon: "🟤",
  },
};
function getSurface(court) {
  return (
    SURFACE[court] ?? {
      gradient: "linear-gradient(160deg,#6b7280,#4b5563)",
      label: court ?? "—",
      icon: "⚪",
    }
  );
}

// Alpha-2 flag emoji
function flag(a2) {
  if (!a2 || a2.length !== 2) return "🌍";
  return String.fromCodePoint(
    ...[...a2.toUpperCase()].map((c) => c.charCodeAt(0) + 127397),
  );
}

// SVG court lines overlay
function CourtLines() {
  return (
    <svg
      viewBox="0 0 220 150"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.18,
      }}
    >
      <rect
        x="20"
        y="15"
        width="180"
        height="120"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />
      <line
        x1="110"
        y1="15"
        x2="110"
        y2="135"
        stroke="white"
        strokeWidth="1.5"
      />
      <line
        x1="20"
        y1="75"
        x2="200"
        y2="75"
        stroke="white"
        strokeWidth="2"
        strokeDasharray="5,4"
      />
      <line x1="55" y1="42" x2="165" y2="42" stroke="white" strokeWidth="1" />
      <line x1="55" y1="108" x2="165" y2="108" stroke="white" strokeWidth="1" />
      <line x1="55" y1="15" x2="55" y2="135" stroke="white" strokeWidth="0.6" />
      <line
        x1="165"
        y1="15"
        x2="165"
        y2="135"
        stroke="white"
        strokeWidth="0.6"
      />
    </svg>
  );
}

function TournamentCard({ t, onClick }) {
  const [photo, setPhoto] = useState(null);
  const [imgReady, setImgReady] = useState(false);
  const [imgError, setImgError] = useState(false);

  const courtName = t.court?.name ?? "—";
  const surf = getSurface(courtName);
  const countryA2 = t.coutry?.acronym ?? "";
  const countryName = t.coutry?.name ?? "—";

  useEffect(() => {
    const slug = getWikiSlug(t.name);
    if (!slug) return;
    let cancelled = false;
    fetchWikiPhoto(slug).then((url) => {
      if (!cancelled && url) setPhoto(url);
    });
    return () => {
      cancelled = true;
    };
  }, [t.name]);

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
      {/* Visual header */}
      <div
        style={{
          height: 170,
          overflow: "hidden",
          position: "relative",
          background: surf.gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Stadium photo (loaded dynamically) */}
        {photo && !imgError && (
          <img
            src={photo}
            alt={t.name}
            onLoad={() => setImgReady(true)}
            onError={() => setImgError(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              opacity: imgReady ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          />
        )}

        {/* Court lines always shown (on top of photo as overlay, or alone) */}
        <CourtLines />

        {/* Surface label */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            color: "white",
            fontSize: 11,
            fontWeight: 800,
            padding: "4px 12px",
            borderRadius: 20,
            letterSpacing: "0.06em",
            zIndex: 1,
          }}
        >
          {surf.icon} {surf.label}
        </div>
      </div>

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
          <span>{flag(countryA2)}</span>
          <span>{countryName}</span>
        </div>

        <div
          style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}
        >
          📅 {formatDate(t.date)}
        </div>

        {t.round?.name && (
          <span
            style={{
              background: "var(--primary-bg)",
              color: "var(--primary)",
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: 20,
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
        ⚠️ Free API plan shows up to ~11 tournaments. Full calendar available
        via static data when quota is exceeded.
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
          gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
          gap: 20,
        }}
      >
        {filtered.map((t, i) => (
          <TournamentCard
            key={t.id ?? i}
            t={t}
            onClick={() => t.id && navigate(`/tournaments/${t.id}?tour=${tab}`)}
          />
        ))}
      </div>
    </div>
  );
}
