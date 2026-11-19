import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import Message from "../components/Message.jsx";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      setSuccess(
        `${data.message} Your membership ID is ${data.membershipId}. Redirecting to login...`,
      );
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError("Unable to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="eyebrow">JOIN THE LIBRARY</div>
        <h1>Create account</h1>
        <p className="muted">Register as a library member.</p>
        <Message>{error}</Message>
        <Message type="success">{success}</Message>
        <label>Full name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <label>Password (minimum 6 characters)</label>
        <input
          name="password"
          type="password"
          minLength="6"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button className="btn btn-primary full" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
        <p className="auth-foot">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
export default Register;
