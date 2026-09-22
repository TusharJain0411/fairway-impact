import { useState } from "react";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "../../components/Dashboard/DashboardSidebar";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="dashboard-layout">
      {/* Mobile FI button */}
      <button
        className="mobile-sidebar-btn"
        onClick={() => setSidebarOpen(true)}
      >
        <p>
          <span style={{ color: "#fff" }}>F</span> 
          <span style={{ color: "#f4c95d" ,fontWeight:"700"}}>I</span>
        </p>
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <section className="dashboard-page-content">
        <Outlet />
      </section>
    </main>
  );
}

export default DashboardLayout;
