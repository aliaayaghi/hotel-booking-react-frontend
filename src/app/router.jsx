import React from "react";
import { createBrowserRouter } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import PublicLayout from "../components/layout/PublicLayout.jsx";
import AboutPage from "../pages/public/AboutPage.jsx";
import HomePage from "../pages/public/HomePage.jsx";
import NotFoundPage from "../pages/public/NotFoundPage.jsx";

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
          <DashboardPlaceholderPage
            title="Customer Dashboard"
            role="CUSTOMER"
          />
        ),
      },
      {
        path: "/manager",
        element: (
          <DashboardPlaceholderPage
            title="Manager Dashboard"
            role="HOTEL_MANAGER"
          />
        ),
      },
      {
        path: "/admin",
        element: (
          <DashboardPlaceholderPage title="Admin Dashboard" role="ADMIN" />
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
