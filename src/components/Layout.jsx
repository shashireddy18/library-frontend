import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">📚 Library Manager</div>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/books">Books</NavLink>
          <NavLink to="/students">Students</NavLink>
          <NavLink to="/issues">Issue / Return</NavLink>
        </nav>
        <div className="user">
          <span>{user?.fullName || user?.username}</span>
          <button className="btn small ghost" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
