// pages/PlayersPage.jsx - ATP/WTA tabs, player photos, 4-per-row layout
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api/client";

// Country alpha3 → alpha2 for flag emoji generation
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
  BOL: "BO",
  ECU: "EC",
  COL: "CO",
  CHI: "CL",
  URU: "UY",
  PER: "PE",
  VEN: "VE",
  MEX: "MX",
  CYP: "CY",
  BUL: "BG",
  SLO: "SI",
  MDA: "MD",
  MON: "MC",
  LUX: "LU",
  ISR: "IL",
  TUN: "TN",
  MAR: "MA",
  EGY: "EG",
  BAH: "BS",
  DOM: "DO",
  TRI: "TT",
  GEO: "GE",
  ARM: "AM",
  AZE: "AZ",
  UZB: "UZ",
  PAK: "PK",
  NZL: "NZ",
  MAS: "MY",
  PHI: "PH",
  IDN: "ID",
  SGP: "SG",
};

function flag(alpha3) {
  const a2 = A3_TO_A2[alpha3?.toUpperCase()];
  if (!a2 || a2.length !== 2) return "🌍";
  const offset = 127397;
  return String.fromCodePoint(...[...a2].map((c) => c.charCodeAt(0) + offset));
}

// Fetch Wikipedia photo for a player name
async function fetchPhoto(name) {
  try {
    const slug = name.trim().replace(/\s+/g, "_");
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

function PlayerCard({ item, tour, onClick }) {
  const [photo, setPhoto] = useState(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    fetchPhoto(item.player.name).then(setPhoto);
  }, [item.player.name]);

  const countryCode = item.player.countryAcr ?? "";

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
      {/* Photo / placeholder */}
      <div
        style={{
          height: 160,
          background: "var(--surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {photo ? (
          <img
            src={photo}
            alt={item.player.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 56 }}>{flag(countryCode)}</span>
        )}
        {/* Rank badge */}
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            background: "var(--primary)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 800,
            padding: "3px 9px",
            borderRadius: 20,
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
            marginBottom: 3,
            color: "var(--text)",
          }}
        >
          {item.player.name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span>{flag(countryCode)}</span>
          <span>{countryCode}</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
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
