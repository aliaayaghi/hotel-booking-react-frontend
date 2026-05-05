import React from "react";
import { Outlet } from "react-router-dom";

import DashboardSidebar from "./DashboardSidebar.jsx";

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <DashboardSidebar />
      <main className="dashboard-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
