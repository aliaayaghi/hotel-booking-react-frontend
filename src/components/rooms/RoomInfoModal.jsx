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
  return values.filter((v) => v !== undefined && v !== null && v !== "");
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

/* ── Amenity helpers ── */

function getAmenityName(a) {
  if (typeof a === "string") return a;
  return a?.name ?? a?.amenityName ?? a?.featureName ?? a?.title ?? a?.label ?? "";
}

function getAmenityCategory(a) {
  if (typeof a === "string") return "";
  return a?.category ?? "";
}

function getAmenities(room) {
  return toArray(room?.amenities ?? room?.roomAmenities).filter((a) =>
    Boolean(getAmenityName(a))
  );
}

/* ── Accessibility helpers ── */

function getAccessibilityFeature(a) {
  if (typeof a === "string") return a;
  return a?.feature ?? a?.name ?? "";
}

function getAccessibilityAvailable(a) {
  if (typeof a === "string") return true;
  const val = a?.isAvailable ?? a?.available;
  return val === undefined || val === null ? true : Boolean(val);
}

function getAccessibilities(room) {
  return toArray(
    room?.accessibilities ??
      room?.accessibilityFeatures ??
      room?.accessibility ??
      room?.roomAccessibility
  ).filter((a) => Boolean(getAccessibilityFeature(a)));
}

/* ── Cancellation policy helpers ── */

function getCancellationPolicies(room) {
  return toArray(room?.cancellationPolicies).filter(
    (p) => p && (p?.tierName || p?.description || p?.refundPercentage !== undefined)
  );
}

/* ── Shared sub-components ── */

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

/* ── Section: Room amenities ── */

function AmenitiesSection({ room }) {
  const amenities = getAmenities(room);

  if (!amenities.length) {
    return (
      <p className="room-info-modal__empty">
        Room amenity details are not available yet.
      </p>
    );
  }

  // Group by category
  const groups = {};
  amenities.forEach((a) => {
    const name = getAmenityName(a);
    const cat = getAmenityCategory(a);
    const key = cat || "__none__";
    if (!groups[key]) groups[key] = [];
    groups[key].push(name);
  });

  const cats = Object.keys(groups);
  const hasCategories = cats.some((c) => c !== "__none__");

  if (!hasCategories) {
    return (
      <ul className="room-info-modal__amenity-list">
        {groups["__none__"].map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="room-info-modal__amenity-groups">
      {cats.map((cat) => (
        <div key={cat} className="room-info-modal__amenity-group">
          {cat !== "__none__" && (
            <p className="room-info-modal__amenity-cat">{cat}</p>
          )}
          <ul className="room-info-modal__amenity-list">
            {groups[cat].map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ── Section: Accessibility ── */

function AccessibilitiesSection({ room }) {
  const items = getAccessibilities(room);

  if (!items.length) {
    return (
      <p className="room-info-modal__empty">
        Accessibility details are not available yet.
      </p>
    );
  }

  return (
    <ul className="room-info-modal__access-list">
      {items.map((a, i) => {
        const feature = getAccessibilityFeature(a);
        const available = getAccessibilityAvailable(a);

        return (
          <li
            key={a?.id ?? feature ?? i}
            className={
              available
                ? "room-info-modal__access-item"
                : "room-info-modal__access-item room-info-modal__access-item--unavailable"
            }
          >
            <span className="room-info-modal__access-icon" aria-hidden="true">
              {available ? "✓" : "×"}
            </span>
            {feature}
          </li>
        );
      })}
    </ul>
  );
}

/* ── Section: Cancellation policy ── */

function CancellationPoliciesSection({ room }) {
  const policies = getCancellationPolicies(room);

  if (!policies.length) {
    return (
      <p className="room-info-modal__empty">
        Cancellation policy details are not available yet.
      </p>
    );
  }

  return (
    <div className="room-info-modal__policy-list">
      {policies.map((policy, i) => {
        const tierName = policy?.tierName;
        const deadlineHours = policy?.deadlineHours;
        const refundPct = policy?.refundPercentage;
        const description = policy?.description;
        const isDefault = policy?.isDefault;

        // Only show refund row if refundPercentage is present in the data
        const hasRefundPct = refundPct !== undefined && refundPct !== null;

        // Support extra fields the task listed as possible but not in the confirmed schema
        const refundable = policy?.refundable ?? policy?.isRefundable;
        const refundAmount = policy?.refundAmount;
        const refundPolicy = policy?.refundPolicy;
        const refundDescription = policy?.refundDescription;

        const hasRefundable =
          !hasRefundPct && refundable !== undefined && refundable !== null;
        const hasRefundAmount =
          refundAmount !== undefined && refundAmount !== null && refundAmount !== "";

        return (
          <div key={policy?.id ?? i} className="room-info-modal__policy-item">
            <div className="room-info-modal__policy-header">
              {tierName ? (
                <span className="room-info-modal__policy-tier">{tierName}</span>
              ) : null}
              {isDefault ? (
                <span className="room-info-modal__policy-badge">Default</span>
              ) : null}
            </div>

            {deadlineHours !== undefined && deadlineHours !== null ? (
              <p className="room-info-modal__policy-row">
                <span>Deadline</span>
                <span>{deadlineHours} hours before check-in</span>
              </p>
            ) : null}

            {hasRefundPct ? (
              <p className="room-info-modal__policy-row">
                <span>Refund</span>
                <span>
                  {refundPct === 0 ? "Non-refundable" : `${refundPct}%`}
                </span>
              </p>
            ) : null}

            {hasRefundable ? (
              <p className="room-info-modal__policy-row">
                <span>Refundable</span>
                <span>{refundable ? "Yes" : "No"}</span>
              </p>
            ) : null}

            {hasRefundAmount ? (
              <p className="room-info-modal__policy-row">
                <span>Refund amount</span>
                <span>{formatUsdPrice(refundAmount) || refundAmount}</span>
              </p>
            ) : null}

            {refundPolicy ? (
              <p className="room-info-modal__policy-row">
                <span>Refund policy</span>
                <span>{refundPolicy}</span>
              </p>
            ) : null}

            {refundDescription ? (
              <p className="room-info-modal__policy-desc">{refundDescription}</p>
            ) : null}

            {description ? (
              <p className="room-info-modal__policy-desc">{description}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main modal ── */

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
                  <div
                    className="room-info-modal__thumbnails"
                    aria-label="Room photo thumbnails"
                  >
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

          <section
            className="room-info-modal__summary"
            aria-label={`${roomName} details`}
          >
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
              <InfoFact
                label="Room size"
                value={room?.sizeSqm ? `${room.sizeSqm} sqm` : ""}
              />
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
              <h3>Room amenities</h3>
              <AmenitiesSection room={room} />
            </div>

            <div className="room-info-modal__block">
              <h3>Accessibility</h3>
              <AccessibilitiesSection room={room} />
            </div>

            <div className="room-info-modal__block">
              <h3>Cancellation policy</h3>
              <CancellationPoliciesSection room={room} />
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
