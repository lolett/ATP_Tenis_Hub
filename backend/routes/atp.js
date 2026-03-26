// routes/atp.js - ATP WTA ITF proxy
const express = require("express");
const router = express.Router();

const KEY = process.env.RAPIDAPI_KEY;
const HOST = process.env.RAPIDAPI_HOST;
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

// ─── RANKINGS ────────────────────────────────────────────────────────────────
// Confirmed working endpoint: /{tour}/ranking/singles
router.get("/ranking", (req, res) => {
  const tour = req.query.tour === "wta" ? "wta" : "atp";
  rapidGet(res, `${BASE}/${tour}/ranking/singles`);
});

// ─── PLAYERS ─────────────────────────────────────────────────────────────────
router.get("/players/:id", (req, res) => {
  const tour = req.query.tour === "wta" ? "wta" : "atp";
  rapidGet(
    res,
    `${BASE}/${tour}/player/profile/${req.params.id}?include=form,ranking,country`,
  );
});

router.get("/players/:id/surface", (req, res) => {
  const tour = req.query.tour === "wta" ? "wta" : "atp";
  rapidGet(res, `${BASE}/${tour}/player/surface-summary/${req.params.id}`);
});

router.get("/players/:id/titles", (req, res) => {
  const tour = req.query.tour === "wta" ? "wta" : "atp";
  rapidGet(res, `${BASE}/${tour}/player/titles/${req.params.id}`);
});

// ─── TOURNAMENTS ──────────────────────────────────────────────────────────────
// Confirmed JSON shape: { data: [ { id, name, courtId, date, rankId,
//   court: { id, name }, round: { id, name }, coutry: { acronym, name } } ] }
// NOTE: API has typo "coutry" (missing 'n') - handled in frontend

router.get("/tournaments", (req, res) => {
  const tour = req.query.tour === "wta" ? "wta" : "atp";
  const year = req.query.year || new Date().getFullYear();
  rapidGet(res, `${BASE}/${tour}/tournament/calendar/${year}`);
});

router.get("/tournaments/:id/results", (req, res) => {
  const tour = req.query.tour === "wta" ? "wta" : "atp";
  rapidGet(res, `${BASE}/${tour}/tournament/results/${req.params.id}`);
});

router.get("/tournaments/:id/info", (req, res) => {
  const tour = req.query.tour === "wta" ? "wta" : "atp";
  rapidGet(res, `${BASE}/${tour}/tournament/info/${req.params.id}`);
});

module.exports = router;
