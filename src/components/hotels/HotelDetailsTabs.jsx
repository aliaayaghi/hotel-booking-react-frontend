import React from "react";

const HOTEL_DETAIL_TABS = [
  { href: "#overview", label: "Overview" },
  { href: "#about", label: "About" },
  { href: "#rooms", label: "Rooms" },
  { href: "#accessibility", label: "Accessibility" },
  { href: "#policies", label: "Policies" },
  { href: "#reviews", label: "Reviews" },
];

export default function HotelDetailsTabs() {
  return (
    <nav className="hotel-details-tabs" aria-label="Hotel details sections">
      <div className="hotel-details-tabs__scroller">
        {HOTEL_DETAIL_TABS.map((tab) => (
          <a className="hotel-details-tabs__link" href={tab.href} key={tab.href}>
            {tab.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
