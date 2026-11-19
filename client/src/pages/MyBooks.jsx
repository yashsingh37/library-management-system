import { useEffect, useState } from "react";
import api from "../services/api.js";
import Message from "../components/Message.jsx";

function MyBooks() {
  const [data, setData] = useState({ issues: [], totalFine: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        const response = await api.get("/issues/my");
        setData(response.data);
      } catch (err) {
        setError("Could not load your books.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyBooks();
  }, []);

  const activeIssues = data.issues.filter((issue) => issue.status === "issued");
  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">YOUR ACCOUNT</div>
          <h1>My books</h1>
          <p className="muted">Track your issued books, due dates and fines.</p>
        </div>
      </div>
      <Message>{error}</Message>
      <div className="stats-grid two-stats">
        <div className="stat-card">
          <p>Currently borrowed</p>
          <strong>{activeIssues.length}</strong>
          <small>Maximum 3 at a time</small>
        </div>
        <div className="stat-card">
          <p>Total fine</p>
          <strong>Rs {data.totalFine}</strong>
          <small>Recorded late-return fines</small>
        </div>
      </div>
      <section className="panel">
        <div className="section-heading">
          <h2>Issue history</h2>
        </div>
        {loading ? (
          <p className="loading">Loading your books...</p>
        ) : data.issues.length === 0 ? (
          <p className="empty">You have not borrowed any books yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Issue date</th>
                  <th>Due date</th>
                  <th>Return date</th>
                  <th>Status</th>
                  <th>Fine</th>
                </tr>
              </thead>
              <tbody>
                {data.issues.map((issue) => {
                  const overdue =
                    issue.status === "issued" &&
                    new Date(issue.dueDate) < new Date();
                  return (
                    <tr
                      key={issue._id}
                      className={overdue ? "overdue-row" : ""}
                    >
                      <td>
                        <strong>
                          {issue.book?.title || "Book unavailable"}
                        </strong>
                        <small className="table-sub">
                          {issue.book?.author}
                        </small>
                      </td>
                      <td>{new Date(issue.issueDate).toLocaleDateString()}</td>
                      <td>{new Date(issue.dueDate).toLocaleDateString()}</td>
                      <td>
                        {issue.returnDate
                          ? new Date(issue.returnDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td>
                        <span
                          className={`status ${issue.status === "returned" ? "available" : overdue ? "unavailable" : "issued"}`}
                        >
                          {overdue ? "Overdue" : issue.status}
                        </span>
                      </td>
                      <td>Rs {issue.fine}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
export default MyBooks;
