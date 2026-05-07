import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "../../hooks/useAuth.js";
import { getUserRoles, userHasRole } from "../../utils/roleUtils.js";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
];

const customerMenuItems = [
  { to: "/customer/bookings", label: "My Bookings" },
  { to: "/saved-hotels", label: "Saved Hotels" },
  { to: "/account/settings", label: "Account Settings" },
  { to: "/payment-methods", label: "Payment Methods" },
  { to: "/help", label: "Help & Support" },
];

function getRoleLabel(user) {
  const roles = getUserRoles(user);
  if (roles.includes("ADMIN")) return "Admin";
  if (roles.includes("HOTEL_MANAGER")) return "Manager";
  return "Customer";
}

function getDashboardPath(user) {
  const roles = getUserRoles(user);
  if (roles.includes("ADMIN")) return "/admin/dashboard";
  if (roles.includes("HOTEL_MANAGER")) return "/manager/dashboard";
  return null;
}

function CustomerDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const initials = (user?.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <div className="profile-dropdown" ref={ref}>
      <button
        type="button"
        className="profile-dropdown__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user?.name ?? "user"}`}
      >
        <span className="profile-dropdown__avatar">{initials}</span>
        <span className="profile-dropdown__caret" aria-hidden="true">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="profile-dropdown__menu" role="menu">
          <div className="profile-dropdown__header">
            <div className="profile-dropdown__avatar profile-dropdown__avatar--lg">
              {initials}
            </div>
            <div className="profile-dropdown__info">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
              <span className="profile-dropdown__role">Customer</span>
            </div>
          </div>

          <div className="profile-dropdown__divider" />

          {customerMenuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="profile-dropdown__item"
              role="menuitem"
              onClick={close}
            >
              {item.label}
            </NavLink>
          ))}

          <div className="profile-dropdown__divider" />

          <button
            type="button"
            className="profile-dropdown__item profile-dropdown__item--logout"
            role="menuitem"
            onClick={() => {
              close();
              onLogout();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function ManagerAdminMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const initials = (user?.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const dashboardPath = getDashboardPath(user);
  const roleLabel = getRoleLabel(user);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function close() {
    setOpen(false);
  }

  return (
    <div className="profile-dropdown" ref={ref}>
      <button
        type="button"
        className="profile-dropdown__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${user?.name ?? "user"}`}
      >
        <span className="profile-dropdown__avatar">{initials}</span>
        <span className="profile-dropdown__caret" aria-hidden="true">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="profile-dropdown__menu" role="menu">
          <div className="profile-dropdown__header">
            <div className="profile-dropdown__avatar profile-dropdown__avatar--lg">
              {initials}
            </div>
            <div className="profile-dropdown__info">
              <strong>{user?.name}</strong>
              <span>{user?.email}</span>
              <span className="profile-dropdown__role">{roleLabel}</span>
            </div>
          </div>

          <div className="profile-dropdown__divider" />

          {dashboardPath && (
            <NavLink
              to={dashboardPath}
              className="profile-dropdown__item"
              role="menuitem"
              onClick={close}
            >
              Go to Dashboard
            </NavLink>
          )}

          <button
            type="button"
            className="profile-dropdown__item profile-dropdown__item--logout"
            role="menuitem"
            onClick={() => {
              close();
              onLogout();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { isAuthenticated, isLoadingUser, user, logout } = useAuth();
  const isCustomer = isAuthenticated && userHasRole(user, "CUSTOMER");

  async function handleLogout() {
    try {
      await logout();
      toast.success("You've been signed out");
    } catch {
      toast.error("Sign out failed. Please try again.");
    }
  }

  return (
    <header className="navbar">
      <NavLink to="/" className="navbar__brand" aria-label="Hotel booking home">
        <span className="navbar__mark">HB</span>
        <span>Hotel Booking</span>
      </NavLink>

      <nav className="navbar__links" aria-label="Public navigation">
        {publicLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? "navbar__link navbar__link--active" : "navbar__link"
            }
            end={link.to === "/"}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="navbar__actions" aria-label="Account links">
        {isLoadingUser ? (
          <span className="navbar__link" style={{ opacity: 0.5 }}>
            Loading…
          </span>
        ) : isAuthenticated && user ? (
          isCustomer ? (
            <CustomerDropdown user={user} onLogout={handleLogout} />
          ) : (
            <ManagerAdminMenu user={user} onLogout={handleLogout} />
          )
        ) : (
          <>
            <NavLink to="/login" className="navbar__link">
              Login
            </NavLink>
            <NavLink to="/register" className="navbar__button">
              Register
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
