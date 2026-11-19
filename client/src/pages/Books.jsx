import { useEffect, useState } from "react";
import api from "../services/api.js";
import Message from "../components/Message.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const emptyForm = {
  title: "",
  author: "",
  isbn: "",
  category: "",
  totalCopies: 1,
  shelfLocation: "",
};

function Books() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBooks = async () => {
    try {
      const { data } = await api.get("/books");
      setBooks(data);
      setError("");
    } catch (err) {
      setError("Could not load books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/books/${editingId}`, form);
        setSuccess("Book updated successfully.");
      } else {
        await api.post("/books", form);
        setSuccess("Book added successfully.");
      }
      setForm(emptyForm);
      setEditingId(null);
      await fetchBooks();
    } catch (err) {
      setError("Could not save book.");
    } finally {
      setSaving(false);
    }
  };

  const editBook = (book) => {
    setEditingId(book._id);
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      totalCopies: book.totalCopies,
      shelfLocation: book.shelfLocation || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    setError("");
    setSuccess("");
    try {
      const { data } = await api.delete(`/books/${id}`);
      setSuccess(data.message);
      fetchBooks();
    } catch (err) {
      setError("Could not delete book.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">COLLECTION</div>
          <h1>{user.role === "admin" ? "Manage Books" : "Library Books"}</h1>
          <p className="muted">Browse the books available in the library.</p>
        </div>
      </div>
      <Message>{error}</Message>
      <Message type="success">{success}</Message>
      {user.role === "admin" && (
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h2>{editingId ? "Edit book" : "Add a new book"}</h2>
          <div className="form-grid">
            <Field
              label="Book title"
              name="title"
              value={form.title}
              onChange={handleChange}
            />
            <Field
              label="Author"
              name="author"
              value={form.author}
              onChange={handleChange}
            />
            <Field
              label="ISBN"
              name="isbn"
              value={form.isbn}
              onChange={handleChange}
            />
            <Field
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
            />
            <Field
              label="Total copies"
              name="totalCopies"
              type="number"
              min="1"
              value={form.totalCopies}
              onChange={handleChange}
            />
            <Field
              label="Shelf location"
              name="shelfLocation"
              value={form.shelfLocation}
              onChange={handleChange}
            />
          </div>
          <div className="button-row">
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Update book" : "Add book"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
      <section className="panel">
        <div className="section-heading">
          <h2>Book collection</h2>
          <span className="count-pill">{books.length} books</span>
        </div>
        {loading ? (
          <p className="loading">Loading books...</p>
        ) : books.length === 0 ? (
          <p className="empty">No books have been added yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Copies</th>
                  <th>Status</th>
                  {user.role === "admin" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id}>
                    <td>
                      <strong>{book.title}</strong>
                      <small className="table-sub">
                        {book.shelfLocation || "No shelf assigned"}
                      </small>
                    </td>
                    <td>{book.author}</td>
                    <td>{book.isbn}</td>
                    <td>{book.category}</td>
                    <td>
                      {book.availableCopies} / {book.totalCopies}
                    </td>
                    <td>
                      <span
                        className={`status ${book.availableCopies > 0 ? "available" : "unavailable"}`}
                      >
                        {book.availableCopies > 0
                          ? "Available"
                          : "Out of stock"}
                      </span>
                    </td>
                    {user.role === "admin" && (
                      <td>
                        <div className="table-actions">
                          <button
                            className="text-btn"
                            onClick={() => editBook(book)}
                          >
                            Edit
                          </button>
                          <button
                            className="text-btn danger-text"
                            onClick={() => deleteBook(book._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
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
function Field({ label, name, value, onChange, type = "text", min }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        name={name}
        type={type}
        min={min}
        value={value}
        onChange={onChange}
        required={name !== "shelfLocation"}
      />
    </div>
  );
}
export default Books;
