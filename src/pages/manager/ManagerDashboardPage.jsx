import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import { axiosClient } from "../../api/axiosClient.js";
import { useHotelBookings } from "../../features/bookings/bookingsHooks.js";

async function getMyHotels() {
  const { data } = await axiosClient.get("/api/hotels/my");
  return data;
}

function useMyHotels() {
  return useQuery({
    queryKey: ["hotels", "my"],
    queryFn: getMyHotels,
  });
}

const BOOKING_STATUS_STYLES = {
  PENDING: { bg: "#fef3c7", color: "#92400e" },
  CONFIRMED: { bg: "#d1fae5", color: "#065f46" },
  CANCELLED: { bg: "#fee2e2", color: "#991b1b" },
  COMPLETED: { bg: "#e0e7ff", color: "#3730a3" },
  NO_SHOW: { bg: "#fce7f3", color: "#9d174d" },
};

function StatusBadge({ status }) {
  const style = BOOKING_STATUS_STYLES[status] ?? { bg: "#f3f4f6", color: "#374151" };
  return (
    <span className="booking-badge" style={{ background: style.bg, color: style.color }}>
      {status}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

function getBookingList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function getHotelList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function RecentBookingsTable({ bookings }) {
  if (!bookings.length) {
    return (
      <p className="dash-empty-note">No bookings yet for your hotel.</p>
    );
  }

  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Guest</th>
            <th>Room</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.slice(0, 10).map((b) => (
            <tr key={b.id ?? b.bookingId}>
              <td>{b.customer?.name ?? b.guestName ?? "—"}</td>
              <td>{b.room?.name ?? b.room?.type ?? "—"}</td>
              <td>{formatDate(b.checkInDate)}</td>
              <td>{formatDate(b.checkOutDate)}</td>
              <td>
                {b.totalPrice != null
                  ? `$${Number(b.totalPrice).toLocaleString()}`
                  : "—"}
              </td>
              <td>
                <StatusBadge status={b.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ManagerDashboardPage() {
  const { data: hotelsData, isLoading: hotelsLoading, isError: hotelsError } = useMyHotels();
  const hotels = getHotelList(hotelsData);
  const primaryHotel = hotels[0];

  const {
    data: bookingsData,
    isLoading: bookingsLoading,
  } = useHotelBookings(primaryHotel?.id, {});

  const bookings = getBookingList(bookingsData);
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;

  if (hotelsLoading) {
    return <LoadingState message="Loading your dashboard…" />;
  }

  if (hotelsError) {
    return <ErrorState message="Could not load hotel data." />;
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <p className="eyebrow">Hotel Manager</p>
        <h1>Dashboard</h1>
        {primaryHotel && (
          <p className="dash-page__subtitle">{primaryHotel.name}</p>
        )}
      </div>

      <div className="dash-stats-grid">
        <StatCard
          label="Total Bookings"
          value={bookingsLoading ? "…" : totalBookings}
          accent="#1f2937"
        />
        <StatCard
          label="Pending"
          value={bookingsLoading ? "…" : pendingBookings}
          note="Awaiting confirmation"
          accent="#c9a227"
        />
        <StatCard
          label="Confirmed"
          value={bookingsLoading ? "…" : confirmedBookings}
          accent="#2f6f4e"
        />
        <StatCard
          label="My Hotels"
          value={hotels.length}
          accent="#8b7355"
        />
      </div>

      {primaryHotel && (
        <div className="dash-hotel-card">
          <div className="dash-hotel-card__info">
            <p className="eyebrow">My Hotel</p>
            <h2>{primaryHotel.name}</h2>
            <p className="dash-hotel-card__meta">
              {[primaryHotel.city, primaryHotel.countryCode].filter(Boolean).join(", ")}
              {primaryHotel.starRating ? ` · ${primaryHotel.starRating}★` : ""}
            </p>
          </div>
          <div className="dash-hotel-card__actions">
            <Link to={`/manager/bookings`} className="button button--primary">
              View Bookings
            </Link>
            <Link to={`/manager/rooms`} className="button button--secondary">
              Manage Rooms
            </Link>
          </div>
        </div>
      )}

      {hotels.length === 0 && (
        <div className="feedback-state">
          <p className="eyebrow">No hotel yet</p>
          <h2>You haven&apos;t added a hotel</h2>
          <p>Create your first hotel to start accepting bookings.</p>
          <Link to="/manager/hotel/new" className="button button--primary">
            Add Hotel
          </Link>
        </div>
      )}

      <div className="dash-section">
        <div className="dash-section__header">
          <h2>Recent Bookings</h2>
          <Link to="/manager/bookings" className="dash-section__link">
            View all
          </Link>
        </div>
        {bookingsLoading ? (
          <LoadingState message="Loading bookings…" />
        ) : (
          <RecentBookingsTable bookings={bookings} />
        )}
      </div>

      <div className="dash-shortcuts">
        <p className="eyebrow">Quick Actions</p>
        <div className="dash-shortcuts__grid">
          <Link to="/manager/rooms" className="dash-shortcut-card">
            <span className="dash-shortcut-card__icon">🛏️</span>
            <span>Manage Rooms</span>
          </Link>
          <Link to="/manager/availability" className="dash-shortcut-card">
            <span className="dash-shortcut-card__icon">📅</span>
            <span>Availability</span>
          </Link>
          <Link to="/manager/bookings" className="dash-shortcut-card">
            <span className="dash-shortcut-card__icon">📋</span>
            <span>All Bookings</span>
          </Link>
          <Link to="/manager/account" className="dash-shortcut-card">
            <span className="dash-shortcut-card__icon">⚙️</span>
            <span>Account Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
