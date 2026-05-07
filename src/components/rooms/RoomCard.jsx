import React from "react";

function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return value.items ?? value.content ?? value.results ?? [];
}

function getRoomImage(room) {
  const firstPhoto = toArray(room?.photos ?? room?.roomPhotos)[0];

  return (
    room?.mainPhotoUrl ??
    room?.coverPhotoUrl ??
    room?.photoUrl ??
    room?.imageUrl ??
    firstPhoto?.url ??
    firstPhoto?.photoUrl ??
    firstPhoto?.imageUrl ??
    ""
  );
}

function getRoomName(room) {
  return room?.name ?? room?.roomName ?? "Room";
}

function getRoomType(room) {
  return room?.type ?? room?.roomType ?? "";
}

function formatUsdPrice(price) {
  if (price === undefined || price === null || price === "") {
    return "";
  }

  const numericPrice = Number(price);

  if (Number.isFinite(numericPrice)) {
    return new Intl.NumberFormat("en-US", {
      currency: "USD",
      maximumFractionDigits: numericPrice % 1 === 0 ? 0 : 2,
      style: "currency",
    }).format(numericPrice);
  }

  return String(price).trim();
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
    ""
  );
}

function getAmenities(room) {
  return toArray(room?.amenities ?? room?.roomAmenities)
    .map(getAmenityName)
    .filter(Boolean);
}

function getCancellationPolicy(room) {
  // Try single-policy preview fields first
  const singlePolicy = room?.cancellationPolicy ?? room?.cancellationPolicyPreview;

  if (typeof singlePolicy === "string") {
    return singlePolicy;
  }

  if (singlePolicy) {
    return (
      singlePolicy?.tierName ??
      singlePolicy?.name ??
      singlePolicy?.title ??
      singlePolicy?.description ??
      ""
    );
  }

  // Try cancellationPolicies array — prefer the default policy
  const policies = toArray(room?.cancellationPolicies);
  const defaultPolicy =
    policies.find((p) => p?.isDefault) ?? policies[0];

  if (defaultPolicy) {
    if (typeof defaultPolicy === "string") return defaultPolicy;
    const tier = defaultPolicy?.tierName ?? "";
    const refundPct = defaultPolicy?.refundPercentage;
    if (tier && refundPct !== undefined) {
      return refundPct === 0
        ? `${tier} — Non-refundable`
        : `${tier} — ${refundPct}% refund`;
    }
    return tier || defaultPolicy?.description || "";
  }

  return room?.cancellationPolicyName ?? room?.cancellationPolicyDescription ?? "";
}

function RoomFact({ label, value }) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return (
    <div className="room-card__fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const availabilityLabels = {
  available: "Available",
  checking: "Checking availability",
  error: "Error checking availability",
  "needs-dates": "Needs dates",
  unavailable: "Not available",
  unchecked: "Check availability",
};

function getAvailabilityClassName(status) {
  return `room-card__availability room-card__availability--${status}`;
}

export default function RoomCard({
  availabilityStatus = "needs-dates",
  isCheckingAvailability = false,
  onBook,
  onCheckAvailability,
  onMoreDetails,
  room,
}) {
  const image = getRoomImage(room);
  const roomName = getRoomName(room);
  const roomType = getRoomType(room);
  const amenities = getAmenities(room);
  const cancellationPolicy = getCancellationPolicy(room);
  const priceLabel = formatUsdPrice(room?.price ?? room?.basePrice);
  const adults = room?.maxAdults;
  const children = room?.maxChildren;
  const guestCapacity =
    adults !== undefined || children !== undefined
      ? `${adults ?? 0} adults${children !== undefined ? `, ${children} children` : ""}`
      : "";
  const resolvedAvailabilityStatus = isCheckingAvailability
    ? "checking"
    : availabilityStatus;
  const selectDisabled = resolvedAvailabilityStatus !== "available";
  const checkDisabled =
    resolvedAvailabilityStatus === "needs-dates" ||
    resolvedAvailabilityStatus === "checking";

  function handleCardClick() {
    onMoreDetails?.(room);
  }

  function handleCardKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick();
    }
  }

  return (
    <article
      className="room-card room-card--clickable"
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <div className="room-card__media">
        {image ? (
          <img src={image} alt={roomName} />
        ) : (
          <div className="room-card__image-placeholder" aria-hidden="true">
            Room photo needs backend verification
          </div>
        )}
      </div>

      <div className="room-card__body">
        <div className="room-card__header">
          <div>
            <p className="eyebrow">Room option</p>
            <h3>{roomName}</h3>
            {roomType ? <p className="room-card__type">{roomType}</p> : null}
          </div>

          <div className="room-card__price">
            {priceLabel ? (
              <>
                <strong>{priceLabel}</strong>
                <span>per night</span>
              </>
            ) : (
              <strong>Price needs backend verification</strong>
            )}
          </div>
        </div>

        {room?.description ? (
          <p className="room-card__description">{room.description}</p>
        ) : null}

        <div className="room-card__facts" aria-label={`${roomName} room facts`}>
          <RoomFact label="Bed" value={room?.bedType} />
          <RoomFact label="Guests" value={guestCapacity} />
          <RoomFact label="Size" value={room?.sizeSqm ? `${room.sizeSqm} sqm` : ""} />
          <RoomFact label="View" value={room?.view} />
        </div>

        {amenities.length ? (
          <div className="room-card__amenities">
            {amenities.slice(0, 3).map((amenity) => (
              <span key={amenity}>{amenity}</span>
            ))}
            {amenities.length > 3 ? (
              <span className="room-card__amenities-more">
                +{amenities.length - 3} more
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="room-card__policy">
          {cancellationPolicy || "Cancellation policy needs backend verification"}
        </div>

        <div className="room-card__availability-row">
          <span className={getAvailabilityClassName(resolvedAvailabilityStatus)}>
            {availabilityLabels[resolvedAvailabilityStatus] ??
              "Check availability"}
          </span>
        </div>

        <div
          className="room-card__actions"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <button
            className="button button--secondary"
            disabled={checkDisabled}
            type="button"
            onClick={() => onCheckAvailability?.(room)}
          >
            Check availability
          </button>
          <button
            className="button button--primary"
            disabled={selectDisabled}
            title={selectDisabled ? "Check availability before continuing." : undefined}
            type="button"
            onClick={() => !selectDisabled && onBook?.(room)}
          >
            Select and continue
          </button>
        </div>
      </div>
    </article>
  );
}
