import React from "react";
import { Link, useParams } from "react-router-dom";

import EmptyState from "../../components/feedback/EmptyState.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import HotelGallery from "../../components/hotels/HotelGallery.jsx";
import HotelSearchBar from "../../components/hotels/HotelSearchBar.jsx";
import {
  useHotelDetails,
  useHotelPhotos,
} from "../../features/hotels/hotelHooks.js";

function getHotelLocation(hotel) {
  return [hotel?.city, hotel?.countryCode ?? hotel?.country]
    .filter(Boolean)
    .join(", ");
}

function getHotelName(hotel) {
  return hotel?.name ?? hotel?.hotelName ?? "Hotel details";
}

function getStarRating(hotel) {
  const rating = Number(hotel?.starRating ?? hotel?.stars);

  if (!Number.isFinite(rating)) {
    return 0;
  }

  return Math.max(0, Math.min(5, Math.round(rating)));
}

function StarRating({ rating }) {
  if (!rating) {
    return (
      <span className="hotel-details__meta-note">
        Star rating needs backend verification
      </span>
    );
  }

  return (
    <span className="hotel-details__stars" aria-label={`${rating} star hotel`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          aria-hidden="true"
          className={index < rating ? "hotel-details__star--filled" : ""}
          key={index}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default function HotelDetailsPage() {
  const { hotelId } = useParams();
  const hotelDetails = useHotelDetails(hotelId);
  const hotelPhotos = useHotelPhotos(hotelId);
  const hotel = hotelDetails.data;
  const isNotFound =
    hotelDetails.error?.response?.status === 404 ||
    (hotelDetails.isSuccess && !hotel);
  const location = getHotelLocation(hotel);
  const starRating = getStarRating(hotel);
  const hotelType = hotel?.type ?? hotel?.hotelType;
  const overview = hotel?.overview ?? hotel?.description;

  function handleSelectRoom() {
    document
      .getElementById("hotel-rooms-placeholder")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="public-page hotel-details-page">
      <HotelSearchBar compact />

      <nav className="hotel-details-breadcrumb" aria-label="Breadcrumb">
        <Link to="/search">Search results</Link>
        <span aria-hidden="true">/</span>
        <span>Hotel details</span>
      </nav>

      {hotelDetails.isLoading ? (
        <LoadingState message="Fetching this hotel's details from the backend." />
      ) : null}

      {hotelDetails.isError && !isNotFound ? (
        <ErrorState
          message={
            hotelDetails.error?.response?.data?.message ??
            hotelDetails.error?.message ??
            "Hotel details request failed."
          }
          onRetry={hotelDetails.refetch}
        />
      ) : null}

      {isNotFound ? (
        <EmptyState
          title="Hotel not found"
          message="The backend did not return a hotel for this ID."
        />
      ) : null}

      {hotelDetails.isSuccess && hotel ? (
        <>
          <section className="hotel-details-hero" aria-labelledby="hotel-details-title">
            <div className="hotel-details-hero__main">
              <p className="eyebrow">Hotel</p>
              <h1 id="hotel-details-title">{getHotelName(hotel)}</h1>

              <div className="hotel-details__meta" aria-label="Hotel summary">
                {location ? <span>{location}</span> : null}
                <StarRating rating={starRating} />
                {hotelType ? <span>{hotelType}</span> : null}
              </div>

              {hotel?.address ? (
                <p className="hotel-details__address">{hotel.address}</p>
              ) : (
                <p className="hotel-details__address">
                  Address needs backend verification
                </p>
              )}
            </div>

            <div className="hotel-details-hero__action">
              <button
                className="button button--primary"
                type="button"
                onClick={handleSelectRoom}
              >
                Select a room
              </button>
            </div>
          </section>

          <HotelGallery
            hotelName={getHotelName(hotel)}
            photosQuery={hotelPhotos}
          />

          <section className="hotel-details-section" aria-labelledby="hotel-overview-title">
            <p className="eyebrow">Overview</p>
            <h2 id="hotel-overview-title">About this stay</h2>
            <p>
              {overview || "Overview needs backend verification"}
            </p>
          </section>

          <section
            className="hotel-details-section hotel-details-section--placeholder"
            id="hotel-rooms-placeholder"
            aria-labelledby="hotel-rooms-title"
          >
            <p className="eyebrow">Rooms</p>
            <h2 id="hotel-rooms-title">Select a room</h2>
            <p>Rooms will be added in a future task.</p>
          </section>
        </>
      ) : null}
    </main>
  );
}
