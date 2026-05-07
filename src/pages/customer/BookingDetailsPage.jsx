import React from "react";
import { Link, useParams } from "react-router-dom";

import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import {
  useBooking,
  useCancelBooking,
} from "../../features/bookings/bookingsHooks.js";
import { usePaymentByBooking } from "../../features/payments/paymentsHooks.js";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatUsd(price) {
  if (price == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 2,
  }).format(price);
}

const PAYMENT_METHOD_LABELS = {
  CREDIT_CARD: "Credit card",
  DEBIT_CARD: "Debit card",
  BANK_TRANSFER: "Bank transfer",
};

const CANCELLABLE_STATUSES = new Set(["PENDING", "CONFIRMED"]);

function CancelSection({ bookingId, status }) {
  const { mutate: cancel, isPending } = useCancelBooking(bookingId);

  if (!CANCELLABLE_STATUSES.has(status)) return null;

  function handleCancel() {
    if (window.confirm("Cancel this booking? This action cannot be undone.")) {
      cancel();
    }
  }

  return (
    <div className="booking-details-section booking-details-section--danger">
      <h2 className="booking-details-section__title">Cancel booking</h2>
      <p className="booking-details-section__note">
        Once cancelled, this booking cannot be restored.
      </p>
      <button
        type="button"
        className="button booking-details__cancel-btn"
        onClick={handleCancel}
        disabled={isPending}
      >
        {isPending ? "Cancelling…" : "Cancel this booking"}
      </button>
    </div>
  );
}

