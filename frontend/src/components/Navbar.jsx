// components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  const linkStyle = (path) => ({
    padding: "6px 12px",
    borderRadius: 6,
    fontWeight: 500,
    fontSize: 14,
    color: location.pathname === path ? "#2d6cdf" : "#374151",
    background: location.pathname === path ? "#eff6ff" : "transparent",
    textDecoration: "none",
    transition: "all 0.15s",
    borderBottom:
      location.pathname === path
        ? "2px solid #2d6cdf"
        : "2px solid transparent",
  });

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        height: 56,
        background: "white",
        borderBottom: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginRight: "auto",
          textDecoration: "none",
        }}
      >
        <span style={{ fontSize: 20 }}>🎾</span>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>
          ATP Tenis Hub
        </span>
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          height: "100%",
        }}
      >
        <Link to="/" style={linkStyle("/")}>
          Dashboard
        </Link>
        <Link to="/ranking" style={linkStyle("/ranking")}>
          ATP Ranking
        </Link>
        <Link to="/players" style={linkStyle("/players")}>
          Players
        </Link>
      </div>

      <button
        onClick={handleLogout}
        style={{
          marginLeft: 16,
          background: "#1a1a2e",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: 6,
          fontWeight: 500,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </nav>
  );
}
