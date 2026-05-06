import React from "react";

function toArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const nestedItems =
    data.items ?? data.content ?? data.results ?? data.amenities;

  if (Array.isArray(nestedItems)) {
    return nestedItems;
  }

  if (data.name || data.amenityName || data.title || data.label) {
    return [data];
  }

  return [];
}

function getAmenityName(amenity) {
  if (typeof amenity === "string") {
    return amenity;
  }

  return (
    amenity?.name ??
    amenity?.amenityName ??
    amenity?.title ??
    amenity?.label ??
    amenity?.type ??
    ""
  );
}

function getAmenityDetail(amenity) {
  if (!amenity || typeof amenity !== "object") {
    return "";
  }

  return amenity.category ?? amenity.description ?? amenity.group ?? "";
}

export function getAmenities(data) {
  return toArray(data)
    .map((amenity, index) => ({
      detail: getAmenityDetail(amenity),
      id: amenity?.id ?? amenity?.amenityId ?? getAmenityName(amenity) ?? index,
      name: getAmenityName(amenity),
    }))
    .filter((amenity) => amenity.name);
}

export default function PopularAmenities({ amenitiesQuery }) {
  if (amenitiesQuery.isLoading) {
    return (
      <div className="popular-amenities__state">
        Loading amenities from the backend.
      </div>
    );
  }

  if (amenitiesQuery.isError) {
    return (
      <div className="popular-amenities__state">
        Amenities could not be loaded.
      </div>
    );
  }

  const amenities = getAmenities(amenitiesQuery.data);

  return (
    <div className="popular-amenities">
      <div className="hotel-overview__section-heading">
        <p className="eyebrow">Popular Amenities</p>
        <h3>Available at this property</h3>
      </div>

      {amenities.length ? (
        <ul className="popular-amenities__grid">
          {amenities.slice(0, 8).map((amenity) => (
            <li className="popular-amenities__item" key={amenity.id}>
              <span aria-hidden="true" />
              <div>
                <strong>{amenity.name}</strong>
                {amenity.detail ? <small>{amenity.detail}</small> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="popular-amenities__empty">
          Amenities need backend verification.
        </div>
      )}
    </div>
  );
}
