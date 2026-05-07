import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import BookingSummary from "../../components/booking/BookingSummary.jsx";
import GuestDetailsForm from "../../components/booking/GuestDetailsForm.jsx";
import SpecialRequestsBox from "../../components/booking/SpecialRequestsBox.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import {
  useCheckRoomAvailability,
  useCreateBooking,
} from "../../features/bookings/bookingHooks.js";
import {
  useHotelDetails,
  useHotelRooms,
} from "../../features/hotels/hotelHooks.js";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function findRoom(roomsData, roomId) {
  const list = Array.isArray(roomsData)
    ? roomsData
    : roomsData?.rooms ?? roomsData?.items ?? roomsData?.content ?? [];
  return list.find((r) => String(r?.id ?? r?.roomId) === String(roomId)) ?? null;
}

function getCancellationPolicyId(room) {
  return (
    room?.cancellationPolicy?.id ??
    room?.cancellationPolicyId ??
    null
  );
}

const AVAILABILITY = {
  UNCHECKED: "unchecked",
  CHECKING: "checking",
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
  ERROR: "error",
};

const availabilityConfig = {
  unchecked: {
    label: "Availability not checked yet",
    className: "checkout-availability--unchecked",
  },
  checking: {
    label: "Checking availability…",
    className: "checkout-availability--checking",
  },
  available: {
    label: "✓ Room is available for your dates",
    className: "checkout-availability--available",
  },
  unavailable: {
    label: "✕ Room is not available for the selected dates",
    className: "checkout-availability--unavailable",
  },
  error: {
    label: "Could not check availability — please try again",
    className: "checkout-availability--error",
  },
};

/* ─── Component ───────────────────────────────────────────────────────────── */

function getCheckoutAvailabilityLabel(status) {
  if (status === AVAILABILITY.AVAILABLE) return "✓ Available";
  if (status === AVAILABILITY.UNAVAILABLE) return "✕ Not available";
  if (status === AVAILABILITY.CHECKING) return "Checking availability...";
  if (status === AVAILABILITY.ERROR) return "Availability error";
  return "Availability pending";
}

