import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getOrganizerEvents()
      .then(setEvents)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-actions">
        <div>
          <h1 className="page-title">Organizer Dashboard</h1>
          <p className="page-subtitle">Manage your events and view analytics.</p>
        </div>
        <Link to="/organizer/events/new" className="btn btn-primary">Create Event</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="card skeleton-card" style={{ padding: "1.5rem" }}>
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </div>
      ) : events.length === 0 ? (
        <div className="empty-state">
          <p>You haven&apos;t created any events yet.</p>
          <Link to="/organizer/events/new" className="btn btn-primary" style={{ marginTop: "1rem" }}>Create Your First Event</Link>
        </div>
      ) : (
        <div className="card table-panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Sold</th>
                  <th>Remaining</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <strong>{e.title}</strong>
                      <br />
                      <span className="venue-sub">{e.venue}</span>
                    </td>
                    <td>{formatDate(e.dateTime)}</td>
                    <td>{e.seatsSold} / {e.capacity}</td>
                    <td>{e.seatsRemaining}</td>
                    <td>{formatPrice(e.price)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <Link to={`/organizer/events/${e.id}/edit`} className="btn btn-secondary btn-sm">Edit</Link>
                        <Link to={`/organizer/events/${e.id}/attendees`} className="btn btn-secondary btn-sm">Attendees</Link>
                        <Link to={`/organizer/events/${e.id}/analytics`} className="btn btn-secondary btn-sm">Analytics</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
