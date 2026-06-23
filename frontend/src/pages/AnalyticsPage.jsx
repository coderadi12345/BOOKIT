import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "@/lib/api";

export default function AnalyticsPage() {
  const { id } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getAnalytics(id)
      .then(setAnalytics)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <Link to="/organizer" className="back-link">&larr; Back to dashboard</Link>
      <header className="page-header">
        <h1 className="page-title">Event Analytics</h1>
        {analytics && <p className="page-subtitle">{analytics.title}</p>}
      </header>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <div className="stats-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="card stat-card skeleton-card">
              <div className="skeleton skeleton-line short" />
              <div className="skeleton skeleton-line shorter" />
            </div>
          ))}
        </div>
      ) : analytics ? (
        <>
          <div className="stats-grid">
            <div className="card stat-card"><div className="stat-value">{analytics.totalViews}</div><div className="stat-label">Total Views</div></div>
            <div className="card stat-card"><div className="stat-value">{analytics.bookingsStarted}</div><div className="stat-label">Bookings Started</div></div>
            <div className="card stat-card"><div className="stat-value">{analytics.bookingsConfirmed}</div><div className="stat-label">Bookings Confirmed</div></div>
            <div className="card stat-card"><div className="stat-value">{analytics.conversionRate}%</div><div className="stat-label">View → Booking Rate</div></div>
          </div>
          <div className="card panel-padded">
            <p className="panel-note">
              Conversion rate = confirmed bookings ÷ event views, from the activity log.
              Each detail view logs <code>event_viewed</code>; successful bookings log <code>booking_confirmed</code>.
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
