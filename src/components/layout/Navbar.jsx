import React from "react";
import { NavLink } from "react-router-dom";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
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
        <NavLink to="/login" className="navbar__link">
          Login
        </NavLink>
        <NavLink to="/register" className="navbar__button">
          Register
        </NavLink>
      </div>
    </header>
  );
}
