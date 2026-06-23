/**
 * Simulates two users booking the last seat at the same time.
 *
 * Usage:
 *   1. Log in as user@bookit.com and jane@bookit.com in the browser (or use signup).
 *   2. Find an event id with exactly 1 seat left (seed: Indie Film Festival).
 *   3. Export cookies or pass tokens — this script signs up two fresh users and books directly.
 *
 *   node scripts/concurrency-test.js <event-id>
 *
 * Expects API at http://localhost:3000
 */

const API = process.env.API_URL || "http://localhost:3000";
const eventId = process.argv[2];

if (!eventId) {
  console.error("Usage: node scripts/concurrency-test.js <event-id>");
  process.exit(1);
}

function parseCookies(res) {
  const raw = res.headers.getSetCookie?.() || [];
  return raw.map((c) => c.split(";")[0]).join("; ");
}

async function signupAndBook(email) {
  const signupRes = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password123", role: "user" }),
  });

  let cookies = parseCookies(signupRes);

  if (!signupRes.ok) {
    const loginRes = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "password123" }),
    });
    cookies = parseCookies(loginRes);
    if (!loginRes.ok) {
      throw new Error(`Auth failed for ${email}`);
    }
  }

  const bookRes = await fetch(`${API}/events/${eventId}/book`, {
    method: "POST",
    headers: { Cookie: cookies },
  });

  const body = await bookRes.json();
  return { status: bookRes.status, body, email };
}

async function main() {
  const ts = Date.now();
  const [a, b] = await Promise.all([
    signupAndBook(`conctest-a-${ts}@bookit.com`),
    signupAndBook(`conctest-b-${ts}@bookit.com`),
  ]);

  console.log("User A:", a.status, a.body);
  console.log("User B:", b.status, b.body);

  const statuses = [a.status, b.status].sort();
  const oneSuccess = statuses.includes(201) && statuses.includes(409);
  if (oneSuccess) {
    console.log("\nPASS: exactly one booking succeeded, one got sold out.");
  } else {
    console.log("\nFAIL: expected one 201 and one 409, got", statuses);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
