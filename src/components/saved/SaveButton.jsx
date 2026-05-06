import React from "react";
import { Link } from "react-router-dom";

import { useSaveHotel, useSavedStatus, useUnsaveHotel } from "../../features/saved/savedHooks.js";
import { useAuth } from "../../hooks/useAuth.js";
import { userHasRole } from "../../utils/roleUtils.js";

export default function SaveButton({ hotelId, className = "" }) {
  const { isAuthenticated, user } = useAuth();
  const isCustomer = isAuthenticated && userHasRole(user, "CUSTOMER");

  const { data: statusData, isLoading: isCheckingStatus } = useSavedStatus(
    hotelId,
    isCustomer,
  );

  const isSaved = Boolean(
    statusData?.saved ?? statusData?.isSaved ?? statusData === true,
  );

  const { mutate: save, isPending: isSaving } = useSaveHotel(hotelId);
  const { mutate: unsave, isPending: isUnsaving } = useUnsaveHotel(hotelId);

  const isLoading = isCheckingStatus || isSaving || isUnsaving;

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className={`hotel-action-header__button hotel-action-header__button--icon ${className}`}
        title="Sign in to save hotels"
      >
        <span aria-hidden="true">&#9825;</span>
        <span>Save</span>
      </Link>
    );
  }

  if (!isCustomer) {
    return null;
  }

  function handleToggle() {
    if (isLoading) return;
    if (isSaved) {
      unsave();
    } else {
      save("");
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isSaved ? "Remove hotel from saved" : "Save hotel"}
      aria-pressed={isSaved}
      className={`hotel-action-header__button hotel-action-header__button--icon${isSaved ? " hotel-action-header__button--saved" : ""} ${className}`}
    >
      <span
        aria-hidden="true"
        style={{ color: isSaved ? "#c9a227" : undefined }}
      >
        {isSaved ? "♥" : "♡"}
      </span>
      <span>{isLoading ? "…" : isSaved ? "Saved" : "Save"}</span>
    </button>
  );
}
