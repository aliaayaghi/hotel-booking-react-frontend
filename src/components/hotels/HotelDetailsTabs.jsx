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
  function handleTabClick(event, href) {
    const section = document.querySelector(href);

    if (!section) {
      return;
    }

    event.preventDefault();
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", href);
  }

  return (
    <nav className="hotel-details-tabs" aria-label="Hotel details sections">
      <div className="hotel-details-tabs__scroller">
        {HOTEL_DETAIL_TABS.map((tab) => (
          <a
            className="hotel-details-tabs__link"
            href={tab.href}
            key={tab.href}
            onClick={(event) => handleTabClick(event, tab.href)}
          >
            {tab.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
