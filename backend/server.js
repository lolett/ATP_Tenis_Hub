// server.js - ATP Tenis Hub API (Express + SQLite)
const express = require("express");
const cors = require("cors");
const { initDb, db } = require("./db/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Init DB (creates data.db and tables if missing)
initDb();

// Helper: validate ids
function parsePositiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// GET list
app.get("/api/activities", (req, res) => {
  const rows = db
    .prepare(
      `
      SELECT id, type, date, title, surface, score, notes, created_at, updated_at
      FROM activities
      ORDER BY date DESC, id DESC
    `,
    )
    .all();

  res.json(rows);
});

// GET by id
app.get("/api/activities/:id", (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id)
    return res.status(400).json({ error: "id must be a positive integer" });

  const row = db
    .prepare(
      `
      SELECT id, type, date, title, surface, score, notes, created_at, updated_at
      FROM activities
      WHERE id = ?
    `,
    )
    .get(id);

  if (!row) return res.status(404).json({ error: "activity not found" });
  res.json(row);
});

// POST create
app.post("/api/activities", (req, res) => {
  const { type, date, title, surface, score, notes } = req.body;

  if (!type || !["match", "training"].includes(type)) {
    return res
      .status(400)
      .json({ error: "type must be 'match' or 'training'" });
  }
  if (!date || typeof date !== "string") {
    return res.status(400).json({ error: "date is required (string)" });
  }
  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "title is required (string)" });
  }

  // duplicate checks
  const exists = db
    .prepare(
      `SELECT id FROM activities WHERE type = ? AND date = ? AND title = ?`,
    )
    .get(type, date, title.trim());

  if (exists) {
    return res
      .status(409)
      .json({ error: "activity already exists for that date" });
  }

  const result = db
    .prepare(
      `
      INSERT INTO activities (type, date, title, surface, score, notes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `,
    )
    .run(type, date, title, surface ?? null, score ?? null, notes ?? null);

  const created = db
    .prepare(
      `
      SELECT id, type, date, title, surface, score, notes, created_at, updated_at
      FROM activities
      WHERE id = ?
    `,
    )
    .get(result.lastInsertRowid);

  res.status(201).json(created);
});

// PUT update (partial update behaviour)
app.put("/api/activities/:id", (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id)
    return res.status(400).json({ error: "id must be a positive integer" });

  const current = db.prepare(`SELECT * FROM activities WHERE id = ?`).get(id);
  if (!current) return res.status(404).json({ error: "activity not found" });

  const next = { ...current, ...req.body };

  if (next.type && !["match", "training"].includes(next.type)) {
    return res
      .status(400)
      .json({ error: "type must be 'match' or 'training'" });
  }
  if (!next.date || typeof next.date !== "string") {
    return res.status(400).json({ error: "date is required (string)" });
  }
  if (!next.title || typeof next.title !== "string") {
    return res.status(400).json({ error: "title is required (string)" });
  }

  db.prepare(
    `
    UPDATE activities
    SET type = ?, date = ?, title = ?, surface = ?, score = ?, notes = ?, updated_at = datetime('now')
    WHERE id = ?
  `,
  ).run(
    next.type,
    next.date,
    next.title,
    next.surface ?? null,
    next.score ?? null,
    next.notes ?? null,
    id,
  );

  const updated = db
    .prepare(
      `
      SELECT id, type, date, title, surface, score, notes, created_at, updated_at
      FROM activities
      WHERE id = ?
    `,
    )
    .get(id);

  res.json(updated);
});

// DELETE
app.delete("/api/activities/:id", (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id)
    return res.status(400).json({ error: "id must be a positive integer" });

  const result = db.prepare(`DELETE FROM activities WHERE id = ?`).run(id);
  if (result.changes === 0)
    return res.status(404).json({ error: "activity not found" });

  res.status(204).send();
});

// production log debug --> will be modified in production environment
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
