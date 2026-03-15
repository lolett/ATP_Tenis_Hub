// server.js: backend entry point (API)
const express = require("express");
const cors = require("cors");
const { initDb, db } = require("./db/database");

const app = express();

// Allow requests from backend (different source/port)
app.use(cors());

// Allow read JSON from body at POST/PUT
app.use(express.json());

// Testing enpoint to check if server works correctly
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/activities", (req, res) => {
  const stmt = db.prepare(`
    SELECT id, type, date, title, surface, score, notes, created_at, updated_at
    FROM activities
    ORDER BY date DESC, id DESC
  `);

  const rows = stmt.all(); // execute and gives back all the rows in an Object's JS array
  res.json(rows);
});

app.get("/api/activities/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const row = db
    .prepare(
      `
    SELECT id, type, date, title, surface, score, notes, created_at, updated_at
    FROM activities
    WHERE id = ?
  `,
    )
    .get(id);

  if (!row) {
    return res.status(404).json({ error: "activity not found" });
  }

  return res.json(row);
});

// UPDATE a register
app.put("/api/activities/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  // 1) Reads the current register
  const current = db
    .prepare(
      `
    SELECT * FROM activities WHERE id = ?
  `,
    )
    .get(id);

  if (!current) {
    return res.status(404).json({ error: "activity not found" });
  }

  // 2) new replace/adds to old
  const next = {
    ...current,
    ...req.body,
  };

  // 3) Minimal validation (protection vs broken)
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

  // 4) Save in BD
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

  // 5) Return the register updated
  const updated = db
    .prepare(
      `
    SELECT id, type, date, title, surface, score, notes, created_at, updated_at
    FROM activities
    WHERE id = ?
  `,
    )
    .get(id);

  return res.json(updated);
});

// Delete register
app.delete("/api/activities/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const result = db.prepare(`DELETE FROM activities WHERE id = ?`).run(id);

  if (result.changes === 0) {
    return res.status(404).json({ error: "activity not found" });
  }

  return res.status(204).send();
});

app.post("/api/activities", (req, res) => {
  const { type, date, title, surface, score, notes } = req.body;

  // Minimal validation
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

  const insert = db.prepare(`
    INSERT INTO activities (type, date, title, surface, score, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const result = insert.run(
    type,
    date,
    title,
    surface ?? null,
    score ?? null,
    notes ?? null,
  );

  const created = db
    .prepare(
      `
    SELECT id, type, date, title, surface, score, notes, created_at, updated_at
    FROM activities
    WHERE id = ?
  `,
    )
    .get(result.lastInsertRowid);

  return res.status(201).json(created);
});

initDb(); // create data.db and table if needed

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
