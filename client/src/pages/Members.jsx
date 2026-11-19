import { useEffect, useState } from "react";
import api from "../services/api.js";
import Message from "../components/Message.jsx";

function Members() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMembers = async () => {
    try {
      const { data } = await api.get("/auth/users");
      setMembers(data);
      setError("");
    } catch (err) {
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await api.post("/auth/create-user", form);
      setSuccess("User created successfully.");
      setForm({ name: "", email: "", password: "", role: "member" });
      fetchMembers();
    } catch (err) {
      setError("Could not create user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">PEOPLE</div>
          <h1>Members & users</h1>
          <p className="muted">
            View registered accounts and create new accounts.
          </p>
        </div>
      </div>
      <Message>{error}</Message>
      <Message type="success">{success}</Message>
      <form className="panel form-panel" onSubmit={handleSubmit}>
        <h2>Create user</h2>
        <div className="form-grid">
          <div className="field">
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Password (minimum 6 characters)</label>
            <input
              type="password"
              minLength="6"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Creating..." : "Create user"}
        </button>
      </form>
      <section className="panel">
        <div className="section-heading">
          <h2>Registered users</h2>
          <span className="count-pill">{members.length} users</span>
        </div>
        {loading ? (
          <p className="loading">Loading users...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Membership ID</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <strong>{member.name}</strong>
                    </td>
                    <td>{member.email}</td>
                    <td>{member.membershipId || "—"}</td>
                    <td>
                      <span className="status issued">{member.role}</span>
                    </td>
                    <td>{new Date(member.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
export default Members;
