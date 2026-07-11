import { Link, useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Get avatar url based on preset name
  const getAvatarEmoji = (presetName) => {
    switch (presetName) {
      case "avatar-1.png": return "🦖";
      case "avatar-2.png": return "🦊";
      case "avatar-3.png": return "🐼";
      case "avatar-4.png": return "🐨";
      case "avatar-5.png": return "🦁";
      default: return "👤";
    }
  };

  return (
    <nav>
      <Link to="/" className="nav-logo">
        <span>🥗</span> Nutrition Assistant
      </Link>

      <div className="nav-links">
        <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
          Home
        </Link>

        {token ? (
          <>
            <Link to="/dashboard" className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}>
              Dashboard
            </Link>
            <Link to="/analytics" className={`nav-link ${location.pathname === "/analytics" ? "active" : ""}`}>
              Analytics
            </Link>
            <Link to="/report" className={`nav-link ${location.pathname === "/report" ? "active" : ""}`}>
              Report
            </Link>
            <Link to="/profile" className={`nav-link profile-nav-item ${location.pathname === "/profile" ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "1.2rem" }}>{getAvatarEmoji(user?.profilePicture)}</span>
              <span>{user?.name?.split(" ")[0] || "Profile"}</span>
            </Link>
            <button onClick={handleLogout} className="secondary btn-logout" style={{ padding: "0.4rem 0.9rem", fontSize: "0.85rem" }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={`nav-link ${location.pathname === "/login" ? "active" : ""}`}>
              Login
            </Link>
            <Link to="/register" className={`nav-link ${location.pathname === "/register" ? "active" : ""}`}>
              Register
            </Link>
          </>
        )}
        <ThemeToggle />
      </div>
    </nav>
  );
}

export default Navbar;