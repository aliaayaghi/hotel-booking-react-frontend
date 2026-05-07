import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import { useBooking } from "../../features/bookings/bookingsHooks.js";
import { useCreatePayment } from "../../features/payments/paymentsHooks.js";

const PAYMENT_METHODS = [
  { value: "CREDIT_CARD", label: "Credit card" },
  { value: "DEBIT_CARD", label: "Debit card" },
  { value: "BANK_TRANSFER", label: "Bank transfer" },
];

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

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const bookingQuery = useBooking(bookingId);
  const { mutate: createPayment, isPending } = useCreatePayment(bookingId);

  /* The API wraps the response: { success, message, data: BookingResponseDTO } */
  const booking = bookingQuery.data?.data ?? null;
  const room = booking?.room ?? {};
  const nights = booking?.numberOfNights ?? 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (!paymentMethod) {
      setFieldError("Please select a payment method.");
      return;
    }
    setFieldError("");

    createPayment(
      { paymentMethod, simulateFailure },
      {
        onSuccess: (response) => {
          const paymentStatus = response?.data?.status;
          if (paymentStatus === "FAILED") {
            toast.error("Payment was declined. See your confirmation for details.");
          } else {
            toast.success("Payment submitted successfully!");
          }
          navigate(`/booking/${bookingId}/confirmation`);
        },
      },
    );
  }

  if (bookingQuery.isLoading) return <LoadingState message="Loading booking details…" />;
  if (bookingQuery.isError)
    return (
      <ErrorState
        message="Could not load booking details."
        onRetry={bookingQuery.refetch}
      />
    );

  return (
    <main className="public-page booking-form-page">
      <nav className="hotel-details-breadcrumb" aria-label="Breadcrumb">
        <Link to="/customer/bookings">My bookings</Link>
        <span aria-hidden="true">/</span>
        <span>Payment</span>
      </nav>

      <div className="booking-form-page__layout">
        {/* Booking summary sidebar */}
        <aside className="booking-form-page__summary">
          <div className="booking-summary-card">
            <p className="eyebrow">Booking summary</p>

            {(room?.roomName || room?.roomType) ? (
              <>
                <h2 className="booking-summary-card__hotel">
                  {room.roomName ?? room.roomType}
                </h2>
                {room.roomType && room.roomName && (
                  <p className="booking-summary-card__room">{room.roomType}</p>
                )}
              </>
            ) : (
              <h2 className="booking-summary-card__hotel">Your booking</h2>
            )}

            {booking && (
              <div style={{ marginTop: "8px" }}>
                <StatusBadge status={booking.status} type="booking" />
              </div>
            )}

            <dl className="booking-summary-card__details">
              {booking?.checkInDate && (
                <div>
                  <dt>Check-in</dt>
                  <dd>{formatDate(booking.checkInDate)}</dd>
                </div>
              )}
              {booking?.checkOutDate && (
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
              {booking?.adults && (
                <div>
                  <dt>Guests</dt>
                  <dd>
                    {booking.adults} adult{booking.adults !== 1 ? "s" : ""}
                    {booking.children ? `, ${booking.children} child${booking.children !== 1 ? "ren" : ""}` : ""}
                  </dd>
                </div>
              )}
            </dl>

            {booking?.totalPrice != null && (
              <div className="booking-summary-card__total">
                <span>Total due</span>
                <strong>{formatUsd(booking.totalPrice)}</strong>
              </div>
            )}
          </div>
        </aside>

        {/* Payment form */}
        <section className="booking-form-page__form-area">
          <p className="eyebrow">Step 2 of 2</p>
          <h1>Payment</h1>

          <form className="booking-form" onSubmit={handleSubmit} noValidate>
            <div className="booking-form__group">
              <h3 className="booking-form__section-title">Payment method</h3>
              <div className="payment-method-selector">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.value}
                    className={`payment-method-option${paymentMethod === method.value ? " payment-method-option--selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                    />
                    <span className="payment-method-option__label">{method.label}</span>
                  </label>
                ))}
              </div>
              {fieldError && (
                <p className="auth-field__error">{fieldError}</p>
              )}
            </div>

            <div className="booking-form__group">
              <h3 className="booking-form__section-title">Testing</h3>
              <label className="payment-simulate-label">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                />
                <span>Simulate payment failure (for testing)</span>
              </label>
            </div>

            <div className="booking-form__actions">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
              <button
                type="submit"
                className="button button--primary"
                disabled={isPending}
              >
                {isPending ? "Processing…" : "Pay now"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
