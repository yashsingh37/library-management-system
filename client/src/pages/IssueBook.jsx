import { useEffect, useState } from "react";
import api from "../services/api.js";
import Message from "../components/Message.jsx";

function IssueBook() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [bookId, setBookId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [bookResponse, userResponse] = await Promise.all([
          api.get("/books"),
          api.get("/auth/users"),
        ]);
        setBooks(bookResponse.data);
        setMembers(userResponse.data.filter((user) => user.role === "member"));
      } catch (err) {
        setError("Could not load books and members.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/issues", { bookId, memberId });
      setSuccess(data.message);
      setBookId("");
      setMemberId("");
      const { data: updatedBooks } = await api.get("/books");
      setBooks(updatedBooks);
    } catch (err) {
      setError("Could not issue book.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page narrow-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">TRANSACTIONS</div>
          <h1>Issue a book</h1>
          <p className="muted">
            Assign an available book to a registered member.
          </p>
        </div>
      </div>
      <Message>{error}</Message>
      <Message type="success">{success}</Message>
      <form className="panel form-panel" onSubmit={handleSubmit}>
        {loading ? (
          <p className="loading">Loading information...</p>
        ) : (
          <>
            <div className="field">
              <label>Select book</label>
              <select
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                required
              >
                <option value="">Choose a book</option>
                {books
                  .filter((book) => book.availableCopies > 0)
                  .map((book) => (
                    <option key={book._id} value={book._id}>
                      {book.title} — {book.availableCopies} available
                    </option>
                  ))}
              </select>
            </div>
            <div className="field">
              <label>Select member</label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                required
              >
                <option value="">Choose a member</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.membershipId || member.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="info-box">
              A member can have a maximum of 3 active books. The due date is 7
              days from the issue date.
            </div>
            <button
              className="btn btn-primary full"
              disabled={
                submitting ||
                !books.some((book) => book.availableCopies > 0) ||
                members.length === 0
              }
            >
              {submitting ? "Issuing..." : "Issue book"}
            </button>
          </>
        )}
      </form>
    </main>
  );
}
export default IssueBook;
