import React, { useMemo, useState } from "react";

import ErrorState from "../feedback/ErrorState.jsx";
import LoadingState from "../feedback/LoadingState.jsx";
import PhotoGalleryModal from "./PhotoGalleryModal.jsx";

function getPhotosArray(photoData) {
  if (Array.isArray(photoData)) {
    return photoData;
  }

  if (!photoData || typeof photoData !== "object") {
    return [];
  }

  return (
    photoData.photos ??
    photoData.items ??
    photoData.content ??
    photoData.results ??
    []
  );
}

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

function getPhotoAlt(photo, hotelName, index) {
  return (
    photo?.altText ??
    photo?.caption ??
    photo?.title ??
    photo?.description ??
    `${hotelName} photo ${index + 1}`
  );
}

function getPhotoOrder(photo) {
  const order = Number(
    photo?.displayOrder ?? photo?.order ?? photo?.sortOrder ?? photo?.position,
  );

  return Number.isFinite(order) ? order : Number.MAX_SAFE_INTEGER;
}

function isCoverPhoto(photo) {
  return Boolean(
    photo?.isCover ??
      photo?.cover ??
      photo?.coverPhoto ??
      photo?.mainPhoto ??
      photo?.primary,
  );
}

function sortPhotos(photos) {
  return photos
    .filter((photo) => getPhotoUrl(photo))
    .map((photo, index) => ({ index, photo }))
    .sort((first, second) => {
      const firstIsCover = isCoverPhoto(first.photo);
      const secondIsCover = isCoverPhoto(second.photo);

      if (firstIsCover !== secondIsCover) {
        return firstIsCover ? -1 : 1;
      }

      const orderDifference =
        getPhotoOrder(first.photo) - getPhotoOrder(second.photo);

      return orderDifference || first.index - second.index;
    })
    .map(({ photo }) => photo);
}

export default function HotelGallery({ hotelName, photosQuery }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const photos = useMemo(
    () => sortPhotos(getPhotosArray(photosQuery.data)),
    [photosQuery.data],
  );
  const visiblePhotos = photos.slice(0, 5);

  function openGallery(index) {
    setSelectedIndex(index);
    setIsModalOpen(true);
  }

  if (photosQuery.isLoading) {
    return (
      <section className="hotel-gallery-shell" aria-label="Hotel photos">
        <LoadingState message="Fetching hotel photos from the backend." />
      </section>
    );
  }

  if (photosQuery.isError) {
    return (
      <section className="hotel-gallery-shell" aria-label="Hotel photos">
        <ErrorState
          message={
            photosQuery.error?.response?.data?.message ??
            photosQuery.error?.message ??
            "Hotel photos request failed."
          }
          onRetry={photosQuery.refetch}
        />
      </section>
    );
  }

  if (!photos.length) {
    return (
      <section
        aria-label="Hotel photos"
        className="hotel-gallery hotel-gallery--empty"
      >
        <div className="hotel-gallery__placeholder">
          <span aria-hidden="true">HB</span>
          <p className="eyebrow">Gallery</p>
          <h2>Photos need backend verification</h2>
          <p>
            The backend did not return hotel photos for this stay yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`hotel-gallery hotel-gallery--count-${visiblePhotos.length}`}
      aria-label={`${hotelName} photos`}
    >
      <div className="hotel-gallery__grid">
        {visiblePhotos.map((photo, index) => {
          const photoUrl = getPhotoUrl(photo);
          const isLastVisiblePhoto = index === visiblePhotos.length - 1;
          const hiddenPhotoCount = photos.length - visiblePhotos.length;

          return (
            <button
              aria-label={`Open photo ${index + 1} of ${photos.length}`}
              className={
                index === 0
                  ? "hotel-gallery__item hotel-gallery__item--main"
                  : "hotel-gallery__item"
              }
              key={photo?.id ?? photoUrl ?? index}
              type="button"
              onClick={() => openGallery(index)}
            >
              <img src={photoUrl} alt={getPhotoAlt(photo, hotelName, index)} />

              {isLastVisiblePhoto && hiddenPhotoCount > 0 ? (
                <span className="hotel-gallery__overlay">
                  View all photos
                  <small>{photos.length} total</small>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <PhotoGalleryModal
        hotelName={hotelName}
        isOpen={isModalOpen}
        photos={photos}
        selectedIndex={selectedIndex}
        onClose={() => setIsModalOpen(false)}
        onSelectPhoto={setSelectedIndex}
      />
    </section>
  );
}
