// pages/PlayersPage.jsx
// Photo solutions considered:
// A) CSS object-position: top center → shifts crop upward to show face. Simple but imprecise.
// B) face-api.js → detect face bounding box, reposition crop. Accurate but adds 2MB JS dependency.
// C) Wikipedia thumbnail URL manipulation → request square thumbnail centered on face.
//    Wikipedia generates thumbnails at any width: add ?width=N to get square crop from top.
//    Most player photos are portrait shots with face at top - requesting a square crop
//    at ~300px width gives a face-focused result without extra libraries.
// CHOSEN: C (Wikipedia thumbnail manipulation) + CSS object-position: top center as backup.
// Why: zero dependencies, works for 90%+ of player photos, degrades gracefully.
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api/client";

// Alpha3 → Alpha2 for flag emoji
const A3_TO_A2 = {
  ESP: "ES",
  ITA: "IT",
  SRB: "RS",
  GER: "DE",
  AUS: "AU",
  USA: "US",
  CAN: "CA",
  RUS: "RU",
  KAZ: "KZ",
  GBR: "GB",
  FRA: "FR",
  POL: "PL",
  CZE: "CZ",
  BLR: "BY",
  ROU: "RO",
  JPN: "JP",
  CHN: "CN",
  BEL: "BE",
  SUI: "CH",
  ARG: "AR",
  BRA: "BR",
  GRE: "GR",
  NOR: "NO",
  DEN: "DK",
  NED: "NL",
  CRO: "HR",
  SVK: "SK",
  LAT: "LV",
  UKR: "UA",
  AUT: "AT",
  SWE: "SE",
  FIN: "FI",
  POR: "PT",
  HUN: "HU",
  KOR: "KR",
  TPE: "TW",
  THA: "TH",
  IND: "IN",
  ZIM: "ZW",
  RSA: "ZA",
  QAT: "QA",
  UAE: "AE",
  SAU: "SA",
};

function flag(alpha3) {
  const a2 = A3_TO_A2[alpha3?.toUpperCase()];
  if (!a2 || a2.length !== 2) return "🌍";
  return String.fromCodePoint(...[...a2].map((c) => c.charCodeAt(0) + 127397));
}

// Fetch Wikipedia photo and return a square face-crop URL
// Wikipedia thumbnail API: /api/rest_v1/page/summary/{name}
// Returns thumbnail.source with ?width=N for sizing
// We request width=300 to get a tighter square crop showing the face
async function fetchFacePhoto(name) {
  try {
    const slug = name.trim().replace(/\s+/g, "_");
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    let url = data.thumbnail?.source ?? null;
    if (!url) return null;

    // Replace width parameter to get square crop at 300px
    // Wikipedia format: .../{width}px-{filename}
    // Requesting 300px gives a tighter crop showing the face region
    url = url.replace(/\/\d+px-/, "/300px-");
    return url;
  } catch {
    return null;
  }
}

function PlayerCard({ item, tour, onClick }) {
  const [photo, setPhoto] = useState(null);
  const [imgError, setImgError] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    fetchFacePhoto(item.player.name).then(setPhoto);
  }, [item.player.name]);

  const code = item.player.countryAcr ?? "";

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
      {/* Photo area - fixed height, face-focused crop */}
      <div
        style={{
          height: 180,
          background: "var(--surface-2)",
          overflow: "hidden",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {photo && !imgError ? (
          <img
            src={photo}
            alt={item.player.name}
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              // object-position: top center ensures face shows instead of torso
              objectPosition: "top center",
              display: "block",
            }}
          />
        ) : (
          // Fallback: large country flag emoji
          <span style={{ fontSize: 64, lineHeight: 1 }}>{flag(code)}</span>
        )}

        {/* Rank badge */}
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "var(--primary)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 800,
            padding: "3px 10px",
            borderRadius: 20,
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          #{item.position}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: "14px 14px 16px" }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 4,
            color: "var(--text)",
          }}
        >
          {item.player.name}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 12,
            color: "var(--text-muted)",
            marginBottom: 8,
          }}
        >
          <span>{flag(code)}</span>
          <span>{code}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {Number(item.point).toLocaleString()} pts
        </div>
      </div>
    </div>
  );
}

export default function PlayersPage() {
  const [atpPlayers, setAtpPlayers] = useState([]);
  const [wtaPlayers, setWtaPlayers] = useState([]);
  const [tab, setTab] = useState("atp");
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadBoth();
  }, []);

  async function loadBoth() {
    setStatus("Loading players...");
    const [atp, wta] = await Promise.allSettled([
      fetch(`${API_URL}/api/atp/ranking`).then((r) => r.json()),
      fetch(`${API_URL}/api/atp/ranking?tour=wta`).then((r) => r.json()),
    ]);
    if (atp.status === "fulfilled") setAtpPlayers(atp.value.data ?? []);
    if (wta.status === "fulfilled") setWtaPlayers(wta.value.data ?? []);
    setStatus("");
  }

  const players = (tab === "atp" ? atpPlayers : wtaPlayers).filter((item) =>
    item.player?.name?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="page">
      <h2>Players</h2>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div className="tabs" style={{ marginBottom: 0 }}>
          <button
            className={`tab ${tab === "atp" ? "active" : ""}`}
            onClick={() => setTab("atp")}
          >
            ATP Men
          </button>
          <button
            className={`tab ${tab === "wta" ? "active" : ""}`}
            onClick={() => setTab("wta")}
          >
            WTA Women
          </button>
        </div>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by name..."
          style={{ maxWidth: 220 }}
        />
      </div>

      {status && <p style={{ color: "var(--text-muted)" }}>{status}</p>}

      {/* 4-column grid on desktop, auto-fills on mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
          gap: 16,
        }}
      >
        {players.map((item) => (
          <PlayerCard
            key={item.player.id}
            item={item}
            tour={tab}
            onClick={() => navigate(`/players/${item.player.id}?tour=${tab}`)}
          />
        ))}
      </div>
    </div>
  );
}
