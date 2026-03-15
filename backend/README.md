# ATP Tenis Hub – Backend (API)

Backend API for the PIDAW project "ATP Tenis Hub".
Built with Node.js + Express and SQLite (better-sqlite3).

## Requirements

- Node.js (LTS recommended)
- npm

## Install

```bash
npm install
```

## Run (development)

```bash
npm run dev
```

### API runs at:

http://localhost:3000

### Health check:

- GET request

http://localhost:3000/health

### Debug (dev only):

Temporary use of /debug-error to check error handler.
After verification it was removed

- GET request

http://localhost:3000/debug-error

```bash// temp error to check error handlers
app.get("/debug-error", (req, res, next) => {
next(new Error("debug error"));
});
```

### Database

SQLite database file is created automatically on start:

```bash
data.db
```

### Schema is defined in:

```bash
db/schema.sql
```

## Endpoints (Activities CRUD)

- Base URL: http://localhost:3000

- GET /api/activities → list activities

- GET /api/activities/:id → get activity by id

- POST /api/activities → create activity

- PUT /api/activities/:id → update activity

- DELETE /api/activities/:id → delete activity

### Payload example

```json
{
  "type": "match",
  "date": "2026-03-08",
  "title": "vs Juan",
  "surface": "clay",
  "score": "6-3 6-4",
  "notes": "Good serves"
}
```

## Testing

Requests were tested using Postman collection:

- "ATP Tenis Hub – Activities CRUD"
