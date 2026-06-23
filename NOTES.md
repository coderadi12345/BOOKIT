# BookIt — Implementation Notes



## No-oversell guarantee



**Problem:** Two users booking the last seat at the same time must result in exactly one success and one clean "sold out" response.



**Approach:** PostgreSQL row-level locking inside a single transaction.



In `backend/src/services/booking.js`, the `bookEvent` function:



1. Opens a Prisma `$transaction`.

2. **Immediately** runs `SELECT id, capacity FROM events WHERE id = $1 FOR UPDATE` — locks the event row first so concurrent bookings serialize and deadlocks are avoided.

3. Checks for an existing confirmed booking by this user (unique constraint on `user_id + event_id`). 

4. Counts confirmed bookings for the event.

5. If `count >= capacity`, rolls back and returns **409 Conflict** with code `SOLD_OUT`.

6. Logs `booking_started`, creates or re-confirms the booking, logs `booking_confirmed`.

7. Retries up to 3 times if PostgreSQL reports a rare deadlock (`40P01`).



**Why this works:** `FOR UPDATE` ensures that two concurrent transactions cannot both read "1 seat left" and both insert. The second transaction blocks until the first commits, then sees the updated count and fails with sold out.



**Alternatives considered:**

- Optimistic locking with a version column — works but requires retry logic on the client.

- `CHECK` constraint with a subquery counting bookings — harder to express cleanly and still needs transaction boundaries for the double-booking case.

- Application-level mutex (in-memory) — does not work across multiple server instances.



## Schema & indexing decisions



| Table         | Key decisions |

|---------------|---------------|

| `users`       | `email` unique; `role` enum (`user` / `organizer`) |

| `events`      | `organizer_id` FK; indexes on `date_time`, `title`, and `lower(title)` for case-insensitive search at scale |

| `bookings`    | Unique `(user_id, event_id)` prevents double-booking; index on `(event_id, status)` for fast seat counts |

| `activity_log`| Append-only; index on `(event_id, action)` for analytics aggregation |



**Pagination:** Event list uses `LIMIT/OFFSET` with `WHERE date_time >= now()` and optional title/date filters — indexes keep this fast for large tables without loading all rows into memory.



**Search optimization:** When a title search is provided, `backend/src/services/events.js` uses a raw SQL query with `lower(title) LIKE lower($pattern)` so PostgreSQL can use the functional index on `lower(title)`. Without search, Prisma handles pagination on indexed `date_time`.



**Capacity edits:** Organizer cannot set capacity below the count of confirmed bookings (validated in `PATCH /organizer/events/:id`).



## Frontend architecture



- **React + Vite + React Router** (assignment allows React; Next.js was not used per preference).

- **Protected routes** (`ProtectedRoute`) centralize auth and role checks; unauthenticated users are redirected to login with a `from` path so they return to the page they tried to visit.

- **Toast notifications** for booking success, cancellations, and organizer actions.

- **Skeleton loaders** on list and detail pages for clearer loading states.



## Analytics



Computed from `activity_log` at read time:



- `totalViews` — count of `event_viewed`

- `bookingsStarted` — count of `booking_started`

- `bookingsConfirmed` — count of `booking_confirmed`

- `conversionRate` — `(bookingsConfirmed / totalViews) * 100`, rounded to 2 decimal places



## AI usage disclosure



AI (Cursor) was used to scaffold the project structure, Prisma schema, API routes, React/Vite pages, Docker setup, and this document. I reviewed and understand all submitted code, especially the booking transaction logic, since the follow-up interview extends this codebase live.



**Where I disagreed with AI / made intentional choices:**

- Used `SELECT FOR UPDATE` rather than only a unique constraint — the constraint prevents double-booking by the same user but does not alone prevent overselling the event.

- Kept JWT in httpOnly cookies instead of localStorage for simpler XSS protection.

- Made the seed script idempotent (skips if organizer already has events) so Docker restarts do not duplicate data.

- Chose Vite over Next.js for a simpler SPA that still meets the React requirement.

