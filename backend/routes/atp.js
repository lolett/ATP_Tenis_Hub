// routes/atp.js - Proxy to Tennis API ATP WTA ITF (tennis-api-atp-wta-itf.p.rapidapi.com)
// Docs: https://tennisapidoc.matchstat.com
const express = require("express");
const router = express.Router();

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST; // tennis-api-atp-wta-itf.p.rapidapi.com
const BASE_URL = `https://${RAPIDAPI_HOST}/tennis/v2`;

const headers = {
  "Content-Type": "application/json",
  "x-rapidapi-host": RAPIDAPI_HOST,
  "x-rapidapi-key": RAPIDAPI_KEY,
};

// Helper: forward RapidAPI response or return 502
async function rapidGet(res, path) {
  try {
    const response = await fetch(`${BASE_URL}${path}`, { headers });

    if (!response.ok) {
      const text = await response.text();
      console.error(`RapidAPI ${response.status} for ${path}: ${text}`);
      return res
        .status(502)
        .json({ error: `RapidAPI error ${response.status}` });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("RapidAPI fetch failed:", err.message);
    res.status(502).json({ error: "Failed to reach RapidAPI" });
  }
}

// GET /api/atp/ranking
// → /tennis/v2/atp/singlesranking
router.get("/ranking", (req, res) => {
  rapidGet(res, "/atp/ranking/singles/");
});

// GET /api/atp/players?pageSize=50&pageNo=1
// → /tennis/v2/atp/player
router.get("/players", (req, res) => {
  const pageSize = req.query.pageSize || 50;
  const pageNo = req.query.pageNo || 1;
  rapidGet(
    res,
    `/atp/player?pageSize=${pageSize}&pageNo=${pageNo}&filter=PlayerGroup:singles`,
  );
});

// GET /api/atp/players/:id
// → /tennis/v2/atp/player/profile/:id?include=form,ranking,country
router.get("/players/:id", (req, res) => {
  rapidGet(
    res,
    `/atp/player/profile/${req.params.id}?include=form,ranking,country`,
  );
});

// GET /api/atp/players/:id/stats
// → /tennis/v2/atp/player/match-stats/:id
router.get("/players/:id/stats", (req, res) => {
  rapidGet(res, `/atp/player/match-stats/${req.params.id}`);
});

// GET /api/atp/players/:id/surface
// → /tennis/v2/atp/player/surface-summary/:id
router.get("/players/:id/surface", (req, res) => {
  rapidGet(res, `/atp/player/surface-summary/${req.params.id}`);
});

// GET /api/atp/players/:id/titles
// → /tennis/v2/atp/player/titles/:id
router.get("/players/:id/titles", (req, res) => {
  rapidGet(res, `/atp/player/titles/${req.params.id}`);
});

module.exports = router;
