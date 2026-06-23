import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const loadEvents = async (s = search, d = date, p = page) => {
    setLoading(true);
    setError("");
    try {
      const result = await api.getEvents({ search: s || undefined, date: d || undefined, page: p });
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadEvents(search, date, 1);
  };

  return (
    <div>
      <header className="page-hero">
        <h1>Find your next live experience</h1>
        <p>Browse upcoming events, grab the last seats, and manage bookings — all in one place.</p>
      </header>

      <div className="search-panel">
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
          {(search || date) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearch("");
                setDate("");
                setPage(1);
                loadEvents("", "", 1);
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="card-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card skeleton-card">
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
              <div className="skeleton skeleton-line shorter" />
            </div>
          ))}
        </div>
      ) : data && data.items.length === 0 ? (
        <div className="empty-state">
          <p>No upcoming events found.</p>
          <p>Try adjusting your search or date filter.</p>
        </div>
      ) : (
        <>
          <div className="card-grid">
            {data?.items.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`} className="card-link">
                <article className="card event-card">
                  <div className="event-card-header">
                    <h3>{event.title}</h3>
                    {event.soldOut ? (
                      <span className="badge badge-sold-out">Sold Out</span>
                    ) : (
                      <span className="badge badge-available">{event.seatsRemaining} left</span>
                    )}
                  </div>
                  <p className="event-meta">{event.venue}</p>
                  <p className="event-meta">{formatDate(event.dateTime)}</p>
                  <p className="event-price">{formatPrice(event.price)}</p>
                </article>
              </Link>
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {data.page} of {data.totalPages} ({data.total} events)
              </span>
              <button
                className="btn btn-secondary"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
