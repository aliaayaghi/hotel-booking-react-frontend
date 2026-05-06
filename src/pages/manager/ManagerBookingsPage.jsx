import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import BookingDetailsModal from "../../components/dashboard/BookingDetailsModal.jsx";
import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import { getMyHotels } from "../../features/manager/manager.api.js";
import {
  useHotelBookings,
  useCancelBooking,
  useConfirmBooking,
  useCompleteBooking,
  useNoShowBooking,
} from "../../features/bookings/bookingsHooks.js";
import { useQuery } from "@tanstack/react-query";

function useMyHotel() {
  return useQuery({
    queryKey: ["hotels", "my"],
    queryFn: getMyHotels,
    select: (data) => {
      if (Array.isArray(data)) return data[0];
      if (Array.isArray(data?.data)) return data.data[0];
      if (Array.isArray(data?.content)) return data.content[0];
      return null;
    },
  });
}

function getBookingList(data) {
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

function ActionButtons({ booking }) {
  const { mutate: confirm, isPending: confirming } = useConfirmBooking(booking.id);
  const { mutate: complete, isPending: completing } = useCompleteBooking(booking.id);
  const { mutate: noShow, isPending: noShowing } = useNoShowBooking(booking.id);
  const { mutate: cancel, isPending: cancelling } = useCancelBooking(booking.id);
  const busy = confirming || completing || noShowing || cancelling;
  const status = booking.status;

  return (
    <div className="dash-table__actions">
      {status === "PENDING" && (
        <button className="dash-action-btn dash-action-btn--confirm" onClick={() => confirm()} disabled={busy}>
          Confirm
        </button>
      )}
      {status === "CONFIRMED" && (
        <>
          <button className="dash-action-btn dash-action-btn--complete" onClick={() => complete()} disabled={busy}>
            Complete
          </button>
          <button className="dash-action-btn dash-action-btn--noshow" onClick={() => noShow()} disabled={busy}>
            No-show
          </button>
        </>
      )}
      {(status === "PENDING" || status === "CONFIRMED") && (
        <button
          className="dash-action-btn dash-action-btn--cancel"
          onClick={() => { if (window.confirm("Cancel this booking?")) cancel(); }}
          disabled={busy}
        >
          Cancel
        </button>
      )}
    </div>
  );
}

function BookingsTable({ bookings, onViewDetails }) {
  if (bookings.length === 0) {
    return (
      <div className="feedback-state">
        <p className="eyebrow">No results</p>
        <h2>No bookings found</h2>
        <p>Try a different status filter.</p>
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
            <th>Actions</th>
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
                <td><ActionButtons booking={b} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ManagerBookingsPage() {
  const { data: hotel, isLoading: hotelLoading, isError: hotelError } = useMyHotel();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const params = statusFilter !== "ALL" ? { status: statusFilter } : {};
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch,
  } = useHotelBookings(hotel?.id, params);

  const bookings = getBookingList(bookingsData);
  const isLoading = hotelLoading || bookingsLoading;
  const isError = hotelError || bookingsError;

  if (isLoading) return <LoadingState message="Loading bookings…" />;
  if (isError) return <ErrorState message="Could not load bookings." onRetry={refetch} />;

  if (!hotel) {
    return (
      <div className="dash-page">
        <div className="dash-page__header">
          <p className="eyebrow">Hotel Manager</p>
          <h1>Bookings</h1>
        </div>
        <div className="feedback-state">
          <p className="eyebrow">No hotel</p>
          <h2>No hotel assigned</h2>
          <p>Contact the admin to get a hotel assigned to your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <p className="eyebrow">Hotel Manager</p>
        <h1>Bookings</h1>
        <p className="dash-page__subtitle">{hotel.name}</p>
      </div>

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
        <p className="dash-results-count">{bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>
      </div>

      <BookingsTable bookings={bookings} onViewDetails={setSelectedBooking} />

      {selectedBooking && (
        <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
    </div>
  );
}
