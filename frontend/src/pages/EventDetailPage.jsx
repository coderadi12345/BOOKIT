import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    api.getEvent(id)
      .then(setEvent)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load event"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/events/${id}` } });
      return;
    }
    setBooking(true);
    setError("");
    try {
      const result = await api.bookEvent(id);
      setBooked(true);
      addToast("Booking confirmed! See you at the event.");
      setEvent((prev) =>
        prev ? { ...prev, seatsRemaining: result.seatsRemaining, soldOut: result.seatsRemaining <= 0 } : prev
      );
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Booking failed";
      setError(msg);
      if (err instanceof ApiError && err.code === "SOLD_OUT") {
        setEvent((prev) => (prev ? { ...prev, soldOut: true, seatsRemaining: 0 } : prev));
      }
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="content-narrow">
        <div className="skeleton skeleton-title" />
        <div className="card panel-padded">
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line short" />
        </div>
      </div>
    );
  }

  if (!event) return <div className="alert alert-error">{error || "Event not found"}</div>;

  return (
    <div className="content-narrow">
      <Link to="/" className="back-link">&larr; Back to events</Link>

      <header className="page-header">
        <h1 className="page-title">{event.title}</h1>
        {event.soldOut && <span className="badge badge-sold-out">Sold Out</span>}
      </header>

      <div className="card panel-padded">
        <p className="event-description">{event.description}</p>

        <div className="detail-grid">
          <p><strong>Venue</strong> {event.venue}</p>
          <p><strong>Date</strong> {formatDate(event.dateTime)}</p>
          <p><strong>Price</strong> <span className="event-price inline">{formatPrice(event.price)}</span></p>
          <p>
            <strong>Seats remaining</strong>{" "}
            <span className={event.soldOut ? "seats-full" : "seats-ok"}>
              {event.seatsRemaining} / {event.capacity}
            </span>
          </p>
          <p className="detail-muted">Organized by {event.organizerEmail}</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {booked && (
          <div className="alert alert-success">
            You&apos;re booked!{" "}
            <Link to="/bookings">View my bookings</Link>
          </div>
        )}

        <div className="action-row">
          {event.soldOut ? (
            <button className="btn btn-secondary" disabled>Sold Out</button>
          ) : booked ? (
            <Link to="/bookings" className="btn btn-primary">Go to My Bookings</Link>
          ) : (
            <button className="btn btn-primary" onClick={handleBook} disabled={booking}>
              {booking ? "Booking..." : user ? "Book a Seat" : "Log in to Book"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
