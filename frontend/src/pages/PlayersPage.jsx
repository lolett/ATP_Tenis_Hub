// pages/PlayersPage.jsx
// Photo src is /api/wiki/photo?name=X — backend serves image bytes directly.
// Browser never contacts Wikimedia. No CORS. No rate limits. No IP blocks.
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_URL } from "../api/client";

const COUNTRY_COLORS = {
  ESP: ["#c60b1e", "#ffc400"],
  ITA: ["#009246", "#ce2b37"],
  SRB: ["#c6363c", "#0c4076"],
  GER: ["#1a1a1a", "#dd0000"],
  AUS: ["#00008b", "#ef4135"],
  USA: ["#3c3b6e", "#b22234"],
  CAN: ["#ff0000", "#cc0000"],
  RUS: ["#003087", "#e4181c"],
  KAZ: ["#00afca", "#ffd700"],
  GBR: ["#012169", "#c8102e"],
  FRA: ["#002395", "#ed2939"],
  POL: ["#dc143c", "#c8c8c8"],
  CZE: ["#d7141a", "#11457e"],
  BLR: ["#cf101a", "#4aa657"],
  ROU: ["#002B7F", "#FCD116"],
  UKR: ["#005BBB", "#FFD500"],
};
function grad(code) {
  const c = COUNTRY_COLORS[code?.toUpperCase()];
  return c
    ? `linear-gradient(145deg,${c[0]} 0%,${c[1]} 100%)`
    : "linear-gradient(145deg,#374151,#1f2937)";
}
function initials(name) {
  if (!name) return "?";
  const p = name.trim().split(" ");
  return (p[0][0] + (p[p.length - 1][0] ?? "")).toUpperCase();
}

function PlayerCard({ item, tour, onClick }) {
  const [imgFail, setImgFail] = useState(false);
  const code = item.player?.countryAcr ?? "";
  const name = item.player?.name ?? "";

  // Direct img src → backend serves image bytes → browser never touches Wikimedia
  const photoSrc = `${API_URL}/api/wiki/photo?name=${encodeURIComponent(name)}&type=square`;

  return (
    <div onClick={onClick} className="player-card">
      <div className="player-card-photo" style={{ background: grad(code) }}>
        {/* Initials always shown as base layer */}
        <span
          style={{
            position: "absolute",
            fontSize: 40,
            fontWeight: 900,
            color: "rgba(255,255,255,0.85)",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            letterSpacing: 3,
            pointerEvents: "none",
          }}
        >
          {initials(name)}
        </span>

        {/* Photo — loaded from our backend, hides initials when loaded */}
        {!imgFail && (
          <img
            src={photoSrc}
            alt={name}
            onError={() => setImgFail(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
            }}
          />
        )}

        {/* Rank */}
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
            padding: "3px 10px",
            borderRadius: 20,
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          #{item.position}
        </span>
      </div>
      <div style={{ padding: "12px 14px 14px" }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: "var(--text)",
            lineHeight: 1.3,
            marginBottom: 3,
          }}
        >
          {name}
        </div>
        <div
          style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}
        >
          {code}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)" }}>
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

  function handleClick(item) {
    const id = item.player.id;
    if (tab === "wta") navigate(`/players/${id}?tour=wta`);
    else navigate(`/players/${id}?tour=atp`);
  }

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
            onClick={() => handleClick(item)}
          />
        ))}
      </div>
    </div>
  );
}
