import React from "react";

/**
 * TODO: Backend does not expose a saved payment methods API.
 * Available payment endpoints:
 *   POST /api/bookings/{bookingId}/payment  — process payment for a booking
 *   GET  /api/bookings/{bookingId}/payment  — get payment for a specific booking
 *   POST /api/bookings/{bookingId}/payment/refund — request refund
 * There is no endpoint to list, add, or remove saved payment methods.
 * When the backend adds a saved payment methods API, implement this page fully.
 */
export default function PaymentMethodsPage() {
  return (
    <main className="public-page public-page--narrow payment-methods-page">
      <div className="payment-methods-page__header">
        <p className="eyebrow">My account</p>
        <h1>Payment Methods</h1>
      </div>

      <div className="payment-empty-state">
        <div className="payment-empty-state__icon" aria-hidden="true">
          💳
        </div>
        <h2>No saved payment methods</h2>
        <p>
          Saved payment methods are not yet supported. When you book a hotel,
          you can select your preferred payment method during checkout.
        </p>
        <div className="payment-empty-state__note">
          <strong>Available payment options at checkout:</strong>
          <ul>
            <li>Credit card (Visa, Mastercard, Amex)</li>
            <li>Debit card</li>
            <li>Bank transfer</li>
          </ul>
          <p className="settings-hint">
            Backend support for saved payment methods is not yet available.
            This page will be updated when the feature is added.
          </p>
        </div>
      </div>
    </main>
  );
}
