import { useState, useEffect } from "react";
import API from "../api/http";
import { getLogoForSource } from "../utils/logos";
import "./Sidebar.css";

export interface MenuItem {
  id: number;
  index: number;
  source: string;
  label: { ar: string; en: string };
  icon_path: string;
  ishidden: number;
}

interface SidebarProps {
  isOpen: boolean;
  onLogout: () => void;
  onMenuItemClick: (item: MenuItem) => void;
}

export default function Sidebar({ isOpen, onLogout, onMenuItemClick }: SidebarProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const lang = localStorage.getItem("lang") || "en";

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await API.get("/side-bars");
      if (response.data.status === 200) {
        // Filter hidden items and sort by index
        const visibleItems = response.data.data
          .filter((item: MenuItem) => item.ishidden === 0)
          .sort((a: MenuItem, b: MenuItem) => a.index - b.index);
        setMenuItems(visibleItems);
        if (visibleItems.length > 0) {
          setActiveItem(visibleItems[0].source);
          // Load the first item's data
          onMenuItemClick(visibleItems[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuItemClick = (item: MenuItem) => {
    setActiveItem(item.source);
    onMenuItemClick(item);
  };

  if (loading) {
    return <aside className="sidebar open"><div className="sidebar-loading">Loading...</div></aside>;
  }

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <h3>Menu</h3>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeItem === item.source ? "active" : ""}`}
            onClick={() => handleMenuItemClick(item)}
            title={item.label[lang as keyof typeof item.label]}
          >
            <div className="nav-icon-wrapper">
              <span className="nav-logo">{getLogoForSource(item.source)}</span>
            </div>
            <span className="nav-label">{item.label[lang as keyof typeof item.label]}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn-sidebar" onClick={onLogout}>
          <span className="nav-logo">🚪</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
