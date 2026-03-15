# ATP Tenis Hub

ATP Tenis Hub is a web application developed for the DAW intermodular project (PIDAW).

The project is focused on two main ideas:
- managing personal tennis activities (matches/training) through a full CRUD system
- building a technical foundation that can later be extended with real ATP data such as rankings, tournaments and results

## Current MVP status

The current version includes:

- React + Vite frontend
- Node.js + Express backend
- SQLite database
- Full CRUD for activities:
  - list activities
  - create activity
  - edit activity
  - delete activity
- API tested with Postman
- Git/GitHub version control

## Tech stack

### Frontend
- React
- Vite

### Backend
- Node.js
- Express

### Database
- SQLite
- better-sqlite3

### Testing / Documentation
- Postman
- Git / GitHub

## Project structure

```text
ATP_Tenis_Hub/
├── backend/
│   ├── db/
│   │   ├── database.js
│   │   └── schema.sql
│   ├── package.json
│   ├── server.js
│   └── README.md
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
└── .gitignore
```
## Features implemented
### Activities module

The application currently supports a complete CRUD workflow for activities stored in SQLite.

Each activity includes:
* id
* type
* date
* title
* surface
* score
* notes
* created_at
* updated_at

## Local setup
### 1. Clone the repository
```bash
git clone https://github.com/lolett/ATP_Tenis_Hub.git
cd ATP_Tenis_Hub
```
### 2. Run the backend
```bash
cd backend
npm install
npm run dev
```

Backend available at:
```bash
http://localhost:3000
```
Health check:
```bash
http://localhost:3000/health
```
### 3. Run the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will usually run at:
```bash
http://localhost:5173
```
or
```bash
http://localhost:5174
```
## API endpoints

### Base URL:
```bash
http://localhost:3000
```
### Activities

`GET /api/activities` → list activities

`GET /api/activities/:id` → get activity by id

`POST /api/activities` → create activity

`PUT /api/activities/:id` → update activity

`DELETE /api/activities/:id` → delete activity

Example request body
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
## Database

The backend uses SQLite with a local database file:

```bash
backend/data.db
```
The schema is initialized from:

```bash
backend/db/schema.sql
```

## Validation and error handling

The backend currently includes:

* required field validation
* duplicate activity check
* proper HTTP status codes:
  - 200 OK
  - 201 Created
  - 204 No Content
  - 400 Bad Request
  - 404 Not Found
  - 409 Conflict
  - 500 Internal Server Error

## Testing
The API has been tested with Postman using requests for:

- create
- list
- get by id
- update
- delete

## Future improvements

Planned future work includes:

- ATP ranking integration
- tournament calendar
- results and player information
- better UI/UX
- authentication and user accounts
- migration to PostgreSQL if needed

## Author

- Manuel Aparicio
- DAW Intermodular Project
