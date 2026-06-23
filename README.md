# BookIt — Live Event Booking Platform

A full-stack event booking app: organizers create events with limited seats, users browse and book, and organizers view attendees and analytics.

**Stack:** React (Vite + React Router) · Express · PostgreSQL · Prisma

## Quick start (Docker — recommended)

Prerequisites: [Docker](https://docs.docker.com/get-docker/) and Docker Compose.

```bash
docker compose up --build
```

Then open:

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3000/health

Migrations and seed run automatically when the backend container starts.

### Seed accounts

| Role      | Email                 | Password    |
|-----------|-----------------------|-------------|
| Organizer | organizer@bookit.com  | password123 |
| User      | user@bookit.com       | password123 |
| User      | jane@bookit.com       | password123 |

## Local development (without Docker)

### 1. Start PostgreSQL

Use Docker for just the database:

```bash
docker compose up db -d
```

Or point `DATABASE_URL` at any PostgreSQL 16+ instance.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # optional — defaults work with docker compose db
npm run db:setup       # migrate + seed
npm run dev            # http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

Set `VITE_API_URL=http://localhost:3000` in `frontend/.env` if the API is not on that URL.

## Database commands

From `backend/`:

| Command            | Description                          |
|--------------------|--------------------------------------|
| `npm run migrate`  | Apply migrations to the database     |
| `npm run seed`     | Load sample users, events, bookings  |
| `npm run db:setup` | Migrate + seed in one step           |

## API overview

| Method | Endpoint                         | Description                    |
|--------|----------------------------------|--------------------------------|
| POST   | `/auth/signup`                   | Register                       |
| POST   | `/auth/login`                    | Log in                         |
| POST   | `/auth/logout`                   | Log out                        |
| GET    | `/events?search=&date=&page=`   | List upcoming events           |
| GET    | `/events/:id`                    | Event detail (logs view)       |
| POST   | `/events/:id/book`               | Book a seat                    |
| GET    | `/me/bookings`                   | Current user's bookings        |
| DELETE | `/bookings/:id`                  | Cancel booking                 |
| POST   | `/organizer/events`              | Create event (organizer)       |
| PATCH  | `/organizer/events/:id`          | Edit event (organizer)         |
| GET    | `/organizer/events`              | Organizer's events             |
| GET    | `/organizer/events/:id/attendees`| Attendee list                  |
| GET    | `/organizer/events/:id/analytics`| View → booking analytics       |

## Test plan (manual)

Use this checklist when demoing or recording your walkthrough:

1. **Browse & search** — Open home, search by title, filter by date, paginate results.
2. **Auth** — Sign up as a user, log out, log back in; try accessing `/bookings` while logged out (should redirect to login, then return).
3. **Booking** — Book an event with available seats; confirm it appears under My Bookings.
4. **Sold out** — Book the last seat on **Indie Film Festival** (seed: capacity 2, 1 already taken); UI should show sold out and API returns 409 `SOLD_OUT`.
5. **Cancel** — Cancel a booking; seat count should increase on the event detail page.
6. **Organizer** — Log in as `organizer@bookit.com`, create/edit an event, view attendees and analytics.
7. **Role guard** — Log in as a regular user and visit `/organizer` (should show forbidden page).

## Concurrency test

To verify the no-oversell guarantee on the last seat, run simultaneous booking requests against a nearly-full event (seed includes **Indie Film Festival** with capacity 2 and 1 seat taken):

```bash
# From backend/ after finding the event id (e.g. from GET /events):
npm run test:concurrency -- <event-id>
```

Expected: one `201` success and one `409 SOLD_OUT`.

See `NOTES.md` for how oversell protection and search indexing are implemented.

## Submission checklist

- [ ] `docker compose up --build` runs without errors
- [ ] `NOTES.md` explains concurrency approach
- [ ] 3–5 minute screen recording (booking flow + organizer dashboard + concurrency mention)
- [ ] Git repo with meaningful commit history

## Project structure

```
Booklt/
├── backend/          Express API + Prisma
├── frontend/         React app (Vite + React Router)
├── scripts/          Concurrency test helper
├── docker-compose.yml
├── README.md
└── NOTES.md
```
