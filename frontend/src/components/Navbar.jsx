// components/Navbar.jsx - responsive with hamburger on mobile
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const NAV_LINKS = [
  { path: "/", label: "Dashboard" },
  { path: "/ranking", label: "Rankings" },
  { path: "/players", label: "Players" },
  { path: "/tournaments", label: "Tournaments" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <>
      <nav
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 20px",
            height: 58,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              marginRight: "auto",
            }}
            onClick={() => setOpen(false)}
          >
            <span style={{ fontSize: 22 }}>🎾</span>
            <span
              style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}
            >
              ATP Tenis Hub
            </span>
          </Link>

          {/* Desktop links */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 4 }}
            className="nav-desktop"
          >
            {NAV_LINKS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                style={{
                  padding: "6px 12px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "all 0.15s",
                  color: isActive(path)
                    ? "var(--primary)"
                    : "var(--text-muted)",
                  background: isActive(path)
                    ? "var(--primary-bg)"
                    : "transparent",
                  borderBottom: isActive(path)
                    ? "2px solid var(--primary)"
                    : "2px solid transparent",
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Dark mode */}
          <button
            onClick={toggle}
            title="Toggle dark mode"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 16,
              color: "var(--text)",
            }}
          >
            {dark ? "☀️" : "🌙"}
          </button>

          {/* Logout - desktop */}
          <button
            onClick={handleLogout}
            className="nav-desktop"
            style={{
              background: "var(--text)",
              color: "var(--bg)",
              border: "none",
              padding: "8px 14px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Logout
          </button>

          {/* Hamburger - mobile */}
          <button
            className="nav-mobile"
            onClick={() => setOpen((o) => !o)}
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 18,
              color: "var(--text)",
            }}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div
            className="nav-mobile"
            style={{
              background: "var(--surface)",
              borderTop: "1px solid var(--border)",
              padding: "12px 20px 16px",
            }}
          >
            {NAV_LINKS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setOpen(false)}
                style={{
                  display: "block",
                  padding: "11px 0",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 15,
                  fontWeight: isActive(path) ? 700 : 500,
                  color: isActive(path) ? "var(--primary)" : "var(--text)",
                  textDecoration: "none",
                }}
              >
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              style={{
                marginTop: 12,
                width: "100%",
                background: "var(--text)",
                color: "var(--bg)",
                border: "none",
                borderRadius: 8,
                padding: "10px",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      <style>{`
        .nav-desktop { display: flex !important; }
        .nav-mobile  { display: none  !important; }
        @media (max-width: 768px) {
          .nav-desktop { display: none  !important; }
          .nav-mobile  { display: block !important; }
        }
      `}</style>
    </>
  );
}
