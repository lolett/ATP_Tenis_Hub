// routes/atp.js - ATP WTA ITF proxy with 4-layer fallback
// Layer 1: Fresh disk cache (<24h) - zero API calls
// Layer 2: Live API call - saves to disk
// Layer 3: Stale disk cache - served even if old, on 429/5xx
// Layer 4: Static hardcoded data - last resort, never fails
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const KEY = process.env.RAPIDAPI_KEY;
const HOST = process.env.RAPIDAPI_HOST;
const BASE = `https://${HOST}/tennis/v2`;

const headers = () => ({
  "Content-Type": "application/json",
  "x-rapidapi-host": HOST,
  "x-rapidapi-key": KEY,
});

// ─── DISK CACHE ───────────────────────────────────────────────────────────────
const CACHE_DIR = path.join(__dirname, "../cache");
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

function cacheFile(url) {
  const safe = url.replace(/[^a-z0-9]/gi, "_").slice(0, 180);
  return path.join(CACHE_DIR, safe + ".json");
}

function readCache(url) {
  const file = cacheFile(url);
  try {
    if (!fs.existsSync(file)) return null;
    const obj = JSON.parse(fs.readFileSync(file, "utf8"));
    return {
      data: obj.data,
      savedAt: obj.savedAt,
      stale: Date.now() - obj.savedAt > CACHE_TTL,
    };
  } catch {
    return null;
  }
}

function writeCache(url, data) {
  try {
    fs.writeFileSync(
      cacheFile(url),
      JSON.stringify({ savedAt: Date.now(), data }),
      "utf8",
    );
  } catch (e) {
    console.warn("Cache write failed:", e.message);
  }
}

