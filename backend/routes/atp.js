// routes/atp.js
// Single API source: ATP WTA ITF (tennis-api-atp-wta-itf.p.rapidapi.com)
// Ranking limited to ~11 players on free tier - acceptable for this project
const express = require("express");
const router = express.Router();

const KEY = process.env.RAPIDAPI_KEY;
const HOST = process.env.RAPIDAPI_HOST; // tennis-api-atp-wta-itf.p.rapidapi.com
const BASE = `https://${HOST}/tennis/v2`;

const headers = () => ({
  "Content-Type": "application/json",
  "x-rapidapi-host": HOST,
  "x-rapidapi-key": KEY,
});

async function rapidGet(res, url) {
  try {
    const response = await fetch(url, { headers: headers() });
    if (!response.ok) {
      const text = await response.text();
      console.error(`RapidAPI ${response.status} → ${url}: ${text}`);
      return res
        .status(502)
        .json({ error: `RapidAPI error ${response.status}` });
    }
    res.json(await response.json());
  } catch (err) {
    console.error("RapidAPI fetch failed:", err.message);
    res.status(502).json({ error: "Failed to reach RapidAPI" });
  }
}

// GET /api/atp/ranking
// Returns { data: [ { position, point, player: { id, name, countryAcr, country } } ] }
// player.id is the correct ATP WTA ITF id - use directly for profile navigation
router.get("/ranking", (req, res) => {
  rapidGet(res, `${BASE}/atp/ranking/singles`);
});

// GET /api/atp/players/:id
router.get("/players/:id", (req, res) => {
  rapidGet(
    res,
    `${BASE}/atp/player/profile/${req.params.id}?include=form,ranking,country`,
  );
});

// GET /api/atp/players/:id/surface
router.get("/players/:id/surface", (req, res) => {
  rapidGet(res, `${BASE}/atp/player/surface-summary/${req.params.id}`);
});

// GET /api/atp/players/:id/titles
router.get("/players/:id/titles", (req, res) => {
  rapidGet(res, `${BASE}/atp/player/titles/${req.params.id}`);
});

module.exports = router;
