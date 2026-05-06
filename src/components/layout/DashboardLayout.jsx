import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import DashboardSidebar from "./DashboardSidebar.jsx";

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`dashboard-layout${collapsed ? " dashboard-layout--collapsed" : ""}`}
    >
      <DashboardSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <main className="dashboard-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
