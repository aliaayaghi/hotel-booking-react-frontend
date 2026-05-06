import React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import EmptyState from "../../components/feedback/EmptyState.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import HotelActionHeader from "../../components/hotels/HotelActionHeader.jsx";
import HotelDetailsTabs from "../../components/hotels/HotelDetailsTabs.jsx";
import HotelGallery from "../../components/hotels/HotelGallery.jsx";
import HotelOverviewSection from "../../components/hotels/HotelOverviewSection.jsx";
import HotelSearchBar from "../../components/hotels/HotelSearchBar.jsx";
import ChooseRoomSection from "../../components/rooms/ChooseRoomSection.jsx";
import {
  useHotelAccessibility,
  useHotelAmenities,
  useHotelAverageScores,
  useHotelBreakfastPolicy,
  useHotelDetails,
  useHotelRooms,
  useHotelNearbyPlaces,
  useHotelPetsPolicy,
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
  const [searchParams] = useSearchParams();
  const hotelDetails = useHotelDetails(hotelId);
  const hotelPhotos = useHotelPhotos(hotelId);
  const hotelAmenities = useHotelAmenities(hotelId);
  const hotelNearbyPlaces = useHotelNearbyPlaces(hotelId);
  const hotelAccessibility = useHotelAccessibility(hotelId);
  const hotelAverageScores = useHotelAverageScores(hotelId);
  const hotelBreakfastPolicy = useHotelBreakfastPolicy(hotelId);
  const hotelPetsPolicy = useHotelPetsPolicy(hotelId);
  const hotelRooms = useHotelRooms(hotelId);
  const hotel = hotelDetails.data;
  const roomSearchValues = {
    adults: searchParams.get("adults") ?? "",
    checkIn: searchParams.get("checkIn") ?? "",
    checkOut: searchParams.get("checkOut") ?? "",
    children: searchParams.get("children") ?? "",
    rooms: searchParams.get("rooms") ?? "",
  };
  const isNotFound =
    hotelDetails.error?.response?.status === 404 ||
    (hotelDetails.isSuccess && !hotel);
  const location = getHotelLocation(hotel);
  const starRating = getStarRating(hotel);
  const hotelType = hotel?.type ?? hotel?.hotelType;

  function handleSelectRoom() {
    document
      .getElementById("rooms")
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

            <HotelActionHeader onSelectRoom={handleSelectRoom} />
          </section>

          <HotelGallery
            hotelName={getHotelName(hotel)}
            photosQuery={hotelPhotos}
          />

          <HotelDetailsTabs />

          <HotelOverviewSection
            accessibilityQuery={hotelAccessibility}
            amenitiesQuery={hotelAmenities}
            averageScoresQuery={hotelAverageScores}
            breakfastPolicyQuery={hotelBreakfastPolicy}
            hotel={hotel}
            nearbyQuery={hotelNearbyPlaces}
            petsPolicyQuery={hotelPetsPolicy}
            starRating={starRating}
          />

          <ChooseRoomSection
            roomsQuery={hotelRooms}
            searchValues={roomSearchValues}
          />

          <section
            className="hotel-details-section hotel-details-section--placeholder"
            id="accessibility"
            aria-labelledby="hotel-accessibility-title"
          >
            <p className="eyebrow">Accessibility</p>
            <h2 id="hotel-accessibility-title">Accessibility details</h2>
            <p>Accessibility details will be added in a future task.</p>
          </section>

          <section
            className="hotel-details-section hotel-details-section--placeholder"
            id="policies"
            aria-labelledby="hotel-policies-title"
          >
            <p className="eyebrow">Policies</p>
            <h2 id="hotel-policies-title">Stay policies</h2>
            <p>Policies will be added in a future task.</p>
          </section>

          <section
            className="hotel-details-section hotel-details-section--placeholder"
            id="reviews"
            aria-labelledby="hotel-reviews-title"
          >
            <p className="eyebrow">Reviews</p>
            <h2 id="hotel-reviews-title">Guest reviews</h2>
            <p>Reviews will be added in a future task.</p>
          </section>
        </>
      ) : null}
    </main>
  );
}
