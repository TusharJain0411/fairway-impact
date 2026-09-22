import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Users,
  Heart,
  Trophy,
  CircleDollarSign,
  LogOut,
} from "lucide-react";

import { logoutUser } from "../../features/auth/authSlice";
import "../../styles/admin/admin-sidebar.css";

const links = [
  { name: "Overview", icon: LayoutDashboard, path: "/admin" },
  { name: "Users", icon: Users, path: "/admin/users" },
  { name: "Charities", icon: Heart, path: "/admin/charities" },
  { name: "Draws", icon: Trophy, path: "/admin/draws" },
  { name: "Winners", icon: CircleDollarSign, path: "/admin/winners" },
];

function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const initials =
    user?.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AD";

  const closeSidebar = () => setSidebarOpen?.(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    closeSidebar();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={`admin-sidebar ${sidebarOpen ? "admin-sidebar-open" : ""}`}
    >
      <button className="admin-sidebar-close-btn" onClick={closeSidebar}>
        ×
      </button>

      <Link to="/admin" className="admin-logo" onClick={closeSidebar}>
        Fairway<span>Impact</span>
        <small>ADMIN</small>
      </Link>

      <nav className="admin-links">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={closeSidebar}
              className={`admin-link ${
                location.pathname === link.path ? "admin-active-link" : ""
              }`}
            >
              <Icon size={19} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="admin-user">
        <div>{initials}</div>
        <span>
          <strong>{user?.name || "Admin"}</strong>
          <small>Platform manager</small>
        </span>
      </div>

      <button className="admin-logout-btn" onClick={handleLogout}>
        <LogOut size={18} />
        Log out
      </button>
    </aside>
  );
}

export default AdminSidebar;
