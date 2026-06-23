import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import { useToast } from "@/context/ToastContext";

export default function MyBookingsPage() {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);

  const loadBookings = async () => {
    try {
      setBookings(await api.getMyBookings());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking? The seat will be released.")) return;
    setCancelling(id);
    try {
      await api.cancelBooking(id);
      addToast("Booking cancelled. Seat released.", "info");
      await loadBookings();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to cancel");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">View and manage your event bookings.</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="card-grid">
          {[1, 2].map((n) => (
            <div key={n} className="card skeleton-card">
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <p>You have no bookings yet.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>Browse Events</Link>
        </div>
      ) : (
        <div className="card-grid">
          {bookings.map((b) => (
            <article key={b.id} className="card event-card">
              <h3><Link to={`/events/${b.event.id}`}>{b.event.title}</Link></h3>
              <p className="event-meta">{b.event.venue}</p>
              <p className="event-meta">{formatDate(b.event.dateTime)}</p>
              <p className="event-price">{formatPrice(b.event.price)}</p>
              <p>
                <span className={`badge ${b.status === "confirmed" ? "badge-available" : "badge-neutral"}`}>
                  {b.status}
                </span>
              </p>
              {b.status === "confirmed" && (
                <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)} disabled={cancelling === b.id}>
                  {cancelling === b.id ? "Cancelling..." : "Cancel Booking"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
