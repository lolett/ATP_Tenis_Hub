// components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <nav
      style={{
        display: "flex",
        gap: 24,
        alignItems: "center",
        padding: "12px 24px",
        borderBottom: "1px solid #ddd",
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#fff",
      }}
    >
      <strong style={{ marginRight: "auto" }}>🎾 ATP Tenis Hub</strong>

      <Link to="/">Dashboard</Link>
      <Link to="/ranking">ATP Ranking</Link>
      <Link to="/players">Players</Link>

      <button
        onClick={handleLogout}
        style={{ marginLeft: 16, cursor: "pointer" }}
      >
        Logout
      </button>
    </nav>
  );
}
