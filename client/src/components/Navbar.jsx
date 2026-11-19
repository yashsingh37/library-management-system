import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <Link className="brand" to="/">Library<span>Desk</span></Link>
      <div className="nav-links">
        {user.role === "admin" ? (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/books">Manage Books</Link>
            <Link to="/issue">Issue Book</Link>
            <Link to="/returns">Returns</Link>
            <Link to="/members">Members</Link>
          </>
        ) : (
          <>
            <Link to="/">Books</Link>
            <Link to="/my-books">My Books</Link>
          </>
        )}
      </div>
      <div className="nav-user">
        <span>{user.name} <small>({user.role})</small></span>
        <button className="btn btn-outline btn-small" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
