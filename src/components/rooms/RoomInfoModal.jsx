import React, { useEffect, useRef, useState } from "react";

function toArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return value.items ?? value.content ?? value.results ?? [];
}

function compact(values) {
  return values.filter((value) => value !== undefined && value !== null && value !== "");
}

function getRoomName(room) {
  return room?.name ?? room?.roomName ?? "Room information";
}

function getRoomType(room) {
  return room?.type ?? room?.roomType ?? "";
}

function getPhotoUrl(photo) {
  if (typeof photo === "string") {
    return photo;
  }

  if (!photo || typeof photo !== "object") {
    return "";
  }

  return (
    photo.url ??
    photo.photoUrl ??
    photo.imageUrl ??
    photo.fileUrl ??
    photo.secureUrl ??
    ""
  );
}

function getPhotoAlt(photo, roomName, index) {
  if (typeof photo === "string") {
    return `${roomName} photo ${index + 1}`;
  }

  return (
    photo?.altText ??
    photo?.caption ??
    photo?.title ??
    photo?.description ??
    `${roomName} photo ${index + 1}`
  );
}

function getRoomPhotos(room) {
  const photos = [
    ...compact([
      room?.mainPhotoUrl,
      room?.coverPhotoUrl,
      room?.photoUrl,
      room?.imageUrl,
    ]).map((url) => ({ url })),
    ...toArray(room?.photos ?? room?.roomPhotos ?? room?.images),
  ];
  const seen = new Set();

  return photos.filter((photo) => {
    const url = getPhotoUrl(photo);

    if (!url || seen.has(url)) {
      return false;
    }

    seen.add(url);
    return true;
  });
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

function getItemName(item) {
  if (typeof item === "string") {
    return item;
  }

  return item?.name ?? item?.amenityName ?? item?.featureName ?? item?.title ?? item?.label ?? "";
}

function getAmenities(room) {
  return toArray(room?.amenities ?? room?.roomAmenities)
    .map(getItemName)
    .filter(Boolean);
}

function getAccessibilityFeatures(room) {
  return toArray(
    room?.accessibilityFeatures ??
      room?.accessibility ??
      room?.roomAccessibility ??
      room?.roomAccessibilityFeatures,
  )
    .map(getItemName)
    .filter(Boolean);
}

function getCancellationPolicies(room) {
  const policies = toArray(room?.cancellationPolicies);
  const singlePolicy = room?.cancellationPolicy ?? room?.cancellationPolicyPreview;
  const policyValues = policies.length ? policies : compact([singlePolicy]);

  return compact([
    ...policyValues.map((policy) => {
      if (typeof policy === "string") {
        return policy;
      }

      return policy?.name ?? policy?.title ?? policy?.description ?? "";
    }),
    room?.cancellationPolicyName,
    room?.cancellationPolicyDescription,
  ]);
}

function InfoFact({ label, value }) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return (
    <div className="room-info-modal__fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FeatureList({ emptyMessage, items }) {
  if (!items.length) {
    return <p className="room-info-modal__empty">{emptyMessage}</p>;
  }

  return (
    <ul className="room-info-modal__chips">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function RoomInfoModal({ onClose, room }) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const closeButtonRef = useRef(null);
  const isOpen = Boolean(room);
  const roomName = getRoomName(room);
  const roomType = getRoomType(room);
  const photos = getRoomPhotos(room);
  const selectedPhoto = photos[selectedPhotoIndex];
  const selectedPhotoUrl = getPhotoUrl(selectedPhoto);
  const hasMultiplePhotos = photos.length > 1;
  const amenities = getAmenities(room);
  const accessibilityFeatures = getAccessibilityFeatures(room);
  const cancellationPolicies = getCancellationPolicies(room);
  const priceLabel = formatUsdPrice(room?.price ?? room?.basePrice);

  function showPreviousPhoto() {
    setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
  }

  function showNextPhoto() {
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
  }

  useEffect(() => {
    setSelectedPhotoIndex(0);
  }, [room]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.classList.add("modal-open");
    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-labelledby="room-info-modal-title"
      aria-modal="true"
      className="room-info-modal"
      role="dialog"
    >
      <button
        aria-label="Close room information"
        className="room-info-modal__backdrop"
        type="button"
        onClick={onClose}
      />

      <div className="room-info-modal__panel">
        <header className="room-info-modal__header">
          <div>
            <p className="eyebrow">Room information</p>
            <h2 id="room-info-modal-title">{roomName}</h2>
            {roomType ? <p>{roomType}</p> : null}
          </div>

          <button
            aria-label="Close room information"
            className="room-info-modal__close"
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
          >
            x
          </button>
        </header>

        <div className="room-info-modal__content">
          <section className="room-info-modal__gallery" aria-label={`${roomName} photos`}>
            {selectedPhotoUrl ? (
              <>
                <div className="room-info-modal__photo-stage">
                  {hasMultiplePhotos ? (
                    <button
                      aria-label="Previous room photo"
                      className="room-info-modal__photo-nav room-info-modal__photo-nav--previous"
                      type="button"
                      onClick={showPreviousPhoto}
                    >
                      &lsaquo;
                    </button>
                  ) : null}

                  <img
                    src={selectedPhotoUrl}
                    alt={getPhotoAlt(selectedPhoto, roomName, selectedPhotoIndex)}
                  />

                  {hasMultiplePhotos ? (
                    <button
                      aria-label="Next room photo"
                      className="room-info-modal__photo-nav room-info-modal__photo-nav--next"
                      type="button"
                      onClick={showNextPhoto}
                    >
                      &rsaquo;
                    </button>
                  ) : null}
                </div>

                {hasMultiplePhotos ? (
                  <div className="room-info-modal__thumbnails" aria-label="Room photo thumbnails">
                    {photos.map((photo, index) => {
                      const photoUrl = getPhotoUrl(photo);

                      return (
                        <button
                          aria-label={`Show room photo ${index + 1}`}
                          className={
                            index === selectedPhotoIndex
                              ? "room-info-modal__thumbnail room-info-modal__thumbnail--active"
                              : "room-info-modal__thumbnail"
                          }
                          key={photo?.id ?? photoUrl ?? index}
                          type="button"
                          onClick={() => setSelectedPhotoIndex(index)}
                        >
                          <img
                            src={photoUrl}
                            alt={getPhotoAlt(photo, roomName, index)}
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="room-info-modal__photo-placeholder">
                <span aria-hidden="true">HB</span>
                <strong>Room photos need backend verification</strong>
                <small>The backend did not include room photos for this room.</small>
              </div>
            )}
          </section>

          <section className="room-info-modal__summary" aria-label={`${roomName} details`}>
            <div className="room-info-modal__price">
              {priceLabel ? (
                <>
                  <strong>{priceLabel}</strong>
                  <span>per night</span>
                </>
              ) : (
                <strong>Price needs backend verification</strong>
              )}
            </div>

            <div className="room-info-modal__facts">
              <InfoFact label="Bed type" value={room?.bedType} />
              <InfoFact label="Max adults" value={room?.maxAdults} />
              <InfoFact label="Max children" value={room?.maxChildren} />
              <InfoFact label="Room size" value={room?.sizeSqm ? `${room.sizeSqm} sqm` : ""} />
              <InfoFact label="Floor" value={room?.floor} />
              <InfoFact label="View" value={room?.view} />
            </div>

            {room?.description ? (
              <div className="room-info-modal__block">
                <h3>Description</h3>
                <p>{room.description}</p>
              </div>
            ) : null}

            <div className="room-info-modal__block">
              <h3>Amenities</h3>
              <FeatureList
                emptyMessage="Room amenities are not available yet."
                items={amenities}
              />
            </div>

            <div className="room-info-modal__block">
              <h3>Accessibility</h3>
              <FeatureList
                emptyMessage="Room accessibility details are not available yet."
                items={accessibilityFeatures}
              />
            </div>

            <div className="room-info-modal__block">
              <h3>Cancellation policy</h3>
              {cancellationPolicies.length ? (
                <ul className="room-info-modal__policies">
                  {cancellationPolicies.map((policy) => (
                    <li key={policy}>{policy}</li>
                  ))}
                </ul>
              ) : (
                <p className="room-info-modal__empty">
                  Cancellation policy details are not available yet
                </p>
              )}
            </div>
          </section>
        </div>

        <footer className="room-info-modal__footer">
          <button className="button button--secondary" type="button" onClick={onClose}>
            Close
          </button>
          <button className="button button--primary" type="button">
            Select and continue
          </button>
        </footer>
      </div>
    </div>
  );
}
