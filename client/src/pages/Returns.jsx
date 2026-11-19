import { useEffect, useState } from "react";
import api from "../services/api.js";
import Message from "../components/Message.jsx";

function Returns() {
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState("");

  const fetchIssues = async () => {
    try {
      const { data } = await api.get("/issues/active");
      setIssues(data);
      setError("");
    } catch (err) {
      setError("Could not load active issues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleReturn = async (id) => {
    setError("");
    setSuccess("");
    setReturningId(id);
    try {
      const { data } = await api.put(`/issues/${id}/return`);
      setSuccess(`Book returned successfully. Fine: Rs ${data.fine}.`);
      await fetchIssues();
    } catch (err) {
      setError("Could not return book.");
    } finally {
      setReturningId("");
    }
  };

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">TRANSACTIONS</div>
          <h1>Book returns</h1>
          <p className="muted">View active issues and accept returned books.</p>
        </div>
      </div>
      <Message>{error}</Message>
      <Message type="success">{success}</Message>
      <section className="panel">
        <div className="section-heading">
          <h2>Currently issued books</h2>
          <span className="count-pill">{issues.length} active</span>
        </div>
        {loading ? (
          <p className="loading">Loading issues...</p>
        ) : issues.length === 0 ? (
          <p className="empty">There are no active issues.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Issue date</th>
                  <th>Due date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue._id}>
                    <td>
                      <strong>{issue.book?.title || "Book unavailable"}</strong>
                      <small className="table-sub">{issue.book?.author}</small>
                    </td>
                    <td>
                      {issue.member?.name}
                      <small className="table-sub">
                        {issue.member?.membershipId || issue.member?.email}
                      </small>
                    </td>
                    <td>{new Date(issue.issueDate).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={
                          new Date(issue.dueDate) < new Date()
                            ? "overdue-text"
                            : ""
                        }
                      >
                        {new Date(issue.dueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-small"
                        disabled={returningId === issue._id}
                        onClick={() => handleReturn(issue._id)}
                      >
                        {returningId === issue._id
                          ? "Returning..."
                          : "Return book"}
                      </button>
                    </td>
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
export default Returns;
