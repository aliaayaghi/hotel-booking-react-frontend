import React, { useState } from "react";

function getCurrentPageUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.href;
}

export default function HotelActionHeader({ onSelectRoom }) {
  const [shareLabel, setShareLabel] = useState("Share");

  async function handleShare() {
    const pageUrl = getCurrentPageUrl();

    if (!pageUrl) {
      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(pageUrl);
        setShareLabel("Copied");
        window.setTimeout(() => setShareLabel("Share"), 1800);
        return;
      } catch {
        window.alert(pageUrl);
        return;
      }
    }

    window.alert(pageUrl);
  }

  return (
    <div className="hotel-action-header" aria-label="Hotel actions">
      <button
        aria-label="Save hotel"
        className="hotel-action-header__button hotel-action-header__button--icon"
        type="button"
      >
        <span aria-hidden="true">&#9825;</span>
        <span>Save</span>
      </button>

      <button
        className="hotel-action-header__button"
        type="button"
        onClick={handleShare}
      >
        {shareLabel}
      </button>

      <button
        className="button button--primary hotel-action-header__primary"
        type="button"
        onClick={onSelectRoom}
      >
        Select a room
      </button>
    </div>
  );
}
