import React from "react";

export default function GuestDetailsForm({
  checkIn,
  checkOut,
  adults,
  children,
  childrenAges,
  roomCount,
  room,
  onChange,
  errors,
}) {
  const maxAdults = room?.maxAdults ?? 10;
  const maxChildren = room?.maxChildren ?? 6;
  const maxRooms = room?.quantity ?? 10;

  return (
    <div className="checkout-section">
      <h3 className="checkout-section__title">Stay details</h3>

      <div className="checkout-form-row">
        <div className="auth-field">
          <label htmlFor="gc-checkin">Check-in date *</label>
          <input
            id="gc-checkin"
            type="date"
            value={checkIn}
            onChange={(e) => onChange("checkIn", e.target.value)}
          />
          {errors?.checkIn && (
            <p className="auth-field__error">{errors.checkIn}</p>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="gc-checkout">Check-out date *</label>
          <input
            id="gc-checkout"
            type="date"
            value={checkOut}
            min={checkIn || undefined}
            onChange={(e) => onChange("checkOut", e.target.value)}
          />
          {errors?.checkOut && (
            <p className="auth-field__error">{errors.checkOut}</p>
          )}
        </div>
      </div>

      <h3 className="checkout-section__title" style={{ marginTop: "20px" }}>Guests</h3>

      <div className="checkout-form-row">
        <div className="auth-field">
          <label htmlFor="gc-adults">Adults *</label>
          <input
            id="gc-adults"
            type="number"
            min={1}
            max={maxAdults}
            value={adults}
            onChange={(e) => onChange("adults", Math.max(1, Number(e.target.value)))}
          />
          {errors?.adults && (
            <p className="auth-field__error">{errors.adults}</p>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="gc-children">Children</label>
          <input
            id="gc-children"
            type="number"
            min={0}
            max={maxChildren}
            value={children}
            onChange={(e) => onChange("children", Math.max(0, Number(e.target.value)))}
          />
        </div>
      </div>

      {childrenAges && children > 0 && (
        <div className="auth-field">
          <label>Children ages</label>
          <input
            type="text"
            value={childrenAges}
            readOnly
            className="auth-field__readonly"
            title="Children ages from your search"
          />
        </div>
      )}

      <div className="auth-field" style={{ maxWidth: "200px", marginTop: "16px" }}>
        <label htmlFor="gc-rooms">Number of rooms *</label>
        <input
          id="gc-rooms"
          type="number"
          min={1}
          max={maxRooms}
          value={roomCount}
          onChange={(e) => onChange("roomCount", Math.max(1, Number(e.target.value)))}
        />
        {errors?.roomCount && (
          <p className="auth-field__error">{errors.roomCount}</p>
        )}
      </div>
    </div>
  );
}
