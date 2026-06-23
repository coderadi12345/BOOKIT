import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";

export default function AttendeesPage() {
  const { id } = useParams();
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getAttendees(id)
      .then(setAttendees)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load attendees"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <Link to="/organizer" className="back-link">&larr; Back to dashboard</Link>
      <header className="page-header">
        <h1 className="page-title">Attendees</h1>
        <p className="page-subtitle">Confirmed bookings for this event.</p>
      </header>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="card skeleton-card" style={{ padding: "1.5rem" }}>
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </div>
      ) : attendees.length === 0 ? (
        <div className="empty-state">No confirmed bookings yet.</div>
      ) : (
        <div className="card table-panel">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Email</th><th>Booked at</th></tr></thead>
              <tbody>
                {attendees.map((a) => (
                  <tr key={a.bookingId}><td>{a.email}</td><td>{formatDate(a.bookedAt)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
