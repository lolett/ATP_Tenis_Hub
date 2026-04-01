// pages/PlayersPage.jsx
// Windows-safe fallback: gradient + initials (flag emojis not supported on Windows)
// Grid: explicit 4 columns desktop / 3 tablet / 2 mobile via CSS class
// Photos: Wikipedia REST API with face-focused crop (objectPosition: top center)
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api/client";

// Country alpha3 → background gradient color (Windows-safe, no emoji flags)
const COUNTRY_COLORS = {
  ESP: ["#c60b1e", "#ffc400"],
  ITA: ["#009246", "#ce2b37"],
  SRB: ["#c6363c", "#0c4076"],
  GER: ["#000000", "#dd0000"],
  AUS: ["#00008b", "#ef4135"],
  USA: ["#3c3b6e", "#b22234"],
  CAN: ["#ff0000", "#ffffff"],
  RUS: ["#003087", "#e4181c"],
  KAZ: ["#00afca", "#ffd700"],
  GBR: ["#012169", "#c8102e"],
  FRA: ["#002395", "#ed2939"],
  POL: ["#dc143c", "#ffffff"],
  CZE: ["#d7141a", "#11457e"],
  BLR: ["#cf101a", "#4aa657"],
  ROU: ["#002B7F", "#FCD116"],
  JPN: ["#BC002D", "#ffffff"],
  CHN: ["#DE2910", "#FFDE00"],
  BEL: ["#000000", "#FAE042"],
  SUI: ["#FF0000", "#ffffff"],
  ARG: ["#74ACDF", "#ffffff"],
  BRA: ["#009C3B", "#FEDF00"],
  GRE: ["#0D5EAF", "#ffffff"],
  NOR: ["#EF2B2D", "#003087"],
  DEN: ["#C60C30", "#ffffff"],
  NED: ["#AE1C28", "#21468B"],
  CRO: ["#FF0000", "#0093DD"],
  UKR: ["#005BBB", "#FFD500"],
  AUT: ["#ED2939", "#ffffff"],
  SWE: ["#006AA7", "#FECC02"],
  FIN: ["#003580", "#ffffff"],
};

function getCountryGradient(code) {
  const colors = COUNTRY_COLORS[code?.toUpperCase()];
  if (!colors) return "linear-gradient(135deg, #374151, #6b7280)";
  return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Fetch Wikipedia photo with face-focused crop
async function fetchPhoto(name) {
  try {
    const slug = name.trim().replace(/\s+/g, "_");
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const url = data.thumbnail?.source;
    if (!url) return null;
    // 300px gives tighter face-focused crop
    return url.replace(/\/\d+px-/, "/300px-");
  } catch {
    return null;
  }
}

function PlayerCard({ item, tour, onClick }) {
  const [photo, setPhoto] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [imgReady, setImgReady] = useState(false);
  const loaded = useRef(false);

  const code = item.player?.countryAcr ?? "";
  const name = item.player?.name ?? "";
  const gradient = getCountryGradient(code);
  const initials = getInitials(name);

  useEffect(() => {
    if (loaded.current || !name) return;
    loaded.current = true;
    let cancelled = false;
    fetchPhoto(name).then((url) => {
      if (!cancelled && url) setPhoto(url);
    });
    return () => {
      cancelled = true;
    };
  }, [name]);

  return (
    <div onClick={onClick} className="player-card">
      {/* Photo / gradient fallback */}
      <div className="player-card-photo" style={{ background: gradient }}>
        {/* Country gradient always visible as base */}
        {/* Photo overlaid when available */}
        {photo && !imgError && (
          <img
            src={photo}
            alt={name}
            onLoad={() => setImgReady(true)}
            onError={() => setImgError(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
              opacity: imgReady ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          />
        )}

        {/* Initials shown when no photo loaded yet */}
        {(!imgReady || imgError) && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 42,
                fontWeight: 900,
                color: "rgba(255,255,255,0.9)",
                textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                letterSpacing: 2,
              }}
            >
              {initials}
            </span>
          </div>
        )}

        {/* Rank badge */}
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            color: "white",
            fontSize: 11,
            fontWeight: 800,
            padding: "3px 10px",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          #{item.position}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: "12px 14px 14px" }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            marginBottom: 3,
            color: "var(--text)",
            lineHeight: 1.3,
          }}
        >
          {name}
        </div>
        <div
          style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}
        >
          {code}
        </div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--primary)",
          }}
        >
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

      <div className="players-grid">
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
