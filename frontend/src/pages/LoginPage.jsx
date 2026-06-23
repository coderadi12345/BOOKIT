import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1 className="page-title">Log in</h1>
      <p className="page-subtitle">Welcome back to BookIt</p>
      {error && <div className="alert alert-error">{error}</div>}
      <form className="card panel-padded" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={8} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
      <p className="link-row">Don&apos;t have an account? <Link to="/signup">Sign up</Link></p>
    </div>
  );
}
