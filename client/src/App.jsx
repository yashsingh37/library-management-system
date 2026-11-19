import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Books from "./pages/Books.jsx";
import IssueBook from "./pages/IssueBook.jsx";
import Returns from "./pages/Returns.jsx";
import MyBooks from "./pages/MyBooks.jsx";
import Members from "./pages/Members.jsx";

function App() {
  const { user } = useAuth();

  return <>
    <Navbar />
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/" element={<ProtectedRoute>{user?.role === "admin" ? <Dashboard /> : <Books />}</ProtectedRoute>} />
      <Route path="/books" element={<ProtectedRoute role="admin"><Books /></ProtectedRoute>} />
      <Route path="/issue" element={<ProtectedRoute role="admin"><IssueBook /></ProtectedRoute>} />
      <Route path="/returns" element={<ProtectedRoute role="admin"><Returns /></ProtectedRoute>} />
      <Route path="/members" element={<ProtectedRoute role="admin"><Members /></ProtectedRoute>} />
      <Route path="/my-books" element={<ProtectedRoute role="member"><MyBooks /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  </>;
}
export default App;
