import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  const navClass = ({ isActive }) => (isActive ? "active" : undefined);

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          Book<span>It</span>
        </Link>
        <ul className="nav-links">
          <li>
            <NavLink to="/" end className={navClass}>
              Events
            </NavLink>
          </li>
          {user && (
            <li>
              <NavLink to="/bookings" className={navClass}>
                My Bookings
              </NavLink>
            </li>
          )}
          {user?.role === "organizer" && (
            <li>
              <NavLink to="/organizer" className={navClass}>
                Dashboard
              </NavLink>
            </li>
          )}
          {!loading && !user && (
            <>
              <li>
                <NavLink to="/login" className={navClass}>
                  Log in
                </NavLink>
              </li>
              <li>
                <Link to="/signup" className="btn btn-primary btn-sm">
                  Sign up
                </Link>
              </li>
            </>
          )}
          {user && (
            <>
              <li className="user-chip" title={user.email}>
                {user.email}
              </li>
              <li>
                <button className="btn btn-ghost btn-sm" onClick={() => logout()}>
                  Log out
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
