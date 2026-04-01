// warmup.js - Pre-populate disk cache for all critical endpoints
// Run: node warmup.js
// Or called automatically on server start
// Fetches all endpoints and saves to cache/ so app works even when API quota hits 429

require("dotenv").config();
const fs = require("fs");
const path = require("path");

const KEY = process.env.RAPIDAPI_KEY;
const HOST = process.env.RAPIDAPI_HOST;
const BASE = `https://${HOST}/tennis/v2`;

const CACHE_DIR = path.join(__dirname, "cache");
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const headers = {
  "Content-Type": "application/json",
  "x-rapidapi-host": HOST,
  "x-rapidapi-key": KEY,
};

function cacheFile(url) {
  return path.join(
    CACHE_DIR,
    url.replace(/[^a-z0-9]/gi, "_").slice(0, 180) + ".json",
  );
}

async function fetchAndCache(url, label) {
  // Skip if already cached and fresh (<12h)
  const file = cacheFile(url);
  if (fs.existsSync(file)) {
    const obj = JSON.parse(fs.readFileSync(file, "utf8"));
    const ageH = (Date.now() - obj.savedAt) / 3600000;
    if (ageH < 12) {
      console.log(`  SKIP (${Math.round(ageH)}h old): ${label}`);
      return;
    }
  }

  try {
    const res = await fetch(url, { headers });
    if (res.status === 429) {
      console.log(`  ❌ 429 QUOTA: ${label}`);
      return;
    }
    if (!res.ok) {
      console.log(`  ❌ ${res.status}: ${label}`);
      return;
    }
    const data = await res.json();
    fs.writeFileSync(
      file,
      JSON.stringify({ savedAt: Date.now(), data }),
      "utf8",
    );
    console.log(`  ✅ CACHED: ${label}`);
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 300));
  } catch (err) {
    console.log(`  ❌ ERROR: ${label} — ${err.message}`);
  }
}

async function warmup() {
  console.log("\n🎾 ATP Tenis Hub — Cache Warmup");
  console.log("================================");
  console.log(`Host: ${HOST}`);
  console.log(`Cache dir: ${CACHE_DIR}\n`);

  // Rankings
  console.log("📊 Rankings:");
  await fetchAndCache(`${BASE}/atp/ranking/singles`, "ATP Singles Ranking");
  await fetchAndCache(`${BASE}/wta/ranking/singles`, "WTA Singles Ranking");

  // ATP Player profiles (all 11 ranked)
  const ATP_PLAYERS = [
    [68074, "Carlos Alcaraz"],
    [47275, "Jannik Sinner"],
    [5992, "Novak Djokovic"],
    [24008, "Alexander Zverev"],
    [63572, "Lorenzo Musetti"],
    [39309, "Alex De Minaur"],
    [29932, "Taylor Fritz"],
    [40434, "Felix Auger Aliassime"],
    [87562, "Ben Shelton"],
    [22807, "Daniil Medvedev"],
    [24245, "Alexander Bublik"],
  ];

  console.log("\n👤 ATP Player Profiles:");
  for (const [id, name] of ATP_PLAYERS) {
    await fetchAndCache(
      `${BASE}/atp/player/profile/${id}?include=form,ranking,country`,
      `${name} (profile)`,
    );
    await fetchAndCache(
      `${BASE}/atp/player/surface-summary/${id}`,
      `${name} (surface)`,
    );
    await fetchAndCache(`${BASE}/atp/player/titles/${id}`, `${name} (titles)`);
  }

  // Tournaments current year
  const year = new Date().getFullYear();
  console.log(`\n🏆 Tournaments ${year}:`);
  await fetchAndCache(
    `${BASE}/atp/tournament/calendar/${year}`,
    `ATP ${year} Calendar`,
  );
  await fetchAndCache(
    `${BASE}/wta/tournament/calendar/${year}`,
    `WTA ${year} Calendar`,
  );
  await fetchAndCache(
    `${BASE}/atp/tournament/calendar/${year - 1}`,
    `ATP ${year - 1} Calendar`,
  );
  await fetchAndCache(
    `${BASE}/wta/tournament/calendar/${year - 1}`,
    `WTA ${year - 1} Calendar`,
  );

  // Cache status
  const files = fs.readdirSync(CACHE_DIR).filter((f) => f.endsWith(".json"));
  console.log(`\n✅ Done. ${files.length} files in cache.`);
}

warmup().catch(console.error);
