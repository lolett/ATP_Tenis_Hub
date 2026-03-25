// server.js - ATP Tenis Hub API (Express + SQLite)
const dotenv = require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initDb, db } = require("./db/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// import bcrypt and jwt
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// initial JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

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

// POST create new user
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // 1. mandatori fields
  if (!name || !email || !password || !confirmPassword) {
    return res
      .status(400)
      .json({ error: "name, email and passwords are required" });
  }

  // 2. Confirm password
  if (password !== confirmPassword) {
    return res.status(400).json({ error: "passwords do not match" });
  }

  // 3. Password strength
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
    });
  }

  // 4. Check duplicated emails
  const existing = db
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email.trim().toLowerCase());

  if (existing) {
    return res.status(409).json({ error: "email already registered" });
  }

  // 5. Password hashing
  const passwordHash = await bcrypt.hash(password, 10);

  // 6. Insert user into users table
  const result = db
    .prepare(
      `
      INSERT INTO users (name, email, password_hash)
      VALUES (?, ?, ?)
    `,
    )
    .run(name.trim(), email.trim().toLowerCase(), passwordHash);

  const user = db
    .prepare(
      `
      SELECT id, name, email, created_at
      FROM users
      WHERE id = ?
    `,
    )
    .get(result.lastInsertRowid);

  res.status(201).json(user);
});

// POST users login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = db
    .prepare(
      `
    SELECT id, name, email, password_hash
    FROM users
    WHERE email = ?
  `,
    )
    .get(email.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

// Middleware auth
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";

  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "missing or invalid token" });
  }

  const token = auth.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "invalid or expired token" });
  }
}

// GET auth
app.get("/api/auth/me", requireAuth, (req, res) => {
  const user = db
    .prepare(
      `
    SELECT id, name, email, created_at
    FROM users
    WHERE id = ?
  `,
    )
    .get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }

  res.json(user);
});

// GET list
app.get("/api/activities", requireAuth, (req, res) => {
  const rows = db
    .prepare(
      `
      SELECT id, user_id, type, date, title, surface, score, notes, created_at, updated_at
      FROM activities
      WHERE user_id = ?
      ORDER BY date DESC, id DESC
    `,
    )
    .all(req.user.id);

  res.json(rows);
});

// GET by id
app.get("/api/activities/:id", requireAuth, (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id)
    return res.status(400).json({ error: "id must be a positive integer" });

  const row = db
    .prepare(
      `
      SELECT id, type, date, title, surface, score, notes, created_at, updated_at
      FROM activities
      WHERE id = ? AND user_id = ?
    `,
    )
    .get(id, req.user.id);

  if (!row) return res.status(404).json({ error: "activity not found" });
  res.json(row);
});

// POST create
app.post("/api/activities", requireAuth, (req, res) => {
  const { type, date, title, surface, score, notes } = req.body;

  if (!type || !["match", "training", "workout"].includes(type)) {
    return res
      .status(400)
      .json({ error: "type must be 'match', 'training' or 'workout'" });
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
      `SELECT id FROM activities WHERE user_id = ? AND type = ? AND date = ? AND title = ?`,
    )
    .get(req.user.id, type, date, title.trim());

  if (exists) {
    return res
      .status(409)
      .json({ error: "activity already exists for that date" });
  }

  const result = db
    .prepare(
      `
      INSERT INTO activities (user_id, type, date, title, surface, score, notes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `,
    )
    .run(
      req.user.id,
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

  res.status(201).json(created);
});

// PUT update (partial update behaviour)
app.put("/api/activities/:id", requireAuth, (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id)
    return res.status(400).json({ error: "id must be a positive integer" });

  const current = db
    .prepare(`SELECT * FROM activities WHERE id = ? AND user_id = ?`)
    .get(id, req.user.id);
  if (!current) return res.status(404).json({ error: "activity not found" });

  const next = { ...current, ...req.body };

  if (next.type && !["match", "training", "workout"].includes(next.type)) {
    return res
      .status(400)
      .json({ error: "type must be 'match', 'training' or 'workout'" });
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
    WHERE id = ? AND user_id = ?
  `,
  ).run(
    next.type,
    next.date,
    next.title,
    next.surface ?? null,
    next.score ?? null,
    next.notes ?? null,
    id,
    req.user.id,
  );

  const updated = db
    .prepare(
      `
      SELECT id, type, date, title, surface, score, notes, created_at, updated_at
      FROM activities
      WHERE id = ? AND user_id = ?
    `,
    )
    .get(id, req.user.id);

  res.json(updated);
});

// DELETE
app.delete("/api/activities/:id", requireAuth, (req, res) => {
  const id = parsePositiveInt(req.params.id);
  if (!id)
    return res.status(400).json({ error: "id must be a positive integer" });

  const result = db
    .prepare(`DELETE FROM activities WHERE id = ? AND user_id = ?`)
    .run(id, req.user.id);
  if (result.changes === 0)
    return res.status(404).json({ error: "activity not found" });

  res.status(204).send();
});

const atpRoutes = require("./routes/atp");
app.use("/api/atp", atpRoutes);

// production log debug --> will be modified in production environment
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
