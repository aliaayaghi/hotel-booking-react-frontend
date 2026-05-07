import React from "react";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatUsd(price) {
  if (price == null || price === 0) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function getNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function getRoomImage(room) {
  const photos = room?.photos ?? room?.roomPhotos ?? [];
  const firstPhoto = Array.isArray(photos) ? photos[0] : null;
  return (
    room?.mainPhotoUrl ??
    room?.coverPhotoUrl ??
    room?.photoUrl ??
    room?.imageUrl ??
    firstPhoto?.url ??
    firstPhoto?.photoUrl ??
    null
  );
}

function getHotelImage(hotel) {
  const photos = hotel?.photos ?? [];
  const first = Array.isArray(photos) ? photos[0] : null;
  return (
    hotel?.mainPhotoUrl ??
    hotel?.coverPhotoUrl ??
    hotel?.photoUrl ??
    first?.url ??
    null
  );
}

function getCancellationText(room) {
  const policy = room?.cancellationPolicy ?? room?.cancellationPolicyPreview;
  if (typeof policy === "string") return policy;
  return (
    policy?.name ??
    policy?.description ??
    room?.cancellationPolicyName ??
    room?.cancellationPolicyDescription ??
    null
  );
}

export default function BookingSummary({
  hotel,
  room,
  checkIn,
  checkOut,
  adults,
  children,
  childrenAges,
  roomCount,
}) {
  const nights = getNights(checkIn, checkOut);
  const pricePerNight = room?.price ?? room?.basePrice ?? 0;
  const estimatedTotal =
    nights > 0 && pricePerNight > 0 ? pricePerNight * nights * roomCount : null;
  const image = getRoomImage(room) || getHotelImage(hotel);
  const cancellationText = getCancellationText(room);
  const location = [hotel?.city, hotel?.countryCode ?? hotel?.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="checkout-summary">
      {image && (
        <div className="checkout-summary__image-wrap">
          <img src={image} alt={room?.name ?? hotel?.name ?? "Room"} className="checkout-summary__image" />
        </div>
      )}

      <div className="checkout-summary__body">
        <p className="eyebrow">Booking summary</p>

        <h2 className="checkout-summary__hotel">{hotel?.name ?? "Hotel"}</h2>

        {location && (
          <p className="checkout-summary__location">{location}</p>
        )}

        {(room?.name || room?.type) && (
          <p className="checkout-summary__room">
            {room?.name ?? room?.type}
          </p>
        )}

        <dl className="checkout-summary__dl">
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
            <dt>Guests</dt>
            <dd>
              {adults ?? 1} adult{(adults ?? 1) !== 1 ? "s" : ""}
              {children > 0 ? `, ${children} child${children !== 1 ? "ren" : ""}` : ""}
            </dd>
          </div>
          {childrenAges && children > 0 && (
            <div>
              <dt>Children ages</dt>
              <dd>{childrenAges}</dd>
            </div>
          )}
          <div>
            <dt>Rooms</dt>
            <dd>{roomCount ?? 1}</dd>
          </div>
          {pricePerNight > 0 && (
            <div>
              <dt>Price / night</dt>
              <dd>{formatUsd(pricePerNight)}</dd>
            </div>
          )}
        </dl>

        {estimatedTotal && (
          <div className="checkout-summary__total">
            <span>Estimated total</span>
            <strong>{formatUsd(estimatedTotal)}</strong>
          </div>
        )}

        {estimatedTotal && nights > 0 && roomCount > 1 && (
          <p className="checkout-summary__total-note">
            {formatUsd(pricePerNight)} &times; {nights} nights &times; {roomCount} rooms
          </p>
        )}

        {cancellationText && (
          <div className="checkout-summary__policy">
            <p className="eyebrow">Cancellation policy</p>
            <p>{cancellationText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