export default function BookingDetailsPage() {
  const { bookingId } = useParams();

  const bookingQuery = useBooking(bookingId);
  const paymentQuery = usePaymentByBooking(bookingId);

  /* API wraps response: { success, message, data: <DTO>, timestamp } */
  const booking = bookingQuery.data?.data ?? null;
  const payment = paymentQuery.data?.data ?? null;

  const room = booking?.room ?? {};
  const roomLabel = room.roomName ?? room.roomType ?? null;
  const nights = booking?.numberOfNights ?? 0;

  /* Prefer standalone payment data; fall back to summary embedded in booking */
  const paymentData = payment ?? booking?.payment ?? null;
  const paymentStatus = paymentData?.status;

  if (bookingQuery.isLoading) return <LoadingState message="Loading booking details…" />;
  if (bookingQuery.isError)
    return (
      <ErrorState
        message="Could not load booking details."
        onRetry={bookingQuery.refetch}
      />
    );
  if (!booking)
    return (
      <ErrorState message="Booking not found." onRetry={bookingQuery.refetch} />
    );

  return (
    <main className="public-page booking-details-page">
      {/* Breadcrumb */}
      <nav className="hotel-details-breadcrumb" aria-label="Breadcrumb">
        <Link to="/customer/bookings">My bookings</Link>
        <span aria-hidden="true">/</span>
        <span>Booking details</span>
      </nav>

      <div className="booking-details-page__header">
        <div>
          <p className="eyebrow">Booking details</p>
          <h1 className="booking-details-page__title">
            {roomLabel ?? "Your booking"}
          </h1>
          {room.roomType && room.roomName && (
            <p className="booking-details-page__subtitle">{room.roomType}</p>
          )}
        </div>
        <div className="booking-details-page__badges">
          <StatusBadge status={booking.status} type="booking" />
          {paymentStatus && (
            <StatusBadge status={paymentStatus} type="payment" />
          )}
        </div>
      </div>

      <div className="booking-details-page__grid">

        {/* ── Booking info card ── */}
        <section className="booking-details-card">
          <h2 className="booking-details-card__title">Stay details</h2>

          <dl className="booking-details-dl">
            <div>
              <dt>Check-in</dt>
              <dd>{formatDate(booking.checkInDate)}</dd>
            </div>
            <div>
              <dt>Check-out</dt>
              <dd>{formatDate(booking.checkOutDate)}</dd>
            </div>
            {nights > 0 && (
              <div>
                <dt>Duration</dt>
                <dd>{nights} night{nights !== 1 ? "s" : ""}</dd>
              </div>
            )}
            <div>
              <dt>Guests</dt>
              <dd>
                {booking.adults ?? 1} adult{booking.adults !== 1 ? "s" : ""}
                {booking.children
                  ? `, ${booking.children} child${booking.children !== 1 ? "ren" : ""}`
                  : ""}
              </dd>
            </div>
            {booking.roomCount > 1 && (
              <div>
                <dt>Rooms</dt>
                <dd>{booking.roomCount}</dd>
              </div>
            )}
            {booking.pricePerNight != null && (
              <div>
                <dt>Price per night</dt>
                <dd>{formatUsd(booking.pricePerNight)}</dd>
              </div>
            )}
            <div className="booking-details-dl__total">
              <dt>Total price</dt>
              <dd>{formatUsd(booking.totalPrice)}</dd>
            </div>
          </dl>

          {booking.specialRequests && (
            <div className="booking-details-card__requests">
              <p className="eyebrow">Special requests</p>
              <p>{booking.specialRequests}</p>
            </div>
          )}
        </section>

        {/* ── Room info card ── */}
        {(room.roomName || room.roomType || room.bedType || room.view) && (
          <section className="booking-details-card">
            <h2 className="booking-details-card__title">Room</h2>
            <dl className="booking-details-dl">
              {room.roomName && (
                <div>
                  <dt>Room name</dt>
                  <dd>{room.roomName}</dd>
                </div>
              )}
              {room.roomType && (
                <div>
                  <dt>Type</dt>
                  <dd>{room.roomType}</dd>
                </div>
              )}
              {room.bedType && (
                <div>
                  <dt>Bed type</dt>
                  <dd>{room.bedType}</dd>
                </div>
              )}
              {room.view && (
                <div>
                  <dt>View</dt>
                  <dd>{room.view}</dd>
                </div>
              )}
              {room.floor != null && (
                <div>
                  <dt>Floor</dt>
                  <dd>{room.floor}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* ── Payment card ── */}
        {paymentData ? (
          <section className="booking-details-card">
            <h2 className="booking-details-card__title">Payment</h2>
            <dl className="booking-details-dl">
              <div>
                <dt>Status</dt>
                <dd><StatusBadge status={paymentStatus} type="payment" /></dd>
              </div>
              <div>
                <dt>Method</dt>
                <dd>
                  {PAYMENT_METHOD_LABELS[paymentData.paymentMethod]
                    ?? paymentData.paymentMethod
                    ?? "—"}
                </dd>
              </div>
              {paymentData.amount != null && (
                <div>
                  <dt>Amount charged</dt>
                  <dd>{formatUsd(paymentData.amount)}</dd>
                </div>
              )}
              {paymentData.refundAmount != null && paymentData.refundAmount > 0 && (
                <div>
                  <dt>Refund amount</dt>
                  <dd>{formatUsd(paymentData.refundAmount)}</dd>
                </div>
              )}
              {(paymentData.paidAt) && (
                <div>
                  <dt>Paid at</dt>
                  <dd>{formatDateTime(paymentData.paidAt)}</dd>
                </div>
              )}
              {paymentData.notes && (
                <div>
                  <dt>Notes</dt>
                  <dd>{paymentData.notes}</dd>
                </div>
              )}
            </dl>
          </section>
        ) : (
          <section className="booking-details-card">
            <h2 className="booking-details-card__title">Payment</h2>
            <p className="booking-details-card__empty">
              {booking.status === "PENDING"
                ? "Payment has not been submitted yet."
                : "No payment information available."}
            </p>
            {booking.status === "PENDING" && (
              <Link
                to={`/booking/${bookingId}/payment`}
                className="button button--primary"
                style={{ marginTop: "12px", display: "inline-flex" }}
              >
                Pay now
              </Link>
            )}
          </section>
        )}

        {/* ── Cancellation card (if cancelled) ── */}
        {booking.status === "CANCELLED" && booking.cancelledAt && (
          <section className="booking-details-card">
            <h2 className="booking-details-card__title">Cancellation</h2>
            <dl className="booking-details-dl">
              <div>
                <dt>Cancelled at</dt>
                <dd>{formatDateTime(booking.cancelledAt)}</dd>
              </div>
              {booking.cancelledBy && (
                <div>
                  <dt>Cancelled by</dt>
                  <dd>{booking.cancelledBy}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

      </div>

      {/* Cancel section */}
      <CancelSection bookingId={bookingId} status={booking.status} />

      {/* Navigation */}
      <div className="booking-details-page__actions">
        <Link to="/customer/bookings" className="button button--secondary">
          ← Back to my bookings
        </Link>
        <Link to="/search" className="button button--secondary">
          Browse hotels
        </Link>
      </div>
    </main>
  );
}
