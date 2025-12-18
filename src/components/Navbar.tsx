import { useState } from "react";
import "./Navbar.css";

interface NavbarProps {
  onToggleSidebar: () => void;
  onLogout: () => void;
}

export default function Navbar({ onToggleSidebar, onLogout }: NavbarProps) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLangChange = (value: string) => {
    setLang(value);
    localStorage.setItem("lang", value);
    window.location.reload();
  };

  const translations = {
    en: {
      welcome: "Welcome",
      language: "Language",
      logout: "Logout",
      profile: "Profile",
    },
    ar: {
      welcome: "أهلا وسهلا",
      language: "اللغة",
      logout: "تسجيل الخروج",
      profile: "الملف الشخصي",
    },
  };

  const t = translations[lang as keyof typeof translations];

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="toggle-btn" onClick={onToggleSidebar} title="Toggle Sidebar">
          ☰
        </button>
        <h2 className="navbar-brand">Dashboard</h2>
      </div>

      <div className="navbar-right">
        <div className="lang-selector">
          <select value={lang} onChange={(e) => handleLangChange(e.target.value)}>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>

        <div className="user-menu">
          <button className="user-btn" onClick={() => setShowDropdown(!showDropdown)}>
            <span className="user-avatar">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
            <span>{user?.name || "User"}</span>
          </button>

          {showDropdown && (
            <div className="dropdown-menu">
              <a href="#profile">{t.profile}</a>
              <button onClick={onLogout} className="logout-btn">
                {t.logout}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
