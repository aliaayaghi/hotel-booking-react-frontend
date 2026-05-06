import React from "react";

export function toArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const nestedItems =
    data.items ??
    data.content ??
    data.results ??
    data.nearbyPlaces ??
    data.places ??
    data.features ??
    data.accessibilityFeatures;

  if (Array.isArray(nestedItems)) {
    return nestedItems;
  }

  if (data.name || data.placeName || data.featureName || data.title) {
    return [data];
  }

  return [];
}

function getPlaceName(place) {
  if (typeof place === "string") {
    return place;
  }

  return (
    place?.name ??
    place?.placeName ??
    place?.title ??
    place?.landmarkName ??
    ""
  );
}

function getPlaceType(place) {
  if (!place || typeof place !== "object") {
    return "";
  }

  return place.type ?? place.placeType ?? place.category ?? "";
}

function formatDistance(place) {
  if (!place || typeof place !== "object") {
    return "";
  }

  const rawDistance =
    place.distance ??
    place.distanceKm ??
    place.distanceInKm ??
    place.kilometers ??
    place.distanceMeters;

  if (rawDistance === undefined || rawDistance === null || rawDistance === "") {
    return "";
  }

  const numericDistance = Number(rawDistance);

  if (!Number.isFinite(numericDistance)) {
    return String(rawDistance);
  }

  if (place.distanceMeters !== undefined && place.distanceMeters !== null) {
    return `${(numericDistance / 1000).toFixed(1)} km`;
  }

  return `${numericDistance.toFixed(numericDistance % 1 === 0 ? 0 : 1)} km`;
}

function getCoordinate(value) {
  const coordinate = Number(value);

  if (!Number.isFinite(coordinate)) {
    return "";
  }

  return coordinate.toFixed(5);
}

export function getNearbyPlaces(data) {
  return toArray(data)
    .map((place, index) => ({
      distance: formatDistance(place),
      id: place?.id ?? place?.placeId ?? getPlaceName(place) ?? index,
      name: getPlaceName(place),
      type: getPlaceType(place),
    }))
    .filter((place) => place.name);
}

export default function ExploreAreaCard({ hotel, nearbyQuery }) {
  const location = [hotel?.city, hotel?.countryCode ?? hotel?.country]
    .filter(Boolean)
    .join(", ");
  const latitude = getCoordinate(hotel?.latitude);
  const longitude = getCoordinate(hotel?.longitude);
  const nearbyPlaces = nearbyQuery.isSuccess ? getNearbyPlaces(nearbyQuery.data) : [];

  return (
    <aside className="explore-area-card" aria-labelledby="explore-area-title">
      <div className="explore-area-card__map" aria-hidden="true">
        <span />
      </div>

      <div className="explore-area-card__body">
        <p className="eyebrow">Explore</p>
        <h3 id="explore-area-title">Explore the area</h3>

        {hotel?.address || location ? (
          <address>
            {hotel?.address ? <span>{hotel.address}</span> : null}
            {location ? <span>{location}</span> : null}
          </address>
        ) : (
          <p className="explore-area-card__muted">
            Location details need backend verification.
          </p>
        )}

        {latitude && longitude ? (
          <p className="explore-area-card__coordinates">
            {latitude}, {longitude}
          </p>
        ) : null}

        <div className="explore-area-card__nearby">
          <h4>Nearby places</h4>

          {nearbyQuery.isLoading ? (
            <p>Loading nearby places from the backend.</p>
          ) : null}

          {nearbyQuery.isError ? (
            <p>Nearby places could not be loaded.</p>
          ) : null}

          {nearbyQuery.isSuccess && nearbyPlaces.length ? (
            <ul>
              {nearbyPlaces.slice(0, 5).map((place) => (
                <li key={place.id}>
                  <span>
                    <strong>{place.name}</strong>
                    {place.type ? <small>{place.type}</small> : null}
                  </span>
                  {place.distance ? <em>{place.distance}</em> : null}
                </li>
              ))}
            </ul>
          ) : null}

          {nearbyQuery.isSuccess && !nearbyPlaces.length ? (
            <p>Nearby places need backend verification.</p>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
