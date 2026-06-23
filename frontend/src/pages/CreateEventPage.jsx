import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      await api.createEvent({
        title: form.get("title"),
        description: form.get("description"),
        venue: form.get("venue"),
        dateTime: new Date(form.get("dateTime")).toISOString(),
        capacity: parseInt(form.get("capacity"), 10),
        price: parseFloat(form.get("price")),
      });
      addToast("Event created successfully");
      navigate("/organizer");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-form">
      <Link to="/organizer" className="back-link">&larr; Back to dashboard</Link>
      <header className="page-header">
        <h1 className="page-title">Create Event</h1>
      </header>
      {error && <div className="alert alert-error">{error}</div>}
      <form className="card panel-padded" onSubmit={handleSubmit}>
        <div className="form-group"><label htmlFor="title">Title</label><input id="title" name="title" required /></div>
        <div className="form-group"><label htmlFor="description">Description</label><textarea id="description" name="description" required /></div>
        <div className="form-group"><label htmlFor="venue">Venue</label><input id="venue" name="venue" required /></div>
        <div className="form-group"><label htmlFor="dateTime">Date & Time</label><input id="dateTime" name="dateTime" type="datetime-local" required /></div>
        <div className="form-group"><label htmlFor="capacity">Capacity</label><input id="capacity" name="capacity" type="number" min="1" required /></div>
        <div className="form-group"><label htmlFor="price">Price ($)</label><input id="price" name="price" type="number" min="0" step="0.01" required /></div>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Creating..." : "Create Event"}</button>
      </form>
    </div>
  );
}
