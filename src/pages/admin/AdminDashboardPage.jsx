import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import { getAdminStats, getAdminHotels } from "../../features/admin/admin.api.js";

function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: getAdminStats,
  });
}

function useAdminHotels() {
  return useQuery({
    queryKey: ["admin", "hotels", { page: 0, size: 10 }],
    queryFn: () => getAdminHotels({ page: 0, size: 10 }),
  });
}

const HOTEL_STATUS_STYLES = {
  PENDING: { bg: "#fef3c7", color: "#92400e" },
  ACTIVE: { bg: "#d1fae5", color: "#065f46" },
  REJECTED: { bg: "#fee2e2", color: "#991b1b" },
  SUSPENDED: { bg: "#fce7f3", color: "#9d174d" },
};

function StatusBadge({ status }) {
  const style = HOTEL_STATUS_STYLES[status] ?? { bg: "#f3f4f6", color: "#374151" };
  return (
    <span className="booking-badge" style={{ background: style.bg, color: style.color }}>
      {status}
    </span>
  );
}

function StatCard({ label, value, note, accent }) {
  return (
    <div className="dash-stat-card" style={accent ? { borderTopColor: accent } : {}}>
      <p className="dash-stat-card__label">{label}</p>
      <p className="dash-stat-card__value">{value ?? "—"}</p>
      {note && <p className="dash-stat-card__note">{note}</p>}
    </div>
  );
}

function getHotelList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function RecentHotelsTable({ hotels }) {
  if (!hotels.length) {
    return <p className="dash-empty-note">No hotels found.</p>;
  }

  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Hotel Name</th>
            <th>City</th>
            <th>Stars</th>
            <th>Manager</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hotels.slice(0, 10).map((h) => (
            <tr key={h.id}>
              <td>
                <Link to={`/hotels/${h.id}`} className="dash-table__link">
                  {h.name}
                </Link>
              </td>
              <td>{h.city ?? "—"}</td>
              <td>{h.starRating ? `${h.starRating}★` : "—"}</td>
              <td>{h.manager?.name ?? h.managerName ?? "—"}</td>
              <td>
                <StatusBadge status={h.status} />
              </td>
              <td>
                <Link to={`/admin/hotels`} className="dash-table__action">
                  Manage
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useAdminStats();
  const { data: hotelsData, isLoading: hotelsLoading } = useAdminHotels();
  const hotels = getHotelList(hotelsData);

  if (statsLoading && hotelsLoading) {
    return <LoadingState message="Loading admin dashboard…" />;
  }

  if (statsError) {
    return <ErrorState message="Could not load admin stats." />;
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <p className="eyebrow">Admin</p>
        <h1>Dashboard</h1>
      </div>

      <div className="dash-stats-grid">
        <StatCard
          label="Total Hotels"
          value={statsLoading ? "…" : (stats?.totalHotels ?? stats?.hotelCount ?? "—")}
          accent="#1f2937"
        />
        <StatCard
          label="Total Users"
          value={statsLoading ? "…" : (stats?.totalUsers ?? stats?.userCount ?? "—")}
          accent="#c9a227"
        />
        <StatCard
          label="Total Bookings"
          value={statsLoading ? "…" : (stats?.totalBookings ?? stats?.bookingCount ?? "—")}
          accent="#2f6f4e"
        />
        <StatCard
          label="Total Managers"
          value={statsLoading ? "…" : (stats?.totalManagers ?? stats?.managerCount ?? "—")}
          accent="#8b7355"
        />
      </div>

      <div className="dash-section">
        <div className="dash-section__header">
          <h2>Recent Hotels</h2>
          <Link to="/admin/hotels" className="dash-section__link">
            View all
          </Link>
        </div>
        {hotelsLoading ? (
          <LoadingState message="Loading hotels…" />
        ) : (
          <RecentHotelsTable hotels={hotels} />
        )}
      </div>

      <div className="dash-shortcuts">
        <p className="eyebrow">Quick Actions</p>
        <div className="dash-shortcuts__grid">
          <Link to="/admin/hotels" className="dash-shortcut-card">
            <span className="dash-shortcut-card__icon">🏨</span>
            <span>Manage Hotels</span>
          </Link>
          <Link to="/admin/users" className="dash-shortcut-card">
            <span className="dash-shortcut-card__icon">👥</span>
            <span>Manage Users</span>
          </Link>
          <Link to="/admin/bookings" className="dash-shortcut-card">
            <span className="dash-shortcut-card__icon">📋</span>
            <span>All Bookings</span>
          </Link>
          <Link to="/admin/reports" className="dash-shortcut-card">
            <span className="dash-shortcut-card__icon">📊</span>
            <span>Reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
