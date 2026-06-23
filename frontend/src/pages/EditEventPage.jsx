import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { toDateInputValue } from "@/lib/format";
import { useToast } from "@/context/ToastContext";

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initial, setInitial] = useState({});

  useEffect(() => {
    api.getEvent(id)
      .then((e) => setInitial({
        title: e.title, description: e.description, venue: e.venue,
        dateTime: toDateInputValue(e.dateTime), capacity: String(e.capacity), price: String(e.price),
      }))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load"))
      .finally(() => setInitialLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      await api.updateEvent(id, {
        title: form.get("title"), description: form.get("description"), venue: form.get("venue"),
        dateTime: new Date(form.get("dateTime")).toISOString(),
        capacity: parseInt(form.get("capacity"), 10), price: parseFloat(form.get("price")),
      });
      addToast("Event updated");
      navigate("/organizer");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading || !initial.title) {
    return (
      <div className="content-form">
        <div className="skeleton skeleton-title" />
        <div className="card panel-padded">
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line" />
        </div>
      </div>
    );
  }

  return (
    <div className="content-form">
      <Link to="/organizer" className="back-link">&larr; Back to dashboard</Link>
      <header className="page-header">
        <h1 className="page-title">Edit Event</h1>
      </header>
      {error && <div className="alert alert-error">{error}</div>}
      <form className="card panel-padded" onSubmit={handleSubmit}>
        <div className="form-group"><label htmlFor="title">Title</label><input id="title" name="title" defaultValue={initial.title} required /></div>
        <div className="form-group"><label htmlFor="description">Description</label><textarea id="description" name="description" defaultValue={initial.description} required /></div>
        <div className="form-group"><label htmlFor="venue">Venue</label><input id="venue" name="venue" defaultValue={initial.venue} required /></div>
        <div className="form-group"><label htmlFor="dateTime">Date & Time</label><input id="dateTime" name="dateTime" type="datetime-local" defaultValue={initial.dateTime} required /></div>
        <div className="form-group"><label htmlFor="capacity">Capacity (cannot be less than seats sold)</label><input id="capacity" name="capacity" type="number" min="1" defaultValue={initial.capacity} required /></div>
        <div className="form-group"><label htmlFor="price">Price ($)</label><input id="price" name="price" type="number" min="0" step="0.01" defaultValue={initial.price} required /></div>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
      </form>
    </div>
  );
}
