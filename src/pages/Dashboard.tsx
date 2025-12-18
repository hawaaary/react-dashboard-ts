import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MenuItem } from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import DataTable from "../components/DataTable";
import "./Dashboard.css";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuItem | null>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleMenuItemClick = (item: MenuItem) => {
    setActiveMenu(item);
  };

  return (
    <div className="dashboard-container">
      <Sidebar 
        isOpen={sidebarOpen} 
        onLogout={handleLogout}
        onMenuItemClick={handleMenuItemClick}
      />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} onLogout={handleLogout} />
        <div className="dashboard-body">
          {activeMenu ? (
            <DataTable 
              source={activeMenu.source}
              label={activeMenu.label[localStorage.getItem("lang") === "ar" ? "ar" : "en"]}
            />
          ) : (
            <div className="welcome-section">
              <h1>Welcome to Dashboard</h1>
              <p>Select a menu item from the sidebar to start</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
