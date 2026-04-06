# ATP Tenis Hub

ATP Tenis Hub is a web application developed for the DAW intermodular project (PIDAW).

The project is focused on two main functional areas:

- managing personal tennis activities through an authenticated full CRUD system
- consulting professional tennis information through an ATP/WTA module integrated into the same web application

The final version includes user authentication with JWT, protected routes, activity management per user, ATP/WTA rankings, player profiles, tournaments and results, as well as cache/fallback mechanisms in the backend to reduce dependence on the external API.

## Repository

```text
https://github.com/lolett/ATP_Tenis_Hub
```

## Current project status

The current final version includes:

- React + Vite frontend
- Node.js + Express backend
- SQLite database
- User authentication with JWT
- Protected routes
- Full CRUD for personal activities per authenticated user
- Activity filtering by title, type and date range
- ATP and WTA rankings
- Player profiles, titles and surface statistics
- Tournament calendar, tournament detail and results
- Player photos served through the backend
- Cache/fallback support for external tennis data
- API testing with Postman
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

- id
- type
- date
- title
- surface
- score
- notes
- created_at
- updated_at

### Authentication

- User register with email, name and password
- Password validation (min 8 chars, uppercase, lowercase, number, special char)
- JWT login with 7-day token
- Protected routes - redirect to login if no token

### Activities (CRUD)

- Create, read, update, delete activities
- Types: match, training, workout
- Fields: title, date, surface, score, notes
- Filter by title, type and date range, sorted by date

### ATP/WTA Module

- Live ATP and WTA singles ranking (top players with real points)
- Player profiles: biography, current/best rank, playing hand, coach
- Recent form indicators (W/L)
- Surface performance stats (win %, wins, losses per surface)
- Career titles by tier
- Player photos from Wikipedia

## API Endpoints

### Auth

| Method | Endpoint           | Auth | Description        |
| ------ | ------------------ | ---- | ------------------ |
| POST   | /api/auth/register | No   | Register new user  |
| POST   | /api/auth/login    | No   | Login, returns JWT |
| GET    | /api/auth/me       | Yes  | Get current user   |

### Activities

| Method | Endpoint            | Auth | Description          |
| ------ | ------------------- | ---- | -------------------- |
| GET    | /api/activities     | Yes  | List user activities |
| GET    | /api/activities/:id | Yes  | Get activity by id   |
| POST   | /api/activities     | Yes  | Create activity      |
| PUT    | /api/activities/:id | Yes  | Update activity      |
| DELETE | /api/activities/:id | Yes  | Delete activity      |

### ATP / WTA / Tennis data

| Method | Endpoint                         | Auth | Description                  |
| ------ | -------------------------------- | ---- | ---------------------------- |
| GET    | /api/atp/ranking                 | No   | ATP/WTA ranking              |
| GET    | /api/atp/players/:id             | No   | Player profile               |
| GET    | /api/atp/players/:id/surface     | No   | Surface stats                |
| GET    | /api/atp/players/:id/titles      | No   | Career titles                |
| GET    | /api/atp/tournaments             | No   | Tournament calendar          |
| GET    | /api/atp/tournaments/:id/info    | No   | Tournament detail            |
| GET    | /api/atp/tournaments/:id/results | No   | Tournament results           |
| GET    | /api/wiki/photo                  | No   | Player photo through backend |

## Local setup

### 1. Clone the repository

```text
git clone https://github.com/lolett/ATP_Tenis_Hub.git
cd ATP_Tenis_Hub
```

### 2. Run the backend

```text
cd backend
npm install
npm run dev
```

Backend available at:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/health
```

### 3. Run the frontend

Open a new terminal:

```text
cd frontend
npm install
npm run dev
```

Frontend will usually run at:

```text
http://localhost:5173
```

or

```text
http://localhost:5174
```

## API endpoints

### Base URL:

```text
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

```text
backend/data.db
```

The schema is initialized from:

```text
backend/db/schema.sql
```

## Validation and error handling

The backend currently includes:

- required field validation
- duplicate activity check
- proper HTTP status codes:
  - 200 OK
  - 201 Created
  - 204 No Content
  - 400 Bad Request
  - 404 Not Found
  - 409 Conflict
  - 500 Internal Server Error

## Testing

The API has been tested with Postman using requests for:

- register and login
- authenticated activity CRUD
- ranking queries
- player profile queries
- tournament queries

## Future improvements

Possible future work includes:

- favorites and saved players/tournaments
- personal statistics and charts
- export of activities
- email verification and password recovery
- automated testing
- CI/CD workflow
- migration from SQLite to PostgreSQL if the project grows
- broader tennis data coverage with a higher external API plan

## Author

- Manuel Aparicio
- DAW Intermodular Project
