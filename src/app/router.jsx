import React from "react";
import { createBrowserRouter } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import PublicLayout from "../components/layout/PublicLayout.jsx";
import RoleRoute from "../components/layout/RoleRoute.jsx";
import AboutPage from "../pages/public/AboutPage.jsx";
import HomePage from "../pages/public/HomePage.jsx";
import NotFoundPage from "../pages/public/NotFoundPage.jsx";
import SearchResultsPage from "../pages/public/SearchResultsPage.jsx";
import { USER_ROLES } from "../utils/roleUtils.js";

function PublicPlaceholderPage({ title, eyebrow }) {
  return (
    <main className="public-page public-page--narrow">
      <section className="content-panel" aria-labelledby={`${title}-title`}>
        <p className="eyebrow">{eyebrow}</p>
        <h1 id={`${title}-title`}>{title}</h1>
        <p>Frontend-only placeholder. No backend requests yet.</p>
      </section>
    </main>
  );
}

function DashboardPlaceholderPage({ title, role }) {
  return (
    <section className="dashboard-panel" aria-labelledby={`${role}-title`}>
      <p className="eyebrow">{role}</p>
      <h1 id={`${role}-title`}>{title}</h1>
      <p>
        Dashboard placeholder for the {role} role. Route protection and API data
        will be added in later tasks.
      </p>
      <span className="status-badge">No backend requests yet</span>
    </section>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
      {
        path: "search",
        element: <SearchResultsPage />,
      },
      {
        path: "login",
        element: <PublicPlaceholderPage title="Login" eyebrow="Auth" />,
      },
      {
        path: "register",
        element: <PublicPlaceholderPage title="Register" eyebrow="Auth" />,
      },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        path: "/customer",
        element: (
          <RoleRoute allowedRole={USER_ROLES.CUSTOMER}>
            <DashboardPlaceholderPage
              title="Customer Dashboard"
              role="CUSTOMER"
            />
          </RoleRoute>
        ),
      },
      {
        path: "/manager",
        element: (
          <RoleRoute allowedRole={USER_ROLES.HOTEL_MANAGER}>
            <DashboardPlaceholderPage
              title="Manager Dashboard"
              role="HOTEL_MANAGER"
            />
          </RoleRoute>
        ),
      },
      {
        path: "/admin",
        element: (
          <RoleRoute allowedRole={USER_ROLES.ADMIN}>
            <DashboardPlaceholderPage title="Admin Dashboard" role="ADMIN" />
          </RoleRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
