import React from "react";

import { getAmenities } from "./PopularAmenities.jsx";
import { getNearbyPlaces, toArray } from "./ExploreAreaCard.jsx";

function getFeatureName(feature) {
  if (typeof feature === "string") {
    return feature;
  }

  return (
    feature?.name ??
    feature?.featureName ??
    feature?.title ??
    feature?.label ??
    feature?.description ??
    ""
  );
}

function getAccessibilityFeatures(data) {
  return toArray(data)
    .map((feature, index) => ({
      id: feature?.id ?? feature?.featureId ?? getFeatureName(feature) ?? index,
      name: getFeatureName(feature),
    }))
    .filter((feature) => feature.name);
}

function getPolicyLabel(policy, type) {
  if (!policy || typeof policy !== "object") {
    return "";
  }

  if (policy.description) {
    return policy.description;
  }

  if (policy.policyText) {
    return policy.policyText;
  }

  if (type === "breakfast") {
    if (policy.included === true || policy.breakfastIncluded === true) {
      return "Breakfast included";
    }

    if (policy.available === true || policy.breakfastAvailable === true) {
      return "Breakfast available";
    }
  }

  if (type === "pets") {
    if (policy.allowed === true || policy.petsAllowed === true) {
      return "Pets allowed";
    }

    if (policy.allowed === false || policy.petsAllowed === false) {
      return "Pets not allowed";
    }
  }

  return "";
}

function getAverageScore(data) {
  if (typeof data === "number" || typeof data === "string") {
    const numericScore = Number(data);

    return Number.isFinite(numericScore) ? numericScore : "";
  }

  if (!data || typeof data !== "object") {
    return "";
  }

  const score =
    data.averageScore ??
    data.averageRating ??
    data.overallScore ??
    data.overallRating ??
    data.rating ??
    data.score;
  const numericScore = Number(score);

  return Number.isFinite(numericScore) ? numericScore : "";
}

function getReviewCount(data) {
  if (!data || typeof data !== "object") {
    return "";
  }

  const count = data.reviewCount ?? data.totalReviews ?? data.count;
  const numericCount = Number(count);

  return Number.isFinite(numericCount) ? numericCount : "";
}

function formatScore(score) {
  if (!score) {
    return "";
  }

  return score.toFixed(score % 1 === 0 ? 0 : 1);
}

export default function HotelHighlights({
  accessibilityQuery,
  amenitiesQuery,
  averageScoresQuery,
  breakfastPolicyQuery,
  hotel,
  petsPolicyQuery,
  starRating,
  nearbyQuery,
}) {
  const amenities = amenitiesQuery.isSuccess ? getAmenities(amenitiesQuery.data) : [];
  const accessibilityFeatures = accessibilityQuery.isSuccess
    ? getAccessibilityFeatures(accessibilityQuery.data)
    : [];
  const nearbyPlaces = nearbyQuery.isSuccess ? getNearbyPlaces(nearbyQuery.data) : [];
  const breakfastLabel = breakfastPolicyQuery.isSuccess
    ? getPolicyLabel(breakfastPolicyQuery.data, "breakfast")
    : "";
  const petsLabel = petsPolicyQuery.isSuccess
    ? getPolicyLabel(petsPolicyQuery.data, "pets")
    : "";
  const averageScore = averageScoresQuery.isSuccess
    ? getAverageScore(averageScoresQuery.data)
    : "";
  const reviewCount = averageScoresQuery.isSuccess
    ? getReviewCount(averageScoresQuery.data)
    : "";
  const location = [hotel?.city, hotel?.countryCode ?? hotel?.country]
    .filter(Boolean)
    .join(", ");
  const highlights = [
    location ? `Located in ${location}` : "",
    hotel?.address ? hotel.address : "",
    amenities[0]?.name ? `${amenities[0].name} available` : "",
    amenities[1]?.name ? `${amenities[1].name} available` : "",
    breakfastLabel,
    petsLabel,
    accessibilityFeatures[0]?.name
      ? `Accessibility: ${accessibilityFeatures[0].name}`
      : "",
    nearbyPlaces[0]?.name ? `Near ${nearbyPlaces[0].name}` : "",
  ].filter(Boolean);

  return (
    <div className="hotel-highlights">
      <div className="hotel-highlights__rating">
        {averageScore ? (
          <>
            <strong>{formatScore(averageScore)}</strong>
            <span>
              Guest rating
              {reviewCount ? <small>{reviewCount} reviews</small> : null}
            </span>
          </>
        ) : starRating ? (
          <>
            <strong>{starRating}</strong>
            <span>
              Star rating
              <small>Review score unavailable</small>
            </span>
          </>
        ) : null}
      </div>

      {highlights.length ? (
        <ul className="hotel-highlights__list">
          {highlights.slice(0, 7).map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      ) : (
        <p className="hotel-highlights__empty">
          Highlights need backend verification.
        </p>
      )}

      {accessibilityFeatures.length ? (
        <div className="hotel-highlights__accessibility">
          <strong>Accessibility preview</strong>
          <span>
            {accessibilityFeatures
              .slice(0, 2)
              .map((item) => item.name)
              .join(", ")}
          </span>
        </div>
      ) : null}
    </div>
  );
}
