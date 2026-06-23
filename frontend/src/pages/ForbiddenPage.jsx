import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  return (
    <div className="empty-state" style={{ marginTop: "2rem" }}>
      <h2 className="page-title" style={{ marginBottom: "0.5rem" }}>Access denied</h2>
      <p>You don&apos;t have permission to view this page.</p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.25rem", flexWrap: "wrap" }}>
        <Link to="/" className="btn btn-primary">Browse Events</Link>
        <Link to="/login" className="btn btn-secondary">Switch Account</Link>
      </div>
    </div>
  );
}