// ─── STATIC DATA ─────────────────────────────────────────────────────────────
const STATIC = {
  atp_ranking: {
    data: [
      {
        id: 1,
        date: "2026-03-16T00:00:00.000Z",
        point: 13550,
        position: 1,
        player: {
          id: 68074,
          name: "Carlos Alcaraz",
          countryAcr: "ESP",
          country: { name: "Spain", acronym: "ESP" },
        },
      },
      {
        id: 2,
        date: "2026-03-16T00:00:00.000Z",
        point: 11400,
        position: 2,
        player: {
          id: 47275,
          name: "Jannik Sinner",
          countryAcr: "ITA",
          country: { name: "Italy", acronym: "ITA" },
        },
      },
      {
        id: 3,
        date: "2026-03-16T00:00:00.000Z",
        point: 5370,
        position: 3,
        player: {
          id: 5992,
          name: "Novak Djokovic",
          countryAcr: "SRB",
          country: { name: "Serbia", acronym: "SRB" },
        },
      },
      {
        id: 4,
        date: "2026-03-16T00:00:00.000Z",
        point: 4905,
        position: 4,
        player: {
          id: 24008,
          name: "Alexander Zverev",
          countryAcr: "GER",
          country: { name: "Germany", acronym: "GER" },
        },
      },
      {
        id: 5,
        date: "2026-03-16T00:00:00.000Z",
        point: 4365,
        position: 5,
        player: {
          id: 63572,
          name: "Lorenzo Musetti",
          countryAcr: "ITA",
          country: { name: "Italy", acronym: "ITA" },
        },
      },
      {
        id: 6,
        date: "2026-03-16T00:00:00.000Z",
        point: 4185,
        position: 6,
        player: {
          id: 39309,
          name: "Alex De Minaur",
          countryAcr: "AUS",
          country: { name: "Australia", acronym: "AUS" },
        },
      },
      {
        id: 7,
        date: "2026-03-16T00:00:00.000Z",
        point: 4170,
        position: 7,
        player: {
          id: 29932,
          name: "Taylor Fritz",
          countryAcr: "USA",
          country: { name: "United States", acronym: "USA" },
        },
      },
      {
        id: 8,
        date: "2026-03-16T00:00:00.000Z",
        point: 4000,
        position: 8,
        player: {
          id: 40434,
          name: "Felix Auger Aliassime",
          countryAcr: "CAN",
          country: { name: "Canada", acronym: "CAN" },
        },
      },
      {
        id: 9,
        date: "2026-03-16T00:00:00.000Z",
        point: 3860,
        position: 9,
        player: {
          id: 87562,
          name: "Ben Shelton",
          countryAcr: "USA",
          country: { name: "United States", acronym: "USA" },
        },
      },
      {
        id: 10,
        date: "2026-03-16T00:00:00.000Z",
        point: 3610,
        position: 10,
        player: {
          id: 22807,
          name: "Daniil Medvedev",
          countryAcr: "RUS",
          country: { name: "Russia", acronym: "RUS" },
        },
      },
      {
        id: 11,
        date: "2026-03-16T00:00:00.000Z",
        point: 3385,
        position: 11,
        player: {
          id: 24245,
          name: "Alexander Bublik",
          countryAcr: "KAZ",
          country: { name: "Kazakhstan", acronym: "KAZ" },
        },
      },
    ],
  },

  wta_ranking: {
    data: [
      {
        id: 1,
        date: "2026-03-16T00:00:00.000Z",
        point: 1102500,
        position: 1,
        player: {
          id: 200001,
          name: "Aryna Sabalenka",
          countryAcr: "BLR",
          country: { name: "Belarus", acronym: "BLR" },
        },
      },
      {
        id: 2,
        date: "2026-03-16T00:00:00.000Z",
        point: 778300,
        position: 2,
        player: {
          id: 200002,
          name: "Elena Rybakina",
          countryAcr: "KAZ",
          country: { name: "Kazakhstan", acronym: "KAZ" },
        },
      },
      {
        id: 3,
        date: "2026-03-16T00:00:00.000Z",
        point: 741300,
        position: 3,
        player: {
          id: 200003,
          name: "Iga Swiatek",
          countryAcr: "POL",
          country: { name: "Poland", acronym: "POL" },
        },
      },
      {
        id: 4,
        date: "2026-03-16T00:00:00.000Z",
        point: 674800,
        position: 4,
        player: {
          id: 200004,
          name: "Cori Gauff",
          countryAcr: "USA",
          country: { name: "United States", acronym: "USA" },
        },
      },
      {
        id: 5,
        date: "2026-03-16T00:00:00.000Z",
        point: 667800,
        position: 5,
        player: {
          id: 200005,
          name: "Jessica Pegula",
          countryAcr: "USA",
          country: { name: "United States", acronym: "USA" },
        },
      },
      {
        id: 6,
        date: "2026-03-16T00:00:00.000Z",
        point: 618000,
        position: 6,
        player: {
          id: 200006,
          name: "Amanda Anisimova",
          countryAcr: "USA",
          country: { name: "United States", acronym: "USA" },
        },
      },
      {
        id: 7,
        date: "2026-03-16T00:00:00.000Z",
        point: 423200,
        position: 7,
        player: {
          id: 200007,
          name: "Jasmine Paolini",
          countryAcr: "ITA",
          country: { name: "Italy", acronym: "ITA" },
        },
      },
      {
        id: 8,
        date: "2026-03-16T00:00:00.000Z",
        point: 402000,
        position: 8,
        player: {
          id: 200008,
          name: "Elina Svitolina",
          countryAcr: "UKR",
          country: { name: "Ukraine", acronym: "UKR" },
        },
      },
      {
        id: 9,
        date: "2026-03-16T00:00:00.000Z",
        point: 335100,
        position: 9,
        player: {
          id: 200009,
          name: "Victoria Mboko",
          countryAcr: "CAN",
          country: { name: "Canada", acronym: "CAN" },
        },
      },
      {
        id: 10,
        date: "2026-03-16T00:00:00.000Z",
        point: 306600,
        position: 10,
        player: {
          id: 200010,
          name: "Mirra Andreeva",
          countryAcr: "RUS",
          country: { name: "Russia", acronym: "RUS" },
        },
      },
      {
        id: 11,
        date: "2026-03-16T00:00:00.000Z",
        point: 291800,
        position: 11,
        player: {
          id: 200011,
          name: "Ekaterina Alexandrova",
          countryAcr: "RUS",
          country: { name: "Russia", acronym: "RUS" },
        },
      },
    ],
  },

  atp_tournaments: {
    data: [
      {
        id: 21346,
        name: "Australian Open - Melbourne",
        court: { name: "Hard" },
        date: "2026-01-19T00:00:00.000Z",
        round: { name: "Grand Slam" },
        coutry: { acronym: "AU", name: "Australia" },
      },
      {
        id: 21347,
        name: "BNP Paribas Open - Indian Wells",
        court: { name: "Hard" },
        date: "2026-03-09T00:00:00.000Z",
        round: { name: "Masters 1000" },
        coutry: { acronym: "US", name: "United States" },
      },
      {
        id: 21348,
        name: "Miami Open",
        court: { name: "Hard" },
        date: "2026-03-23T00:00:00.000Z",
        round: { name: "Masters 1000" },
        coutry: { acronym: "US", name: "United States" },
      },
      {
        id: 21349,
        name: "Monte-Carlo Rolex Masters",
        court: { name: "Clay" },
        date: "2026-04-06T00:00:00.000Z",
        round: { name: "Masters 1000" },
        coutry: { acronym: "MC", name: "Monaco" },
      },
      {
        id: 21350,
        name: "Barcelona Open Banc Sabadell",
        court: { name: "Clay" },
        date: "2026-04-20T00:00:00.000Z",
        round: { name: "Main tour" },
        coutry: { acronym: "ES", name: "Spain" },
      },
      {
        id: 21351,
        name: "Mutua Madrid Open",
        court: { name: "Clay" },
        date: "2026-05-04T00:00:00.000Z",
        round: { name: "Masters 1000" },
        coutry: { acronym: "ES", name: "Spain" },
      },
      {
        id: 21352,
        name: "Internazionali BNL d'Italia - Rome",
        court: { name: "Clay" },
        date: "2026-05-11T00:00:00.000Z",
        round: { name: "Masters 1000" },
        coutry: { acronym: "IT", name: "Italy" },
      },
      {
        id: 21353,
        name: "Roland Garros - Paris",
        court: { name: "Clay" },
        date: "2026-05-25T00:00:00.000Z",
        round: { name: "Grand Slam" },
        coutry: { acronym: "FR", name: "France" },
      },
      {
        id: 21354,
        name: "Wimbledon",
        court: { name: "Grass" },
        date: "2026-06-29T00:00:00.000Z",
        round: { name: "Grand Slam" },
        coutry: { acronym: "GB", name: "United Kingdom" },
      },
      {
        id: 21355,
        name: "National Bank Open - Montreal",
        court: { name: "Hard" },
        date: "2026-08-03T00:00:00.000Z",
        round: { name: "Masters 1000" },
        coutry: { acronym: "CA", name: "Canada" },
      },
      {
        id: 21356,
        name: "Western & Southern Open - Cincinnati",
        court: { name: "Hard" },
        date: "2026-08-17T00:00:00.000Z",
        round: { name: "Masters 1000" },
        coutry: { acronym: "US", name: "United States" },
      },
      {
        id: 21357,
        name: "US Open - New York",
        court: { name: "Hard" },
        date: "2026-08-31T00:00:00.000Z",
        round: { name: "Grand Slam" },
        coutry: { acronym: "US", name: "United States" },
      },
      {
        id: 21358,
        name: "China Open - Beijing",
        court: { name: "Hard" },
        date: "2026-09-28T00:00:00.000Z",
        round: { name: "Main tour" },
        coutry: { acronym: "CN", name: "China" },
      },
      {
        id: 21359,
        name: "Shanghai Masters",
        court: { name: "Hard" },
        date: "2026-10-05T00:00:00.000Z",
        round: { name: "Masters 1000" },
        coutry: { acronym: "CN", name: "China" },
      },
      {
        id: 21360,
        name: "Erste Bank Open - Vienna",
        court: { name: "I.hard" },
        date: "2026-10-19T00:00:00.000Z",
        round: { name: "Main tour" },
        coutry: { acronym: "AT", name: "Austria" },
      },
      {
        id: 21361,
        name: "Swiss Indoors Basel",
        court: { name: "I.hard" },
        date: "2026-10-19T00:00:00.000Z",
        round: { name: "Main tour" },
        coutry: { acronym: "CH", name: "Switzerland" },
      },
      {
        id: 21362,
        name: "Rolex Paris Masters - Paris",
        court: { name: "I.hard" },
        date: "2026-10-26T00:00:00.000Z",
        round: { name: "Masters 1000" },
        coutry: { acronym: "FR", name: "France" },
      },
      {
        id: 21363,
        name: "BNP Paribas Nordic Open - Stockholm",
        court: { name: "I.hard" },
        date: "2026-11-09T00:00:00.000Z",
        round: { name: "Main tour" },
        coutry: { acronym: "SE", name: "Sweden" },
      },
      {
        id: 21364,
        name: "Nitto ATP Finals - Turin",
        court: { name: "I.hard" },
        date: "2026-11-16T00:00:00.000Z",
        round: { name: "Tour finals" },
        coutry: { acronym: "IT", name: "Italy" },
      },
    ],
  },

  wta_tournaments: {
    data: [
      {
        id: 30001,
        name: "Australian Open - Melbourne",
        court: { name: "Hard" },
        date: "2026-01-19T00:00:00.000Z",
        round: { name: "Grand Slam" },
        coutry: { acronym: "AU", name: "Australia" },
      },
      {
        id: 30002,
        name: "Qatar TotalEnergies Open - Doha",
        court: { name: "Hard" },
        date: "2026-02-10T00:00:00.000Z",
        round: { name: "Main tour" },
        coutry: { acronym: "QA", name: "Qatar" },
      },
      {
        id: 30003,
        name: "Dubai Duty Free Tennis",
        court: { name: "Hard" },
        date: "2026-02-17T00:00:00.000Z",
        round: { name: "Main tour" },
        coutry: { acronym: "AE", name: "UAE" },
      },
      {
        id: 30004,
        name: "BNP Paribas Open - Indian Wells",
        court: { name: "Hard" },
        date: "2026-03-09T00:00:00.000Z",
        round: { name: "Masters" },
        coutry: { acronym: "US", name: "United States" },
      },
      {
        id: 30005,
        name: "Miami Open",
        court: { name: "Hard" },
        date: "2026-03-23T00:00:00.000Z",
        round: { name: "Masters" },
        coutry: { acronym: "US", name: "United States" },
      },
      {
        id: 30006,
        name: "Porsche Tennis Grand Prix",
        court: { name: "Clay" },
        date: "2026-04-20T00:00:00.000Z",
        round: { name: "Main tour" },
        coutry: { acronym: "DE", name: "Germany" },
      },
      {
        id: 30007,
        name: "Mutua Madrid Open",
        court: { name: "Clay" },
        date: "2026-05-04T00:00:00.000Z",
        round: { name: "Masters" },
        coutry: { acronym: "ES", name: "Spain" },
      },
      {
        id: 30008,
        name: "Internazionali BNL d'Italia",
        court: { name: "Clay" },
        date: "2026-05-11T00:00:00.000Z",
        round: { name: "Masters" },
        coutry: { acronym: "IT", name: "Italy" },
      },
      {
        id: 30009,
        name: "Roland Garros - Paris",
        court: { name: "Clay" },
        date: "2026-05-25T00:00:00.000Z",
        round: { name: "Grand Slam" },
        coutry: { acronym: "FR", name: "France" },
      },
      {
        id: 30010,
        name: "Wimbledon",
        court: { name: "Grass" },
        date: "2026-06-29T00:00:00.000Z",
        round: { name: "Grand Slam" },
        coutry: { acronym: "GB", name: "United Kingdom" },
      },
      {
        id: 30011,
        name: "National Bank Open - Toronto",
        court: { name: "Hard" },
        date: "2026-08-03T00:00:00.000Z",
        round: { name: "Masters" },
        coutry: { acronym: "CA", name: "Canada" },
      },
      {
        id: 30012,
        name: "Western & Southern Open",
        court: { name: "Hard" },
        date: "2026-08-17T00:00:00.000Z",
        round: { name: "Masters" },
        coutry: { acronym: "US", name: "United States" },
      },
      {
        id: 30013,
        name: "US Open - New York",
        court: { name: "Hard" },
        date: "2026-08-31T00:00:00.000Z",
        round: { name: "Grand Slam" },
        coutry: { acronym: "US", name: "United States" },
      },
      {
        id: 30014,
        name: "China Open - Beijing",
        court: { name: "Hard" },
        date: "2026-09-28T00:00:00.000Z",
        round: { name: "Main tour" },
        coutry: { acronym: "CN", name: "China" },
      },
      {
        id: 30015,
        name: "WTA Finals - Riyadh",
        court: { name: "I.hard" },
        date: "2026-11-02T00:00:00.000Z",
        round: { name: "Tour finals" },
        coutry: { acronym: "SA", name: "Saudi Arabia" },
      },
    ],
  },

  // ATP player profiles with titles
  players: {
    68074: {
      data: {
        id: 68074,
        name: "Carlos Alcaraz",
        countryAcr: "ESP",
        playerStatus: "Active",
        points: 13550,
        curRank: { position: 1 },
        bestRank: { position: 1 },
        form: ["w", "w", "w", "w", "w", "w", "w", "w", "l", "w", "l"],
        country: { name: "Spain", acronym: "ESP" },
        information: {
          turnedPro: "2018",
          height: "183",
          weight: "74",
          birthplace: "El Palmar, Murcia, Spain",
          residence: "El Palmar, Murcia, Spain",
          plays: "Right-Handed, Two-Handed Backhand",
          coach: "Samuel Lopez",
        },
      },
    },
    47275: {
      data: {
        id: 47275,
        name: "Jannik Sinner",
        countryAcr: "ITA",
        playerStatus: "Active",
        points: 11400,
        curRank: { position: 2 },
        bestRank: { position: 1 },
        form: ["w", "w", "w", "l", "w", "w", "l", "w", "w", "w", "w"],
        country: { name: "Italy", acronym: "ITA" },
        information: {
          turnedPro: "2018",
          height: "188",
          weight: "76",
          birthplace: "San Candido, Italy",
          residence: "Monte Carlo, Monaco",
          plays: "Right-Handed, Two-Handed Backhand",
          coach: "Simone Vagnozzi",
        },
      },
    },
    5992: {
      data: {
        id: 5992,
        name: "Novak Djokovic",
        countryAcr: "SRB",
        playerStatus: "Active",
        points: 5370,
        curRank: { position: 3 },
        bestRank: { position: 1 },
        form: ["w", "w", "l", "w", "l", "w", "w", "l", "w", "w", "l"],
        country: { name: "Serbia", acronym: "SRB" },
        information: {
          turnedPro: "2003",
          height: "188",
          weight: "77",
          birthplace: "Belgrade, Serbia",
          residence: "Monte Carlo, Monaco",
          plays: "Right-Handed, Two-Handed Backhand",
          coach: "Andy Murray",
        },
      },
    },
    24008: {
      data: {
        id: 24008,
        name: "Alexander Zverev",
        countryAcr: "GER",
        playerStatus: "Active",
        points: 4905,
        curRank: { position: 4 },
        bestRank: { position: 2 },
        form: ["w", "l", "w", "w", "l", "w", "w", "w", "l", "w", "w"],
        country: { name: "Germany", acronym: "GER" },
        information: {
          turnedPro: "2013",
          height: "198",
          weight: "85",
          birthplace: "Hamburg, Germany",
          residence: "Monte Carlo, Monaco",
          plays: "Right-Handed, Two-Handed Backhand",
          coach: "David Ferrer",
        },
      },
    },
    63572: {
      data: {
        id: 63572,
        name: "Lorenzo Musetti",
        countryAcr: "ITA",
        playerStatus: "Active",
        points: 4365,
        curRank: { position: 5 },
        bestRank: { position: 5 },
        form: ["w", "w", "l", "w", "w", "l", "w", "w", "w", "l", "w"],
        country: { name: "Italy", acronym: "ITA" },
        information: {
          turnedPro: "2018",
          height: "185",
          weight: "72",
          birthplace: "Carrara, Italy",
          residence: "Carrara, Italy",
          plays: "Right-Handed, One-Handed Backhand",
          coach: "Simone Tartarini",
        },
      },
    },
    39309: {
      data: {
        id: 39309,
        name: "Alex De Minaur",
        countryAcr: "AUS",
        playerStatus: "Active",
        points: 4185,
        curRank: { position: 6 },
        bestRank: { position: 5 },
        form: ["w", "w", "w", "l", "w", "w", "w", "l", "w", "w", "l"],
        country: { name: "Australia", acronym: "AUS" },
        information: {
          turnedPro: "2016",
          height: "183",
          weight: "70",
          birthplace: "Sydney, Australia",
          residence: "Monte Carlo, Monaco",
          plays: "Right-Handed, Two-Handed Backhand",
          coach: "Lleyton Hewitt",
        },
      },
    },
    29932: {
      data: {
        id: 29932,
        name: "Taylor Fritz",
        countryAcr: "USA",
        playerStatus: "Active",
        points: 4170,
        curRank: { position: 7 },
        bestRank: { position: 4 },
        form: ["l", "w", "w", "w", "l", "w", "w", "l", "w", "w", "w"],
        country: { name: "United States", acronym: "USA" },
        information: {
          turnedPro: "2015",
          height: "196",
          weight: "91",
          birthplace: "San Diego, USA",
          residence: "Bradenton, USA",
          plays: "Right-Handed, Two-Handed Backhand",
          coach: "Michael Russell",
        },
      },
    },
    40434: {
      data: {
        id: 40434,
        name: "Felix Auger Aliassime",
        countryAcr: "CAN",
        playerStatus: "Active",
        points: 4000,
        curRank: { position: 8 },
        bestRank: { position: 6 },
        form: ["w", "l", "w", "w", "w", "l", "w", "w", "l", "w", "w"],
        country: { name: "Canada", acronym: "CAN" },
        information: {
          turnedPro: "2017",
          height: "193",
          weight: "83",
          birthplace: "Montreal, Canada",
          residence: "Monte Carlo, Monaco",
          plays: "Right-Handed, Two-Handed Backhand",
          coach: "Toni Nadal",
        },
      },
    },
    87562: {
      data: {
        id: 87562,
        name: "Ben Shelton",
        countryAcr: "USA",
        playerStatus: "Active",
        points: 3860,
        curRank: { position: 9 },
        bestRank: { position: 9 },
        form: ["w", "w", "l", "w", "w", "w", "l", "w", "w", "l", "w"],
        country: { name: "United States", acronym: "USA" },
        information: {
          turnedPro: "2022",
          height: "193",
          weight: "88",
          birthplace: "Atlanta, USA",
          residence: "Gainesville, USA",
          plays: "Left-Handed, Two-Handed Backhand",
          coach: "Bryan Shelton",
        },
      },
    },
    22807: {
      data: {
        id: 22807,
        name: "Daniil Medvedev",
        countryAcr: "RUS",
        playerStatus: "Active",
        points: 3610,
        curRank: { position: 10 },
        bestRank: { position: 1 },
        form: ["l", "w", "w", "l", "w", "w", "w", "l", "w", "w", "l"],
        country: { name: "Russia", acronym: "RUS" },
        information: {
          turnedPro: "2014",
          height: "198",
          weight: "83",
          birthplace: "Moscow, Russia",
          residence: "Monte Carlo, Monaco",
          plays: "Right-Handed, Two-Handed Backhand",
          coach: "Gilles Cervara",
        },
      },
    },
    24245: {
      data: {
        id: 24245,
        name: "Alexander Bublik",
        countryAcr: "KAZ",
        playerStatus: "Active",
        points: 3385,
        curRank: { position: 11 },
        bestRank: { position: 17 },
        form: ["w", "l", "w", "w", "l", "w", "l", "w", "w", "w", "l"],
        country: { name: "Kazakhstan", acronym: "KAZ" },
        information: {
          turnedPro: "2015",
          height: "196",
          weight: "82",
          birthplace: "Gatchina, Russia",
          residence: "Monte Carlo, Monaco",
          plays: "Right-Handed, One-Handed Backhand",
          coach: "Guillaume Marx",
        },
      },
    },
  },

  // Player titles - static data for all 11 ATP ranked players
  titles: {
    68074: {
      data: [
        {
          tourRankId: "1",
          tourRank: "Grand Slam",
          titlesWon: "3",
          titlesLost: "1",
        },
        {
          tourRankId: "3",
          tourRank: "Masters 1000",
          titlesWon: "8",
          titlesLost: "4",
        },
        {
          tourRankId: "2",
          tourRank: "Main tour",
          titlesWon: "12",
          titlesLost: "4",
        },
      ],
    },
    47275: {
      data: [
        {
          tourRankId: "1",
          tourRank: "Grand Slam",
          titlesWon: "3",
          titlesLost: "0",
        },
        {
          tourRankId: "3",
          tourRank: "Masters 1000",
          titlesWon: "5",
          titlesLost: "3",
        },
        {
          tourRankId: "2",
          tourRank: "Main tour",
          titlesWon: "18",
          titlesLost: "6",
        },
      ],
    },
    5992: {
      data: [
        {
          tourRankId: "1",
          tourRank: "Grand Slam",
          titlesWon: "24",
          titlesLost: "10",
        },
        {
          tourRankId: "3",
          tourRank: "Masters 1000",
          titlesWon: "40",
          titlesLost: "12",
        },
        {
          tourRankId: "2",
          tourRank: "Main tour",
          titlesWon: "99",
          titlesLost: "33",
        },
      ],
    },
    24008: {
      data: [
        {
          tourRankId: "1",
          tourRank: "Grand Slam",
          titlesWon: "0",
          titlesLost: "2",
        },
        {
          tourRankId: "3",
          tourRank: "Masters 1000",
          titlesWon: "2",
          titlesLost: "5",
        },
        {
          tourRankId: "2",
          tourRank: "Main tour",
          titlesWon: "22",
          titlesLost: "14",
        },
      ],
    },
    63572: {
      data: [
        {
          tourRankId: "2",
          tourRank: "Main tour",
          titlesWon: "4",
          titlesLost: "2",
        },
      ],
    },
    39309: {
      data: [
        {
          tourRankId: "2",
          tourRank: "Main tour",
          titlesWon: "11",
          titlesLost: "4",
        },
        {
          tourRankId: "3",
          tourRank: "Masters 1000",
          titlesWon: "1",
          titlesLost: "1",
        },
      ],
    },
    29932: {
      data: [
        {
          tourRankId: "1",
          tourRank: "Grand Slam",
          titlesWon: "0",
          titlesLost: "1",
        },
        {
          tourRankId: "2",
          tourRank: "Main tour",
          titlesWon: "8",
          titlesLost: "5",
        },
      ],
    },
    40434: {
      data: [
        {
          tourRankId: "2",
          tourRank: "Main tour",
          titlesWon: "8",
          titlesLost: "5",
        },
        {
          tourRankId: "3",
          tourRank: "Masters 1000",
          titlesWon: "1",
          titlesLost: "3",
        },
      ],
    },
    87562: {
      data: [
        {
          tourRankId: "2",
          tourRank: "Main tour",
          titlesWon: "3",
          titlesLost: "2",
        },
      ],
    },
    22807: {
      data: [
        {
          tourRankId: "1",
          tourRank: "Grand Slam",
          titlesWon: "1",
          titlesLost: "4",
        },
        {
          tourRankId: "3",
          tourRank: "Masters 1000",
          titlesWon: "6",
          titlesLost: "8",
        },
        {
          tourRankId: "2",
          tourRank: "Main tour",
          titlesWon: "21",
          titlesLost: "12",
        },
      ],
    },
    24245: {
      data: [
        {
          tourRankId: "2",
          tourRank: "Main tour",
          titlesWon: "2",
          titlesLost: "3",
        },
      ],
    },
  },

  // Surface stats for all 11 ATP players (2025 season data)
  surface: {
    68074: {
      data: [
        {
          year: "2025",
          surfaces: [
            { courtId: 1, court: "Hard", courtWins: "17", courtLosses: "2" },
            { courtId: 2, court: "Clay", courtWins: "12", courtLosses: "1" },
            { courtId: 3, court: "Grass", courtWins: "7", courtLosses: "1" },
          ],
        },
      ],
    },
    47275: {
      data: [
        {
          year: "2025",
          surfaces: [
            { courtId: 1, court: "Hard", courtWins: "22", courtLosses: "1" },
            { courtId: 2, court: "Clay", courtWins: "6", courtLosses: "2" },
            { courtId: 3, court: "Grass", courtWins: "4", courtLosses: "1" },
          ],
        },
      ],
    },
    5992: {
      data: [
        {
          year: "2025",
          surfaces: [
            { courtId: 1, court: "Hard", courtWins: "8", courtLosses: "4" },
            { courtId: 2, court: "Clay", courtWins: "5", courtLosses: "3" },
            { courtId: 3, court: "Grass", courtWins: "3", courtLosses: "2" },
          ],
        },
      ],
    },
    24008: {
      data: [
        {
          year: "2025",
          surfaces: [
            { courtId: 1, court: "Hard", courtWins: "14", courtLosses: "4" },
            { courtId: 2, court: "Clay", courtWins: "8", courtLosses: "3" },
            { courtId: 3, court: "Grass", courtWins: "6", courtLosses: "2" },
          ],
        },
      ],
    },
    63572: {
      data: [
        {
          year: "2025",
          surfaces: [
            { courtId: 1, court: "Hard", courtWins: "5", courtLosses: "4" },
            { courtId: 2, court: "Clay", courtWins: "14", courtLosses: "3" },
          ],
        },
      ],
    },
    39309: {
      data: [
        {
          year: "2025",
          surfaces: [
            { courtId: 1, court: "Hard", courtWins: "18", courtLosses: "4" },
            { courtId: 2, court: "Clay", courtWins: "7", courtLosses: "3" },
          ],
        },
      ],
    },
    29932: {
      data: [
        {
          year: "2025",
          surfaces: [
            { courtId: 1, court: "Hard", courtWins: "16", courtLosses: "5" },
            { courtId: 2, court: "Clay", courtWins: "5", courtLosses: "4" },
          ],
        },
      ],
    },
    40434: {
      data: [
        {
          year: "2025",
          surfaces: [
            { courtId: 1, court: "Hard", courtWins: "12", courtLosses: "5" },
            { courtId: 2, court: "Clay", courtWins: "6", courtLosses: "4" },
          ],
        },
      ],
    },
    87562: {
      data: [
        {
          year: "2025",
          surfaces: [
            { courtId: 1, court: "Hard", courtWins: "14", courtLosses: "5" },
          ],
        },
      ],
    },
    22807: {
      data: [
        {
          year: "2025",
          surfaces: [
            { courtId: 1, court: "Hard", courtWins: "10", courtLosses: "7" },
            { courtId: 2, court: "Clay", courtWins: "4", courtLosses: "4" },
          ],
        },
      ],
    },
    24245: {
      data: [
        {
          year: "2025",
          surfaces: [
            { courtId: 1, court: "Hard", courtWins: "9", courtLosses: "7" },
            { courtId: 2, court: "Clay", courtWins: "5", courtLosses: "4" },
          ],
        },
      ],
    },
  },
};

