import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "../../hooks/useAuth.js";
import { getUserRoles } from "../../utils/roleUtils.js";

/* ---- Icon components ---- */
function Icon({ d, d2, d3, circle, rect, line, polyline }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {d && <path d={d} />}
      {d2 && <path d={d2} />}
      {d3 && <path d={d3} />}
      {circle && <circle cx={circle.cx} cy={circle.cy} r={circle.r} />}
      {rect && <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={rect.rx} />}
      {line && <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />}
      {polyline && <polyline points={polyline} />}
    </svg>
  );
}

const Icons = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  Hotel: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Bookings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  Rooms: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 9V6a2 2 0 012-2h16a2 2 0 012 2v3" />
      <path d="M2 11v10" /><path d="M22 11v10" />
      <path d="M2 15h20" /><path d="M6 9h12" />
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  Reports: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
};

const managerLinks = [
  { to: "/manager/dashboard", label: "Dashboard", Icon: Icons.Dashboard, end: true },
  { to: "/manager/hotel", label: "My Hotel", Icon: Icons.Hotel },
  { to: "/manager/bookings", label: "Bookings", Icon: Icons.Bookings },
  { to: "/manager/rooms", label: "Rooms", Icon: Icons.Rooms },
  { to: "/manager/availability", label: "Availability", Icon: Icons.Calendar },
  { to: "/manager/account", label: "Account Settings", Icon: Icons.Settings },
];

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard", Icon: Icons.Dashboard, end: true },
  { to: "/admin/hotels", label: "Manage Hotels", Icon: Icons.Hotel },
  { to: "/admin/users", label: "Manage Users", Icon: Icons.Users },
  { to: "/admin/bookings", label: "All Bookings", Icon: Icons.Bookings },
  { to: "/admin/reports", label: "Reports", Icon: Icons.Reports },
  { to: "/admin/account", label: "Account Settings", Icon: Icons.Settings },
];

function getRoleConfig(user) {
  const roles = getUserRoles(user);
  if (roles.includes("ADMIN")) {
    return { label: "Admin Panel", links: adminLinks };
  }
  if (roles.includes("HOTEL_MANAGER")) {
    return { label: "Manager Panel", links: managerLinks };
  }
  return { label: "Dashboard", links: [] };
}

export default function DashboardSidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { label, links } = getRoleConfig(user);

  async function handleLogout() {
    try {
      await logout();
      toast.success("You've been signed out");
      navigate("/");
    } catch {
      toast.error("Sign out failed.");
    }
  }

  return (
    <aside
      className={`dashboard-sidebar${collapsed ? " dashboard-sidebar--collapsed" : ""}`}
      aria-label="Dashboard navigation"
    >
      <div className="dashboard-sidebar__top">
        {!collapsed && (
          <Link to="/" className="dashboard-sidebar__brand">
            <span className="dashboard-sidebar__mark">HB</span>
            <span>Hotel Booking</span>
          </Link>
        )}
        <button
          type="button"
          className="dashboard-sidebar__toggle"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
        </button>
      </div>

      {!collapsed && (
        <p className="dashboard-sidebar__section-label">{label}</p>
      )}

      <nav className="dashboard-sidebar__nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end ?? false}
            className={({ isActive }) =>
              `dashboard-sidebar__link${isActive ? " dashboard-sidebar__link--active" : ""}`
            }
            title={collapsed ? link.label : undefined}
          >
            <span className="dashboard-sidebar__icon">
              <link.Icon />
            </span>
            {!collapsed && (
              <span className="dashboard-sidebar__link-label">{link.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="dashboard-sidebar__footer">
        {!collapsed && user && (
          <div className="dashboard-sidebar__user">
            <span className="dashboard-sidebar__user-name">{user.name}</span>
            <span className="dashboard-sidebar__user-email">{user.email}</span>
          </div>
        )}
        <button
          type="button"
          className="dashboard-sidebar__link dashboard-sidebar__link--logout"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
        >
          <span className="dashboard-sidebar__icon">
            <Icons.Logout />
          </span>
          {!collapsed && (
            <span className="dashboard-sidebar__link-label">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}
