import React, { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";

import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import { useCreateBooking } from "../../features/bookings/bookingsHooks.js";
import { useHotelDetails, useHotelRooms } from "../../features/hotels/hotelHooks.js";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

function formatUsd(price) {
  if (price == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(price);
}

function getNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function findRoom(roomsData, roomId) {
  const list = Array.isArray(roomsData)
    ? roomsData
    : roomsData?.rooms ?? roomsData?.items ?? roomsData?.content ?? [];
  return list.find((r) => String(r?.id ?? r?.roomId) === String(roomId)) ?? null;
}

export default function BookingPage() {
  const { hotelId, roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initCheckIn = searchParams.get("checkIn") ?? "";
  const initCheckOut = searchParams.get("checkOut") ?? "";
  const initAdults = Number(searchParams.get("adults") ?? 2);

  const [checkIn, setCheckIn] = useState(initCheckIn);
  const [checkOut, setCheckOut] = useState(initCheckOut);
  const [adults, setAdults] = useState(Math.max(1, initAdults));
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");
  const [errors, setErrors] = useState({});

  const hotelQuery = useHotelDetails(hotelId);
  const roomsQuery = useHotelRooms(hotelId);
  const { mutate: createBooking, isPending } = useCreateBooking();

  const hotel = hotelQuery.data;
  const room = findRoom(roomsQuery.data, roomId);
  const nights = getNights(checkIn, checkOut);
  const pricePerNight = room?.price ?? room?.basePrice ?? 0;
  const totalPrice = pricePerNight * nights;

  function validate() {
    const next = {};
    if (!checkIn) next.checkIn = "Check-in date is required.";
    if (!checkOut) next.checkOut = "Check-out date is required.";
    if (checkIn && checkOut && checkIn >= checkOut)
      next.checkOut = "Check-out must be after check-in.";
    if (!adults || adults < 1) next.adults = "At least 1 adult is required.";
    return next;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    createBooking(
      {
        hotelId,
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        adults,
        children: children || undefined,
        specialRequests: specialRequests.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          const bookingId = data?.id ?? data?.bookingId ?? data?.data?.id ?? data?.data?.bookingId;
          if (bookingId) {
            navigate(`/booking/${bookingId}/payment`);
          }
        },
      },
    );
  }

  const isLoading = hotelQuery.isLoading || roomsQuery.isLoading;
  const isError = hotelQuery.isError && !hotel;

  return (
    <main className="public-page booking-form-page">
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

      {isLoading && <LoadingState message="Loading booking details…" />}
      {isError && <ErrorState message="Could not load hotel details." onRetry={hotelQuery.refetch} />}

      {!isLoading && !isError && (
        <div className="booking-form-page__layout">
          {/* Summary sidebar */}
          <aside className="booking-form-page__summary">
            <div className="booking-summary-card">
              <p className="eyebrow">Your selection</p>
              <h2 className="booking-summary-card__hotel">
                {hotel?.name ?? "Hotel"}
              </h2>
              {(room?.name || room?.type) && (
                <p className="booking-summary-card__room">
                  {room?.name ?? room?.type}
                </p>
              )}
              {hotel?.city && (
                <p className="booking-summary-card__location">{hotel.city}</p>
              )}

              <dl className="booking-summary-card__details">
                {checkIn && (
                  <div>
                    <dt>Check-in</dt>
                    <dd>{formatDate(checkIn)}</dd>
                  </div>
                )}
                {checkOut && (
                  <div>
                    <dt>Check-out</dt>
                    <dd>{formatDate(checkOut)}</dd>
                  </div>
                )}
                {nights > 0 && (
                  <div>
                    <dt>Duration</dt>
                    <dd>{nights} night{nights !== 1 ? "s" : ""}</dd>
                  </div>
                )}
                <div>
                  <dt>Price per night</dt>
                  <dd>{formatUsd(pricePerNight)}</dd>
                </div>
              </dl>

              {nights > 0 && pricePerNight > 0 && (
                <div className="booking-summary-card__total">
                  <span>Estimated total</span>
                  <strong>{formatUsd(totalPrice)}</strong>
                </div>
              )}
            </div>
          </aside>

          {/* Booking form */}
          <section className="booking-form-page__form-area">
            <p className="eyebrow">Step 1 of 2</p>
            <h1>Complete your booking</h1>

            <form className="booking-form" onSubmit={handleSubmit} noValidate>
              <div className="booking-form__group">
                <h3 className="booking-form__section-title">Stay dates</h3>
                <div className="booking-form__row">
                  <div className="auth-field">
                    <label htmlFor="bf-checkin">Check-in date</label>
                    <input
                      id="bf-checkin"
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                    />
                    {errors.checkIn && <p className="auth-field__error">{errors.checkIn}</p>}
                  </div>
                  <div className="auth-field">
                    <label htmlFor="bf-checkout">Check-out date</label>
                    <input
                      id="bf-checkout"
                      type="date"
                      value={checkOut}
                      min={checkIn || undefined}
                      onChange={(e) => setCheckOut(e.target.value)}
                    />
                    {errors.checkOut && <p className="auth-field__error">{errors.checkOut}</p>}
                  </div>
                </div>
              </div>

              <div className="booking-form__group">
                <h3 className="booking-form__section-title">Guests</h3>
                <div className="booking-form__row">
                  <div className="auth-field">
                    <label htmlFor="bf-adults">Adults</label>
                    <input
                      id="bf-adults"
                      type="number"
                      min={1}
                      max={room?.maxAdults ?? 10}
                      value={adults}
                      onChange={(e) => setAdults(Number(e.target.value))}
                    />
                    {errors.adults && <p className="auth-field__error">{errors.adults}</p>}
                  </div>
                  <div className="auth-field">
                    <label htmlFor="bf-children">Children</label>
                    <input
                      id="bf-children"
                      type="number"
                      min={0}
                      max={room?.maxChildren ?? 6}
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="booking-form__group">
                <h3 className="booking-form__section-title">Special requests</h3>
                <div className="auth-field">
                  <label htmlFor="bf-requests">Special requests (optional)</label>
                  <textarea
                    id="bf-requests"
                    rows={4}
                    placeholder="Early check-in, high floor, twin beds…"
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                  />
                </div>
              </div>

              <div className="booking-form__actions">
                <Link
                  to={`/hotels/${hotelId}`}
                  className="button button--secondary"
                >
                  Back
                </Link>
                <button
                  type="submit"
                  className="button button--primary"
                  disabled={isPending}
                >
                  {isPending ? "Creating booking…" : "Continue to payment"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
