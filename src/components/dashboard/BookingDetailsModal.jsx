import React from "react";

import StatusBadge from "./StatusBadge.jsx";

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function formatPrice(v) {
  if (v == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: 0,
  }).format(v);
}

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="bmodal__row">
      <span className="bmodal__label">{label}</span>
      <span className="bmodal__value">{value}</span>
    </div>
  );
}

export default function BookingDetailsModal({ booking, onClose }) {
  if (!booking) return null;

  const hotel = booking.hotel ?? booking.room?.hotel ?? {};
  const room  = booking.room ?? {};
  const customer = booking.customer ?? booking.user ?? {};

  return (
    <div className="bmodal-overlay" role="dialog" aria-modal="true" aria-label="Booking details">
      <button
        type="button"
        className="bmodal-overlay__backdrop"
        onClick={onClose}
        aria-label="Close"
        tabIndex={-1}
      />
      <div className="bmodal">
        <div className="bmodal__header">
          <div>
            <p className="eyebrow">Booking Details</p>
            <h2 className="bmodal__title">
              {hotel.name ?? "Booking"} &mdash; #{booking.id ?? booking.bookingId}
            </h2>
          </div>
          <button type="button" className="bmodal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="bmodal__body">
          <div className="bmodal__section">
            <p className="bmodal__section-title">Status</p>
            <StatusBadge status={booking.status} type="booking" />
          </div>

          {(customer.name || customer.email) && (
            <div className="bmodal__section">
              <p className="bmodal__section-title">Customer</p>
              <Row label="Name" value={customer.name} />
              <Row label="Email" value={customer.email} />
              <Row label="Phone" value={customer.phone} />
            </div>
          )}

          <div className="bmodal__section">
            <p className="bmodal__section-title">Hotel &amp; Room</p>
            <Row label="Hotel" value={hotel.name} />
            <Row label="City" value={hotel.city} />
            <Row label="Room" value={room.name ?? room.type} />
            <Row label="Bed type" value={room.bedType} />
          </div>

          <div className="bmodal__section">
            <p className="bmodal__section-title">Stay</p>
            <Row label="Check-in" value={formatDate(booking.checkInDate)} />
            <Row label="Check-out" value={formatDate(booking.checkOutDate)} />
            <Row label="Adults" value={booking.adults} />
            <Row label="Children" value={booking.children || undefined} />
            <Row label="Rooms" value={booking.roomCount} />
          </div>

          <div className="bmodal__section">
            <p className="bmodal__section-title">Pricing</p>
            <Row label="Total price" value={formatPrice(booking.totalPrice ?? booking.totalAmount)} />
          </div>

          {booking.specialRequests && (
            <div className="bmodal__section">
              <p className="bmodal__section-title">Special Requests</p>
              <p className="bmodal__notes">{booking.specialRequests}</p>
            </div>
          )}

          {booking.createdAt && (
            <div className="bmodal__section">
              <p className="bmodal__section-title">Created</p>
              <Row label="Date" value={formatDate(booking.createdAt)} />
            </div>
          )}
        </div>

        <div className="bmodal__footer">
          <button type="button" className="button button--secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
