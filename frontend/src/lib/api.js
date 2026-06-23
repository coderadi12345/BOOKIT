const API_URL = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the API. Make sure the backend is running (cd backend && npm run dev)."
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data.error || "Request failed", data.code);
  }

  return data;
}

export const api = {
  signup: (email, password, role) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    }),

  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request("/auth/logout", { method: "POST" }),

  me: () => request("/auth/me"),

  getEvents: (params) => {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.date) q.set("date", params.date);
    if (params.page) q.set("page", String(params.page));
    return request(`/events?${q.toString()}`);
  },

  getEvent: (id) => request(`/events/${id}`),

  bookEvent: (id) =>
    request(`/events/${id}/book`, {
      method: "POST",
    }),

  getMyBookings: () => request("/me/bookings"),

  cancelBooking: (id) => request(`/bookings/${id}`, { method: "DELETE" }),

  createEvent: (data) =>
    request("/organizer/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateEvent: (id, data) =>
    request(`/organizer/events/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  getOrganizerEvents: () => request("/organizer/events"),

  getAttendees: (id) => request(`/organizer/events/${id}/attendees`),

  getAnalytics: (id) => request(`/organizer/events/${id}/analytics`),
};
