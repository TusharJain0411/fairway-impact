import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  Trophy,
  Heart,
  CircleDollarSign,
  LogOut,
  X,
} from "lucide-react";

import { logoutUser } from "../../features/auth/authSlice";
import "../../styles/dashboard/dashboard-sidebar.css";

const links = [
  { name: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { name: "My Scores", icon: Trophy, path: "/dashboard/scores" },
  { name: "My Charity", icon: Heart, path: "/dashboard/my-charity" },
  { name: "Winnings", icon: CircleDollarSign, path: "/dashboard/winnings" },
];

function DashboardSidebar({ sidebarOpen, setSidebarOpen }) {
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
      .toUpperCase() || "FI";

  const closeSidebar = () => setSidebarOpen?.(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    closeSidebar();
    navigate("/login", { replace: true });
  };

  return (
    <aside className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
      <button className="sidebar-close-btn" onClick={closeSidebar}>
        <X size={22} />
      </button>

      <Link to="/dashboard" className="dashboard-logo" onClick={closeSidebar}>
        Fairway<span>Impact</span>
      </Link>

      <nav className="dashboard-links">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={closeSidebar}
              className={`dashboard-link ${
                location.pathname === link.path ? "active-link" : ""
              }`}
            >
              <Icon size={19} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">{initials}</div>

        <div className="user-details">
          <strong>{user?.name || "Member"}</strong>
          <p>Active Member</p>
        </div>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={18} />
        <span>Log out</span>
      </button>
    </aside>
  );
}

export default DashboardSidebar;
