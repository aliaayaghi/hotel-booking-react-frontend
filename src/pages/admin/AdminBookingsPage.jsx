import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import BookingDetailsModal from "../../components/dashboard/BookingDetailsModal.jsx";
import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import { getAdminHotels } from "../../features/admin/admin.api.js";
import { useHotelBookings } from "../../features/bookings/bookingsHooks.js";

function getList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatPrice(v) {
  if (v == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);
}

const STATUS_FILTERS = ["ALL", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];

function BookingsTable({ bookings, onViewDetails }) {
  if (bookings.length === 0) {
    return (
      <div className="feedback-state">
        <p className="eyebrow">No bookings</p>
        <h2>No bookings found for this hotel</h2>
      </div>
    );
  }

  return (
    <div className="dash-table-wrapper">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Guest</th>
            <th>Room</th>
            <th>Check-in</th>
            <th>Check-out</th>
            <th>Guests</th>
            <th>Total</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const customer = b.customer ?? b.user ?? {};
            const room = b.room ?? {};
            const guests = [
              b.adults ? `${b.adults} adult${b.adults !== 1 ? "s" : ""}` : null,
              b.children ? `${b.children} child${b.children !== 1 ? "ren" : ""}` : null,
            ].filter(Boolean).join(", ") || "1 adult";

            return (
              <tr key={b.id ?? b.bookingId}>
                <td>
                  <button className="dash-table__link" onClick={() => onViewDetails(b)}>
                    #{(b.id ?? b.bookingId ?? "").slice(0, 8)}
                  </button>
                </td>
                <td>{customer.name ?? b.guestName ?? "—"}</td>
                <td>{room.name ?? room.type ?? b.roomName ?? "—"}</td>
                <td>{formatDate(b.checkInDate)}</td>
                <td>{formatDate(b.checkOutDate)}</td>
                <td>{guests}</td>
                <td>{formatPrice(b.totalPrice ?? b.totalAmount)}</td>
                <td><StatusBadge status={b.status} type="booking" /></td>
                <td>
                  <button className="dash-action-btn" onClick={() => onViewDetails(b)}>View</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminBookingsPage() {
  const [selectedHotelId, setSelectedHotelId] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { data: hotelsData, isLoading: hotelsLoading, isError: hotelsError } = useQuery({
    queryKey: ["admin", "hotels", "ALL"],
    queryFn: () => getAdminHotels(),
  });

  const params = statusFilter !== "ALL" ? { status: statusFilter } : {};
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch: refetchBookings,
  } = useHotelBookings(selectedHotelId || null, params);

  if (hotelsLoading) return <LoadingState message="Loading hotels…" />;
  if (hotelsError) return <ErrorState message="Could not load hotels." />;

  const hotels = getList(hotelsData);
  const bookings = getList(bookingsData);
  const selectedHotel = hotels.find((h) => h.id === selectedHotelId);

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <p className="eyebrow">Admin</p>
        <h1>All Bookings</h1>
      </div>

      <div className="dash-section">
        <div className="auth-field" style={{ maxWidth: 400 }}>
          <label className="auth-field__label">Select hotel to view bookings</label>
          <select
            className="auth-field__input"
            value={selectedHotelId}
            onChange={(e) => { setSelectedHotelId(e.target.value); setStatusFilter("ALL"); }}
          >
            <option value="">Choose a hotel…</option>
            {hotels.map((h) => (
              <option key={h.id} value={h.id}>{h.name} {h.city ? `— ${h.city}` : ""}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedHotelId ? (
        <div className="feedback-state">
          <p className="eyebrow">Select a hotel</p>
          <h2>Choose a hotel above</h2>
          <p>Select a hotel from the dropdown to view its bookings.</p>
        </div>
      ) : (
        <>
          <div className="dash-filters">
            <div className="dash-filter-group">
              <label className="dash-filter-label">Status</label>
              <div className="dash-filter-tabs">
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s}
                    className={`dash-filter-tab${statusFilter === s ? " dash-filter-tab--active" : ""}`}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase().replace("_", "-")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {bookingsLoading ? (
            <LoadingState message="Loading bookings…" />
          ) : bookingsError ? (
            <ErrorState message="Could not load bookings." onRetry={refetchBookings} />
          ) : (
            <>
              <p className="dash-results-count">
                {bookings.length} booking{bookings.length !== 1 ? "s" : ""} for {selectedHotel?.name}
              </p>
              <BookingsTable bookings={bookings} onViewDetails={setSelectedBooking} />
            </>
          )}
        </>
      )}

      {selectedBooking && (
        <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
    </div>
  );
}