// ─── CACHE-FIRST FETCH ────────────────────────────────────────────────────────
async function cachedGet(res, url, fallback = null) {
  const cached = readCache(url);

  // Layer 1: fresh cache
  if (cached && !cached.stale) {
    console.log(`[CACHE HIT] ${url.split("/tennis/v2/")[1] ?? url}`);
    return res.json(cached.data);
  }

  // Layer 2: live API
  try {
    const response = await fetch(url, { headers: headers() });

    if (
      response.status === 429 ||
      response.status === 403 ||
      response.status === 502 ||
      !response.ok
    ) {
      const text = await response.text().catch(() => "");
      console.warn(
        `[${response.status}] Quota/error for ${url.split("/tennis/v2/")[1] ?? url}`,
      );

      // Layer 3: stale cache
      if (cached) {
        console.log(`[STALE CACHE] Serving stale data`);
        return res.json({ ...cached.data, _cached: true });
      }
      // Layer 4: static fallback
      if (fallback) {
        console.log(`[STATIC FALLBACK] Serving hardcoded data`);
        return res.json({ ...fallback, _static: true });
      }
      return res.status(503).json({
        error: "API quota exceeded. No cached data available.",
        hint: "Register a new free account at rapidapi.com and update RAPIDAPI_KEY in backend/.env",
      });
    }

    const data = await response.json();
    writeCache(url, data);
    console.log(`[API OK] ${url.split("/tennis/v2/")[1] ?? url} → cached`);
    return res.json(data);
  } catch (err) {
    console.error("Fetch error:", err.message);
    if (cached) return res.json({ ...cached.data, _cached: true });
    if (fallback) return res.json({ ...fallback, _static: true });
    return res.status(503).json({ error: "Network error and no cached data." });
  }
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

router.get("/ranking", (req, res) => {
  const tour = req.query.tour === "wta" ? "wta" : "atp";
  const fb = tour === "wta" ? STATIC.wta_ranking : STATIC.atp_ranking;
  cachedGet(res, `${BASE}/${tour}/ranking/singles`, fb);
});

router.get("/players/:id", (req, res) => {
  const tour = req.query.tour === "wta" ? "wta" : "atp";
  const id = Number(req.params.id);
  const fb = STATIC.players[id] ?? null;
  cachedGet(
    res,
    `${BASE}/${tour}/player/profile/${id}?include=form,ranking,country`,
    fb,
  );
});

router.get("/players/:id/surface", (req, res) => {
  const tour = req.query.tour === "wta" ? "wta" : "atp";
  const id = Number(req.params.id);
  const fb = STATIC.surface[id] ?? null;
  cachedGet(res, `${BASE}/${tour}/player/surface-summary/${id}`, fb);
});

router.get("/players/:id/titles", (req, res) => {
  const tour = req.query.tour === "wta" ? "wta" : "atp";
  const id = Number(req.params.id);
  const fb = STATIC.titles[id] ?? null;
  cachedGet(res, `${BASE}/${tour}/player/titles/${id}`, fb);
});

router.get("/tournaments", (req, res) => {
  const tour = req.query.tour === "wta" ? "wta" : "atp";
  const year = req.query.year || new Date().getFullYear();
  const fb = tour === "wta" ? STATIC.wta_tournaments : STATIC.atp_tournaments;
  cachedGet(res, `${BASE}/${tour}/tournament/calendar/${year}`, fb);
});

router.get("/tournaments/:id/results", (req, res) => {
  const tour = req.query.tour === "wta" ? "wta" : "atp";
  cachedGet(res, `${BASE}/${tour}/tournament/results/${req.params.id}`, null);
});

router.get("/tournaments/:id/info", (req, res) => {
  const tour = req.query.tour === "wta" ? "wta" : "atp";
  cachedGet(res, `${BASE}/${tour}/tournament/info/${req.params.id}`, null);
});

// Dev: cache status
router.get("/cache/status", (req, res) => {
  try {
    const files = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith(".json"));
    res.json({
      totalCachedFiles: files.length,
      cacheDir: CACHE_DIR,
      entries: files.map((f) => {
        try {
          const raw = JSON.parse(
            fs.readFileSync(path.join(CACHE_DIR, f), "utf8"),
          );
          return {
            file: f,
            savedAt: new Date(raw.savedAt).toISOString(),
            stale: Date.now() - raw.savedAt > CACHE_TTL,
          };
        } catch {
          return { file: f, error: "corrupt" };
        }
      }),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