export default function BookingCheckoutPage() {
  const { hotelId, roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  /* Form state — pre-filled from query params */
  const [checkIn, setCheckIn] = useState(searchParams.get("checkIn") ?? "");
  const [checkOut, setCheckOut] = useState(searchParams.get("checkOut") ?? "");
  const [adults, setAdults] = useState(
    Math.max(1, Number(searchParams.get("adults") ?? 2)),
  );
  const [children, setChildren] = useState(
    Math.max(0, Number(searchParams.get("children") ?? 0)),
  );
  const childrenAges = searchParams.get("childrenAges") ?? "";
  const [roomCount, setRoomCount] = useState(
    Math.max(1, Number(searchParams.get("rooms") ?? 1)),
  );
  const [specialRequests, setSpecialRequests] = useState("");
  const [errors, setErrors] = useState({});
  const [availabilityStatus, setAvailabilityStatus] = useState(
    AVAILABILITY.UNCHECKED,
  );

  /* Remote data */
  const hotelQuery = useHotelDetails(hotelId);
  const roomsQuery = useHotelRooms(hotelId);
  const { mutate: checkAvailability } = useCheckRoomAvailability();
  const { mutate: submitBooking, isPending: isSubmitting } = useCreateBooking();

  const hotel = hotelQuery.data;
  const room = findRoom(roomsQuery.data, roomId);
  const cancellationPolicyId = getCancellationPolicyId(room);

  /* Auto-check availability when stay dates or room count change */
  useEffect(() => {
    if (checkIn && checkOut && checkIn < checkOut) {
      runAvailabilityCheck(checkIn, checkOut, roomCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn, checkOut, roomCount, hotelId, roomId]);

  /* Reset availability when key values change */
  function handleFormChange(field, value) {
    if (field === "checkIn") setCheckIn(value);
    if (field === "checkOut") setCheckOut(value);
    if (field === "adults") setAdults(value);
    if (field === "children") setChildren(value);
    if (field === "roomCount") setRoomCount(value);

    if (["checkIn", "checkOut", "roomCount"].includes(field)) {
      setAvailabilityStatus(AVAILABILITY.UNCHECKED);
    }
  }

  function runAvailabilityCheck(from = checkIn, to = checkOut, qty = roomCount) {
    if (!from || !to || !hotelId || !roomId) return;
    setAvailabilityStatus(AVAILABILITY.CHECKING);
    checkAvailability(
      { from, to, hotelId, roomId, roomQuantity: qty },
      {
        onSuccess: (available) => {
          setAvailabilityStatus(
            available ? AVAILABILITY.AVAILABLE : AVAILABILITY.UNAVAILABLE,
          );
        },
        onError: () => {
          setAvailabilityStatus(AVAILABILITY.ERROR);
        },
      },
    );
  }

  /* Validation */
  function validate({ requireAvailability = true } = {}) {
    const errs = {};
    if (!hotelId) errs.general = "Hotel ID is missing.";
    if (!roomId) errs.general = "Room ID is missing.";
    if (!checkIn) errs.checkIn = "Check-in date is required.";
    if (!checkOut) errs.checkOut = "Check-out date is required.";
    if (checkIn && checkOut && checkIn >= checkOut)
      errs.checkOut = "Check-out must be after check-in.";
    if (!adults || adults < 1) errs.adults = "At least 1 adult is required.";
    if (!roomCount || roomCount < 1)
      errs.roomCount = "At least 1 room is required.";
    if (requireAvailability && availabilityStatus !== AVAILABILITY.AVAILABLE)
      errs.availability =
        availabilityStatus === AVAILABILITY.UNAVAILABLE
          ? "This room is not available for the selected dates."
          : "Availability will be checked before booking.";
    return errs;
  }

  function submitBookingRequest() {
    submitBooking(
      {
        hotelId,
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults,
        children: children > 0 ? children : undefined,
        roomCount,
        cancellationPolicyId: cancellationPolicyId ?? undefined,
        specialRequests: specialRequests.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          const bookingId =
            data?.id ??
            data?.bookingId ??
            data?.data?.id ??
            data?.data?.bookingId;
          if (bookingId) {
            navigate(`/booking/${bookingId}/payment`);
          }
        },
      },
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate({ requireAvailability: false });
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});

    if (availabilityStatus === AVAILABILITY.AVAILABLE) {
      submitBookingRequest();
      return;
    }

    setAvailabilityStatus(AVAILABILITY.CHECKING);
    checkAvailability(
      { from: checkIn, to: checkOut, hotelId, roomId, roomQuantity: roomCount },
      {
        onSuccess: (available) => {
          if (available) {
            setAvailabilityStatus(AVAILABILITY.AVAILABLE);
            submitBookingRequest();
            return;
          }

          setAvailabilityStatus(AVAILABILITY.UNAVAILABLE);
          setErrors({
            availability: "This room is not available for the selected dates.",
          });
        },
        onError: () => {
          setAvailabilityStatus(AVAILABILITY.ERROR);
          setErrors({
            availability: "Could not check availability. Please try again.",
          });
        },
      },
    );
  }

  /* Loading / error states for remote data */
  const isDataLoading = hotelQuery.isLoading || roomsQuery.isLoading;
  const isDataError = (hotelQuery.isError && !hotel) || roomsQuery.isError;

  const avail = availabilityConfig[availabilityStatus] ?? availabilityConfig.unchecked;

  return (
    <main className="public-page checkout-page">
      {/* Breadcrumb */}
      <nav className="hotel-details-breadcrumb" aria-label="Breadcrumb">
        <Link to="/search">Search</Link>
        <span aria-hidden="true">/</span>
        {hotel ? (
          <Link to={`/hotels/${hotelId}`}>{hotel.name ?? "Hotel"}</Link>
        ) : (
          <span>Hotel</span>
        )}
        <span aria-hidden="true">/</span>
        <span>Book room</span>
      </nav>

      {isDataLoading && <LoadingState message="Loading booking details…" />}
      {isDataError && (
        <ErrorState
          message="Could not load hotel or room details."
          onRetry={() => {
            hotelQuery.refetch();
            roomsQuery.refetch();
          }}
        />
      )}

      {!isDataLoading && !isDataError && (
        <>
          <div className="checkout-page__header">
            <p className="eyebrow">Step 1 of 2</p>
            <h1>Complete your booking</h1>
          </div>

          <div className="checkout-page__layout">
            {/* ── Left column: form ── */}
            <div className="checkout-page__form-col">
              <form onSubmit={handleSubmit} noValidate>

                {/* Room / hotel recap */}
                {(hotel || room) && (
                  <div className="checkout-section checkout-section--recap">
                    <h3 className="checkout-section__title">Your selection</h3>
                    <p className="checkout-recap__hotel">{hotel?.name ?? "Hotel"}</p>
                    {(room?.name || room?.type) && (
                      <p className="checkout-recap__room">{room?.name ?? room?.type}</p>
                    )}
                    {hotel?.address && (
                      <p className="checkout-recap__address">{hotel.address}</p>
                    )}
                  </div>
                )}

                {/* Stay details + guests */}
                <GuestDetailsForm
                  checkIn={checkIn}
                  checkOut={checkOut}
                  adults={adults}
                  children={children}
                  childrenAges={childrenAges}
                  roomCount={roomCount}
                  room={room}
                  onChange={handleFormChange}
                  errors={errors}
                />

                {/* Availability check */}
                <div className="checkout-section">
                  <h3 className="checkout-section__title">Availability</h3>

                  <div className={`checkout-availability ${avail.className}`}>
                    <span>{getCheckoutAvailabilityLabel(availabilityStatus)}</span>
                  </div>

                  {errors.availability && (
                    <p className="auth-field__error" style={{ marginTop: "8px" }}>
                      {errors.availability}
                    </p>
                  )}

                  {false ? (
                    <span className="checkout-availability__auto-note">
                    {availabilityStatus === AVAILABILITY.CHECKING
                      ? "Checking…"
                      : "Check availability"}
                    </span>
                  ) : null}
                </div>

                {/* Special requests */}
                <SpecialRequestsBox
                  value={specialRequests}
                  onChange={setSpecialRequests}
                />

                {/* General error */}
                {errors.general && (
                  <p className="auth-field__error">{errors.general}</p>
                )}

                {/* Actions */}
                <div className="checkout-actions">
                  <Link
                    to={`/hotels/${hotelId}`}
                    className="button button--secondary"
                  >
                    ← Back to hotel
                  </Link>
                  <button
                    type="submit"
                    className="button button--primary"
                    disabled={isSubmitting || availabilityStatus === AVAILABILITY.CHECKING}
                  >
                    {isSubmitting ? "Creating booking…" : "Book now"}
                  </button>
                </div>
              </form>
            </div>

            {/* ── Right column: sticky summary ── */}
            <aside className="checkout-page__summary-col">
              <BookingSummary
                hotel={hotel}
                room={room}
                checkIn={checkIn}
                checkOut={checkOut}
                adults={adults}
                children={children}
                childrenAges={childrenAges}
                roomCount={roomCount}
              />
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
