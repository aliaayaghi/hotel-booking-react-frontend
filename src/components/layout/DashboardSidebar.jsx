import React from "react";
import { NavLink } from "react-router-dom";

const dashboardLinks = [
  { to: "/customer", label: "Customer", role: "CUSTOMER" },
  { to: "/manager", label: "Manager", role: "HOTEL_MANAGER" },
  { to: "/admin", label: "Admin", role: "ADMIN" },
];

export default function DashboardSidebar() {
  return (
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar__brand">
        <span className="dashboard-sidebar__mark">HB</span>
        <span>Dashboards</span>
      </div>

      <nav className="dashboard-sidebar__nav" aria-label="Dashboard navigation">
        {dashboardLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive
                ? "dashboard-sidebar__link dashboard-sidebar__link--active"
                : "dashboard-sidebar__link"
            }
            end
          >
            <span>{link.label}</span>
            <small>{link.role}</small>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
