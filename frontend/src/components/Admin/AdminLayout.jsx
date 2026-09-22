import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "../../styles/admin/admin-dashboard.css";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="admin-layout">
      <button
        className="admin-mobile-sidebar-btn"
        onClick={() => setSidebarOpen(true)}
      >
        <p>  <span>F</span>
        <strong>I</strong>
      </p>
      </button>

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <section className="admin-page-content">
        <Outlet />
      </section>
    </main>
  );
}

export default AdminLayout;
