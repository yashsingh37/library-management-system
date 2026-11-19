import { useEffect, useState } from "react";
import api from "../services/api.js";
import Message from "../components/Message.jsx";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/stats");
        setStats(data);
      } catch (err) {
        setError("Could not load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p className="loading">Loading dashboard...</p>;

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">OVERVIEW</div>
          <h1>Dashboard</h1>
          <p className="muted">Here's what's happening in your library.</p>
        </div>
      </div>
      <Message>{error}</Message>
      {stats && (
        <div className="stats-grid">
          <Stat title="Total Books" value={stats.books} note="Book records" />
          <Stat
            title="Currently Issued"
            value={stats.issued}
            note="Active transactions"
          />
          <Stat title="Overdue" value={stats.overdue} note="Past due date" />
          <Stat
            title="Members"
            value={stats.members}
            note="Registered members"
          />
        </div>
      )}
    </main>
  );
}
function Stat({ title, value, note }) {
  return (
    <div className="stat-card">
      <p>{title}</p>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
export default Dashboard;
