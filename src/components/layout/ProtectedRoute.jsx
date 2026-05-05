import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth.js";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoadingUser } = useAuth();
  const location = useLocation();

  if (isLoadingUser) {
    return (
      <section className="route-state" aria-live="polite">
        <p className="eyebrow">Checking session</p>
        <h1>Preparing your stay</h1>
        <p>We are confirming your secure access.</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children ?? <Outlet />;
}
