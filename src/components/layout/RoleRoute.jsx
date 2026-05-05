import React from "react";
import { Link, Outlet } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth.js";
import { userHasRole } from "../../utils/roleUtils.js";
import ProtectedRoute from "./ProtectedRoute.jsx";

function AccessDenied() {
  return (
    <section className="route-state route-state--denied">
      <p className="eyebrow">Access denied</p>
      <h1>This area is not available for your account.</h1>
      <p>
        Your signed-in role does not have permission to view this dashboard.
      </p>
      <Link className="button button--primary" to="/">
        Return home
      </Link>
    </section>
  );
}

export default function RoleRoute({ allowedRole, children }) {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {userHasRole(user, allowedRole) ? children ?? <Outlet /> : <AccessDenied />}
    </ProtectedRoute>
  );
}
