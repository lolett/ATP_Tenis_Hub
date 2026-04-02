// routes/wiki.js
// Player photos only - tournaments use SVG court visual (design choice)
// Backend downloads image bytes to disk, serves from localhost
// Browser never contacts Wikimedia directly
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const IMG_DIR = path.join(__dirname, "../cache/images");
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

function safeKey(name, type) {
  return `${type}_${name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .slice(0, 80)}`;
}

// Verified working Wikimedia Commons URLs - actual files that exist
// Found by checking en.wikipedia.org page for each player and inspecting thumbnail source
const PLAYER_WIKI_SLUGS = {
  "carlos alcaraz": "Carlos_Alcaraz",
  "jannik sinner": "Jannik_Sinner",
  "novak djokovic": "Novak_Djokovic",
  "alexander zverev": "Alexander_Zverev",
  "lorenzo musetti": "Lorenzo_Musetti",
  "alex de minaur": "Alex_de_Minaur",
  "taylor fritz": "Taylor_Fritz",
  "felix auger aliassime": "Felix_Auger-Aliassime",
  "ben shelton": "Ben_Shelton",
  "daniil medvedev": "Daniil_Medvedev",
  "alexander bublik": "Alexander_Bublik",
  // WTA
  "aryna sabalenka": "Aryna_Sabalenka",
  "elena rybakina": "Elena_Rybakina",
  "cori gauff": "Coco_Gauff",
  "iga swiatek": "Iga_Świątek",
  "jessica pegula": "Jessica_Pegula",
  "amanda anisimova": "Amanda_Anisimova",
  "jasmine paolini": "Jasmine_Paolini",
  "elina svitolina": "Elina_Svitolina",
  "mirra andreeva": "Mirra_Andreeva",
  "karolina muchova": "Karolína_Muchová",
  "victoria mboko": "Victoria_Mboko",
};

function slugFor(name) {
  const lower = name.toLowerCase().trim();
  for (const [key, slug] of Object.entries(PLAYER_WIKI_SLUGS)) {
    if (lower === key || lower.includes(key) || key.includes(lower))
      return slug;
  }
  return name.trim().replace(/\s+/g, "_");
}

async function fetchAndCacheImage(name, type) {
  // Tournaments: skip (use SVG court visual on frontend)
  if (type === "wide") return null;

  const key = safeKey(name, type);
  const imgFile = path.join(IMG_DIR, key + ".jpg");
  const nullFile = path.join(IMG_DIR, key + ".null");

  if (fs.existsSync(imgFile)) return { file: imgFile };
  if (fs.existsSync(nullFile)) return null;

  // Step 1: Get photo URL from Wikipedia REST API (text request - not rate limited)
  const slug = slugFor(name);
  let photoUrl = null;
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
      {
        headers: {
          "User-Agent": "ATPTenisHub/1.0 (educational; DAW project)",
          Accept: "application/json",
        },
      },
    );
    if (res.ok) {
      const data = await res.json();
      // Prefer originalimage (full resolution) over thumbnail (rate-limited)
      photoUrl = data.originalimage?.source ?? data.thumbnail?.source ?? null;
      if (photoUrl) {
        // If using originalimage, resize via URL to max 400px to keep files small
        // Original image URLs don't go through thumbnail generator → no rate limit
        if (data.originalimage?.source) {
          // Use original as-is (it's already the full file, not a generated thumbnail)
          photoUrl = data.originalimage.source;
        } else if (data.thumbnail?.source) {
          // Thumbnail URL - use as-is, accept risk of 429 on first download only
          photoUrl = data.thumbnail.source;
        }
      }
    }
  } catch (e) {
    console.warn(`[WIKI] Summary fetch failed for "${name}":`, e.message);
  }

  if (!photoUrl) {
    fs.writeFileSync(nullFile, "", "utf8");
    return null;
  }

  // Step 2: Download image bytes
  try {
    const res = await fetch(photoUrl, {
      headers: {
        "User-Agent": "ATPTenisHub/1.0 (educational; DAW project)",
        Referer: "https://en.wikipedia.org/",
      },
    });
    if (!res.ok) {
      console.warn(`[WIKI] ❌ ${res.status} for "${name}"`);
      fs.writeFileSync(nullFile, "", "utf8");
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 5000) {
      console.warn(
        `[WIKI] ❌ Too small for "${name}" (${buf.length}B) - probably error page`,
      );
      fs.writeFileSync(nullFile, "", "utf8");
      return null;
    }
    fs.writeFileSync(imgFile, buf);
    console.log(`[WIKI] ✅ ${name} (${Math.round(buf.length / 1024)}KB)`);
    return { file: imgFile };
  } catch (e) {
    console.warn(`[WIKI] ❌ Network error for "${name}":`, e.message);
    fs.writeFileSync(nullFile, "", "utf8");
    return null;
  }
}

// GET /api/wiki/photo?name=Carlos+Alcaraz&type=square
router.get("/photo", async (req, res) => {
  const name = req.query.name?.trim();
  const type = req.query.type === "wide" ? "wide" : "square";

  if (!name || name.length < 2) return res.status(400).send("name required");
  if (type === "wide") return res.status(404).send("tournaments use SVG");

  try {
    const result = await fetchAndCacheImage(name, type);
    if (!result || !fs.existsSync(result.file))
      return res.status(404).send("no image");
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=604800");
    return res.sendFile(result.file);
  } catch (err) {
    console.error("Wiki photo error:", err.message);
    return res.status(500).send("error");
  }
});

// Preload player images only - runs once on startup
let preloadDone = false;
setTimeout(async () => {
  if (preloadDone) return;
  preloadDone = true;

  const players = Object.keys(PLAYER_WIKI_SLUGS);
  const missing = players.filter((name) => {
    const key = safeKey(name, "square");
    return (
      !fs.existsSync(path.join(IMG_DIR, key + ".jpg")) &&
      !fs.existsSync(path.join(IMG_DIR, key + ".null"))
    );
  });

  if (missing.length === 0) {
    console.log("[WIKI] All player images already cached.");
    return;
  }

  console.log(`[WIKI] Downloading ${missing.length} missing player images...`);
  for (const name of missing) {
    await fetchAndCacheImage(name, "square");
    await new Promise((r) => setTimeout(r, 800)); // 800ms between downloads
  }
  console.log("[WIKI] Player image preload complete.");
}, 5000);

module.exports = router;
