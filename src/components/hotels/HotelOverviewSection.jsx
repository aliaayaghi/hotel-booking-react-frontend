import React from "react";

import ExploreAreaCard from "./ExploreAreaCard.jsx";
import HotelHighlights from "./HotelHighlights.jsx";
import PopularAmenities from "./PopularAmenities.jsx";

export default function HotelOverviewSection({
  accessibilityQuery,
  amenitiesQuery,
  averageScoresQuery,
  breakfastPolicyQuery,
  hotel,
  nearbyQuery,
  petsPolicyQuery,
  starRating,
}) {
  const overview = hotel?.overview ?? hotel?.description;

  return (
    <section
      className="hotel-details-section hotel-overview-section"
      id="overview"
      aria-labelledby="hotel-overview-title"
    >
      <div className="hotel-overview-layout">
        <div className="hotel-overview-layout__main">
          <div className="hotel-overview__section-heading">
            <p className="eyebrow">Overview</p>
            <h2 id="hotel-overview-title">About this stay</h2>
          </div>

          <HotelHighlights
            accessibilityQuery={accessibilityQuery}
            amenitiesQuery={amenitiesQuery}
            averageScoresQuery={averageScoresQuery}
            breakfastPolicyQuery={breakfastPolicyQuery}
            hotel={hotel}
            nearbyQuery={nearbyQuery}
            petsPolicyQuery={petsPolicyQuery}
            starRating={starRating}
          />

          <article className="hotel-about-property" id="about">
            <div className="hotel-overview__section-heading">
              <p className="eyebrow">About</p>
              <h3>About this property</h3>
            </div>

            {overview ? (
              <p>{overview}</p>
            ) : (
              <p className="hotel-about-property__muted">
                About details need backend verification.
              </p>
            )}
          </article>

          <PopularAmenities amenitiesQuery={amenitiesQuery} />
        </div>

        <ExploreAreaCard hotel={hotel} nearbyQuery={nearbyQuery} />
      </div>
    </section>
  );
}
