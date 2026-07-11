import { useEffect, useState } from "react";

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light-theme");
      root.classList.remove("dark-theme");
    } else {
      root.classList.add("dark-theme");
      root.classList.remove("light-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="secondary theme-toggle-btn"
      style={{
        padding: "0.5rem 0.8rem",
        fontSize: "0.9rem",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        background: "rgba(255, 255, 255, 0.08)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-sm)",
        color: "var(--text-primary)",
        cursor: "pointer",
        transition: "var(--transition)"
      }}
      title="Toggle Light/Dark Theme"
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}

export default ThemeToggle;
