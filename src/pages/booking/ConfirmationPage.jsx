import React from "react";
import { Link, useParams } from "react-router-dom";

import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import { useBooking } from "../../features/bookings/bookingsHooks.js";
import { usePaymentByBooking } from "../../features/payments/paymentsHooks.js";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function formatUsd(price) {
  if (price == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(price);
}

const PAYMENT_METHOD_LABELS = {
  CREDIT_CARD: "Credit card",
  DEBIT_CARD: "Debit card",
  BANK_TRANSFER: "Bank transfer",
};

export default function ConfirmationPage() {
  const { bookingId } = useParams();
  const bookingQuery = useBooking(bookingId);
  const paymentQuery = usePaymentByBooking(bookingId);

  /* API wraps response: { success, message, data: <DTO>, timestamp } */
  const booking = bookingQuery.data?.data ?? null;
  const payment = paymentQuery.data?.data ?? null;
  const room = booking?.room ?? {};
  const nights = booking?.numberOfNights ?? 0;

  const paymentStatus = payment?.status ?? booking?.payment?.status;
  const paymentFailed = paymentStatus === "FAILED";

  if (bookingQuery.isLoading || paymentQuery.isLoading)
    return <LoadingState message="Loading your confirmation…" />;

  if (bookingQuery.isError)
    return (
      <ErrorState
        message="Could not load booking details."
        onRetry={bookingQuery.refetch}
      />
    );

  return (
    <main className="public-page confirmation-page">
      <div className="confirmation-page__inner">
        {paymentFailed ? (
          <div className="confirmation-page__icon confirmation-page__icon--fail">✕</div>
        ) : (
          <div className="confirmation-page__icon confirmation-page__icon--success">✓</div>
        )}

        <p className="eyebrow">
          {paymentFailed ? "Payment failed" : "Booking confirmed"}
        </p>
        <h1 className="confirmation-page__title">
          {paymentFailed
            ? "We couldn't process your payment"
            : "Thank you for your reservation!"}
        </h1>
        <p className="confirmation-page__subtitle">
          {paymentFailed
            ? "Your booking is on hold. Please try again with a different payment method."
            : "Your booking is confirmed. Check your email for a full receipt."}
        </p>

        {booking && (
          <div className="confirmation-summary">
            <p className="eyebrow">Booking details</p>

            {(room?.roomName || room?.roomType) ? (
              <>
                <h2 className="confirmation-summary__hotel">
                  {room.roomName ?? room.roomType}
                </h2>
                {room.roomType && room.roomName && (
                  <p className="confirmation-summary__room">{room.roomType}</p>
                )}
              </>
            ) : (
              <h2 className="confirmation-summary__hotel">Your booking</h2>
            )}

            <div className="confirmation-summary__status">
              <StatusBadge status={booking?.status} type="booking" />
            </div>

            <dl className="confirmation-summary__details">
              {booking.checkInDate && (
                <div>
                  <dt>Check-in</dt>
                  <dd>{formatDate(booking.checkInDate)}</dd>
                </div>
              )}
              {booking.checkOutDate && (
                <div>
                  <dt>Check-out</dt>
                  <dd>{formatDate(booking.checkOutDate)}</dd>
                </div>
              )}
              {nights > 0 && (
                <div>
                  <dt>Duration</dt>
                  <dd>{nights} night{nights !== 1 ? "s" : ""}</dd>
                </div>
              )}
              {booking.adults && (
                <div>
                  <dt>Guests</dt>
                  <dd>
                    {booking.adults} adult{booking.adults !== 1 ? "s" : ""}
                    {booking.children ? `, ${booking.children} child${booking.children !== 1 ? "ren" : ""}` : ""}
                  </dd>
                </div>
              )}
              {booking.totalPrice != null && (
                <div>
                  <dt>Total</dt>
                  <dd className="confirmation-summary__price">
                    {formatUsd(booking.totalPrice)}
                  </dd>
                </div>
              )}
            </dl>

            {(payment || booking?.payment) && (
              <div className="confirmation-summary__payment">
                <p className="eyebrow">Payment</p>
                <dl className="confirmation-summary__details">
                  <div>
                    <dt>Method</dt>
                    <dd>
                      {PAYMENT_METHOD_LABELS[payment?.paymentMethod ?? booking?.payment?.paymentMethod]
                        ?? payment?.paymentMethod
                        ?? booking?.payment?.paymentMethod
                        ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>
                      <StatusBadge
                        status={paymentStatus}
                        type="payment"
                      />
                    </dd>
                  </div>
                  {(payment?.amount ?? booking?.payment?.amount) != null && (
                    <div>
                      <dt>Amount charged</dt>
                      <dd>{formatUsd(payment?.amount ?? booking?.payment?.amount)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        )}

        <div className="confirmation-page__actions">
          {paymentFailed ? (
            <Link
              to={`/booking/${bookingId}/payment`}
              className="button button--primary"
            >
              Try payment again
            </Link>
          ) : (
            <Link to="/customer/bookings" className="button button--primary">
              View my bookings
            </Link>
          )}
          <Link to="/search" className="button button--secondary">
            Browse more hotels
          </Link>
        </div>
      </div>
    </main>
  );
}
