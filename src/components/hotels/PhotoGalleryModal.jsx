import React, { useEffect } from "react";

function getPhotoUrl(photo) {
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

function getPhotoAlt(photo, fallback) {
  return (
    photo?.altText ??
    photo?.caption ??
    photo?.title ??
    photo?.description ??
    fallback
  );
}

export default function PhotoGalleryModal({
  hotelName,
  isOpen,
  onClose,
  onSelectPhoto,
  photos,
  selectedIndex,
}) {
  const selectedPhoto = photos[selectedIndex];
  const selectedPhotoUrl = getPhotoUrl(selectedPhoto);
  const selectedPhotoAlt = getPhotoAlt(
    selectedPhoto,
    `${hotelName} photo ${selectedIndex + 1}`,
  );
  const hasMultiplePhotos = photos.length > 1;

  function showPreviousPhoto() {
    onSelectPhoto((selectedIndex - 1 + photos.length) % photos.length);
  }

  function showNextPhoto() {
    onSelectPhoto((selectedIndex + 1) % photos.length);
  }

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }

      if (event.key === "ArrowLeft" && hasMultiplePhotos) {
        showPreviousPhoto();
      }

      if (event.key === "ArrowRight" && hasMultiplePhotos) {
        showNextPhoto();
      }
    }

    document.body.classList.add("modal-open");
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasMultiplePhotos, isOpen, onClose, selectedIndex]);

  if (!isOpen || !selectedPhotoUrl) {
    return null;
  }

  return (
    <div
      aria-label={`${hotelName} photo gallery`}
      aria-modal="true"
      className="photo-gallery-modal"
      role="dialog"
    >
      <button
        aria-label="Close gallery"
        className="photo-gallery-modal__backdrop"
        type="button"
        onClick={onClose}
      />

      <div className="photo-gallery-modal__panel">
        <div className="photo-gallery-modal__header">
          <div>
            <p className="eyebrow">Gallery</p>
            <h2>{hotelName}</h2>
          </div>
          <button
            aria-label="Close gallery"
            className="photo-gallery-modal__close"
            type="button"
            onClick={onClose}
          >
            x
          </button>
        </div>

        <div className="photo-gallery-modal__stage">
          {hasMultiplePhotos ? (
            <button
              aria-label="Previous photo"
              className="photo-gallery-modal__nav photo-gallery-modal__nav--previous"
              type="button"
              onClick={showPreviousPhoto}
            >
              &lsaquo;
            </button>
          ) : null}

          <img src={selectedPhotoUrl} alt={selectedPhotoAlt} />

          {hasMultiplePhotos ? (
            <button
              aria-label="Next photo"
              className="photo-gallery-modal__nav photo-gallery-modal__nav--next"
              type="button"
              onClick={showNextPhoto}
            >
              &rsaquo;
            </button>
          ) : null}
        </div>

        <div className="photo-gallery-modal__footer">
          <span>
            {selectedIndex + 1} / {photos.length}
          </span>

          {hasMultiplePhotos ? (
            <div className="photo-gallery-modal__thumbnails" aria-label="Photo thumbnails">
              {photos.map((photo, index) => {
                const photoUrl = getPhotoUrl(photo);

                return (
                  <button
                    aria-label={`Show photo ${index + 1}`}
                    className={
                      index === selectedIndex
                        ? "photo-gallery-modal__thumbnail photo-gallery-modal__thumbnail--active"
                        : "photo-gallery-modal__thumbnail"
                    }
                    key={photo?.id ?? photoUrl ?? index}
                    type="button"
                    onClick={() => onSelectPhoto(index)}
                  >
                    <img
                      src={photoUrl}
                      alt={getPhotoAlt(photo, `${hotelName} thumbnail ${index + 1}`)}
                    />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
