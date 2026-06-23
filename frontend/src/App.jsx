import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import HomePage from "@/pages/HomePage";
import EventDetailPage from "@/pages/EventDetailPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import MyBookingsPage from "@/pages/MyBookingsPage";
import OrganizerDashboard from "@/pages/OrganizerDashboard";
import CreateEventPage from "@/pages/CreateEventPage";
import EditEventPage from "@/pages/EditEventPage";
import AttendeesPage from "@/pages/AttendeesPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ForbiddenPage from "@/pages/ForbiddenPage";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer"
            element={
              <ProtectedRoute role="organizer">
                <OrganizerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/new"
            element={
              <ProtectedRoute role="organizer">
                <CreateEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:id/edit"
            element={
              <ProtectedRoute role="organizer">
                <EditEventPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:id/attendees"
            element={
              <ProtectedRoute role="organizer">
                <AttendeesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events/:id/analytics"
            element={
              <ProtectedRoute role="organizer">
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
