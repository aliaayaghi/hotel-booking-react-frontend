import React from "react";
import { useQuery } from "@tanstack/react-query";

import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import { getAdminStats } from "../../features/admin/admin.api.js";

function useAdminStats() {
  return useQuery({ queryKey: ["admin", "stats"], queryFn: getAdminStats });
}

function formatNum(v) {
  if (v == null) return "—";
  return new Intl.NumberFormat("en-US").format(v);
}

function formatCurrency(v) {
  if (v == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);
}

function StatCard({ label, value, accent }) {
  return (
    <div className="dash-stat-card" style={accent ? { borderTopColor: accent } : {}}>
      <p className="dash-stat-card__label">{label}</p>
      <p className="dash-stat-card__value">{value}</p>
    </div>
  );
}

function SectionHeader({ children }) {
  return <h2 className="dash-section__title">{children}</h2>;
}

export default function AdminReportsPage() {
  const { data, isLoading, isError, refetch } = useAdminStats();

  if (isLoading) return <LoadingState message="Loading reports…" />;
  if (isError) return <ErrorState message="Could not load reports." onRetry={refetch} />;

  const s = data ?? {};

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <p className="eyebrow">Admin</p>
        <h1>Platform Reports</h1>
      </div>

      <div className="dash-section">
        <SectionHeader>Bookings & Revenue</SectionHeader>
        <div className="dash-stats-grid">
          <StatCard label="Total Bookings" value={formatNum(s.totalBookings)} accent="#c9a227" />
          <StatCard label="Total Revenue" value={formatCurrency(s.totalRevenue)} accent="#065f46" />
        </div>
      </div>

      <div className="dash-section">
        <SectionHeader>Hotels</SectionHeader>
        <div className="dash-stats-grid">
          <StatCard label="Total Hotels" value={formatNum(s.totalHotels)} />
          <StatCard label="Active" value={formatNum(s.activeHotels)} accent="#065f46" />
          <StatCard label="Pending Approval" value={formatNum(s.pendingHotels)} accent="#c9a227" />
          <StatCard label="Rejected" value={formatNum(s.rejectedHotels)} accent="#991b1b" />
          <StatCard label="Suspended" value={formatNum(s.suspendedHotels)} accent="#9d174d" />
        </div>
      </div>

      <div className="dash-section">
        <SectionHeader>Users</SectionHeader>
        <div className="dash-stats-grid">
          <StatCard label="Total Users" value={formatNum(s.totalUsers)} />
          <StatCard label="Customers" value={formatNum(s.totalCustomers)} accent="#065f46" />
          <StatCard label="Hotel Managers" value={formatNum(s.totalManagers)} accent="#c9a227" />
          <StatCard label="Suspended Users" value={formatNum(s.suspendedUsers)} accent="#991b1b" />
        </div>
      </div>

      <div className="dash-section reports-breakdown">
        <SectionHeader>Summary Table</SectionHeader>
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Total Bookings", formatNum(s.totalBookings)],
                ["Total Revenue", formatCurrency(s.totalRevenue)],
                ["Total Hotels", formatNum(s.totalHotels)],
                ["Active Hotels", formatNum(s.activeHotels)],
                ["Pending Hotels", formatNum(s.pendingHotels)],
                ["Rejected Hotels", formatNum(s.rejectedHotels)],
                ["Suspended Hotels", formatNum(s.suspendedHotels)],
                ["Total Users", formatNum(s.totalUsers)],
                ["Customers", formatNum(s.totalCustomers)],
                ["Hotel Managers", formatNum(s.totalManagers)],
                ["Suspended Users", formatNum(s.suspendedUsers)],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td><strong>{value}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
