import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signup(email, password, role);
      navigate(role === "organizer" ? "/organizer" : "/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1 className="page-title">Sign up</h1>
      <p className="page-subtitle">Create your BookIt account</p>
      {error && <div className="alert alert-error">{error}</div>}
      <form className="card panel-padded" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password (min 8 characters)</label>
          <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="role">Account type</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User — browse and book events</option>
            <option value="organizer">Organizer — create and manage events</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>
      <p className="link-row">Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
