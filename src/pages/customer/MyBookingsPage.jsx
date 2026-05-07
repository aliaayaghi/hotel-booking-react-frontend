import React from "react";
import { Link } from "react-router-dom";

import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import {
  useCancelBooking,
  useMyBookings,
} from "../../features/bookings/bookingsHooks.js";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function formatPrice(amount) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 0,
  }).format(amount);
}

function getBookingList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

const CANCELLABLE_STATUSES = new Set(["PENDING", "CONFIRMED"]);

function CancelButton({ bookingId, status }) {
  const { mutate: cancel, isPending } = useCancelBooking(bookingId);
  if (!CANCELLABLE_STATUSES.has(status)) return null;

  function handleCancel() {
    if (window.confirm("Cancel this booking? This action cannot be undone.")) {
      cancel();
    }
  }

  return (
    <button
      type="button"
      className="button booking-card__cancel"
      onClick={handleCancel}
      disabled={isPending}
    >
      {isPending ? "Cancelling…" : "Cancel booking"}
    </button>
  );
}

function BookingCard({ booking }) {
  /* BookingResponseDTO: room is RoomSummary with roomName / roomType */
  const room = booking?.room ?? {};
  const roomLabel = room.roomName ?? room.roomType ?? null;

  /* Payment summary embedded in booking response */
  const payment = booking?.payment ?? null;

  return (
    <article className="booking-card">
      <div className="booking-card__media">
        <div className="booking-card__media-placeholder">
          <span>🏨</span>
        </div>
      </div>

      <div className="booking-card__body">
        <div className="booking-card__top">
          <div>
            <h2 className="booking-card__hotel-name">
              {roomLabel ?? "Booking"}
            </h2>
            {room.roomType && room.roomName && (
              <p className="booking-card__room-type">{room.roomType}</p>
            )}
          </div>
          <div className="booking-card__badges">
            <StatusBadge status={booking?.status} type="booking" />
            {payment?.status && (
              <StatusBadge status={payment.status} type="payment" />
            )}
          </div>
        </div>

        <dl className="booking-card__details">
          <div>
            <dt>Check-in</dt>
            <dd>{formatDate(booking?.checkInDate)}</dd>
          </div>
          <div>
            <dt>Check-out</dt>
            <dd>{formatDate(booking?.checkOutDate)}</dd>
          </div>
          <div>
            <dt>Guests</dt>
            <dd>
              {booking?.adults ?? 1} adult{booking?.adults !== 1 ? "s" : ""}
              {booking?.children ? `, ${booking.children} child${booking.children !== 1 ? "ren" : ""}` : ""}
            </dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd className="booking-card__price">
              {formatPrice(booking?.totalPrice)}
            </dd>
          </div>
        </dl>

        <div className="booking-card__actions">
          <Link
            to={`/customer/bookings/${booking?.id}`}
            className="button button--secondary booking-card__details-btn"
          >
            View details
          </Link>
          <CancelButton bookingId={booking?.id} status={booking?.status} />
        </div>
      </div>
    </article>
  );
}

export default function MyBookingsPage() {
  const { data, isLoading, isError, refetch } = useMyBookings();
  const bookings = getBookingList(data);

  if (isLoading) return <LoadingState message="Loading your bookings…" />;
  if (isError)   return <ErrorState message="Could not load your bookings." onRetry={refetch} />;

  return (
    <main className="public-page my-bookings-page">
      <div className="my-bookings-page__header">
        <p className="eyebrow">My account</p>
        <h1>My Bookings</h1>
        {bookings.length > 0 && (
          <p className="my-bookings-page__count">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="feedback-state">
          <p className="eyebrow">No bookings yet</p>
          <h2>Your booking history is empty</h2>
          <p>Browse hotels and make a reservation to get started.</p>
          <Link to="/search" className="button button--primary">
            Find hotels
          </Link>
        </div>
      ) : (
        <div className="booking-list">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id ?? booking.bookingId}
              booking={booking}
            />
          ))}
        </div>
      )}
    </main>
  );
}
