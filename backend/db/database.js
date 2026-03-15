const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// SQLite file route: backend/data.db
const DB_FILE = path.join(__dirname, "..", "data.db");

// Opens the DB (if doesn't exist, SQLite creates the file)
const db = new Database(DB_FILE);

// Inicialize the schema: create tables if doesn't exist
function initDb() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schemaSql);
}

module.exports = { db, initDb };
