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
  const policy = room?.cancellationPolicy ?? room?.cancellationPolicyPreview;

  if (typeof policy === "string") {
    return policy;
  }

  return (
    policy?.name ??
    policy?.title ??
    policy?.description ??
    room?.cancellationPolicyName ??
    room?.cancellationPolicyDescription ??
    ""
  );
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

export default function RoomCard({ onMoreDetails, room }) {
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

  return (
    <article className="room-card">
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
            {amenities.slice(0, 4).map((amenity) => (
              <span key={amenity}>{amenity}</span>
            ))}
          </div>
        ) : null}

        <div className="room-card__policy">
          {cancellationPolicy || "Cancellation policy needs backend verification"}
        </div>

        <div className="room-card__actions">
          <button
            className="button button--secondary"
            type="button"
            onClick={() => onMoreDetails?.(room)}
          >
            More details
          </button>
          <button className="button button--primary" type="button">
            Select and continue
          </button>
        </div>
      </div>
    </article>
  );
}
