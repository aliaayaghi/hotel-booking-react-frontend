import React from "react";

const BOOKING_STATUS = {
  PENDING:   { bg: "#fef3c7", color: "#92400e", label: "Pending" },
  CONFIRMED: { bg: "#d1fae5", color: "#065f46", label: "Confirmed" },
  CANCELLED: { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" },
  COMPLETED: { bg: "#e0e7ff", color: "#3730a3", label: "Completed" },
  NO_SHOW:   { bg: "#fce7f3", color: "#9d174d", label: "No-show" },
  FAILED:    { bg: "#fee2e2", color: "#991b1b", label: "Failed" },
};

const HOTEL_STATUS = {
  PENDING:   { bg: "#fef3c7", color: "#92400e", label: "Pending" },
  ACTIVE:    { bg: "#d1fae5", color: "#065f46", label: "Active" },
  REJECTED:  { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
  SUSPENDED: { bg: "#fce7f3", color: "#9d174d", label: "Suspended" },
};

const USER_STATUS = {
  ACTIVE:    { bg: "#d1fae5", color: "#065f46", label: "Active" },
  SUSPENDED: { bg: "#fce7f3", color: "#9d174d", label: "Suspended" },
  INACTIVE:  { bg: "#f3f4f6", color: "#374151", label: "Inactive" },
};

const ROLE_STYLE = {
  ADMIN:         { bg: "#e0e7ff", color: "#3730a3" },
  HOTEL_MANAGER: { bg: "#fef3c7", color: "#92400e" },
  CUSTOMER:      { bg: "#d1fae5", color: "#065f46" },
};

const MAPS = { booking: BOOKING_STATUS, hotel: HOTEL_STATUS, user: USER_STATUS, role: ROLE_STYLE };

export default function StatusBadge({ status, type = "booking" }) {
  const map = MAPS[type] ?? MAPS.booking;
  const style = map[status] ?? { bg: "#f3f4f6", color: "#374151" };
  const label = style.label ?? status ?? "—";
  return (
    <span className="booking-badge" style={{ background: style.bg, color: style.color }}>
      {label}
    </span>
  );
}
