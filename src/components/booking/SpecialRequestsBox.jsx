import React from "react";

export default function SpecialRequestsBox({ value, onChange }) {
  return (
    <div className="checkout-section">
      <h3 className="checkout-section__title">Special requests</h3>
      <p className="checkout-section__note">
        Special requests cannot be guaranteed, but the property will do their
        best to accommodate them.
      </p>
      <div className="auth-field">
        <label htmlFor="special-requests">
          Your requests (optional)
        </label>
        <textarea
          id="special-requests"
          rows={4}
          placeholder="e.g. Early check-in, high floor, twin beds, quiet room..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="checkout-textarea"
        />
      </div>
    </div>
  );
}
