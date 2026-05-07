import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import {
  useSavedHotels,
  useUnsaveHotel,
  useUpdateSavedNotes,
} from "../../features/saved/savedHooks.js";

function getHotelId(item) {
  const hotel = getHotel(item);
  return hotel?.id ?? hotel?.hotelId ?? item?.hotelId ?? item?.id;
}

function getHotel(item) {
  return (
    item?.hotel ??
    item?.hotelSummary ??
    item?.hotelResponse ??
    item?.savedHotel ??
    item
  );
}

function getHotelName(item) {
  const hotel = getHotel(item);
  return (
    hotel?.name ??
    hotel?.hotelName ??
    item?.hotelName ??
    item?.name ??
    "Hotel name needs backend verification"
  );
}

function getHotelLocation(item) {
  const hotel = getHotel(item);
  return [hotel?.city, hotel?.countryCode ?? hotel?.country]
    .filter(Boolean)
    .join(", ");
}

function getHotelStars(item) {
  const hotel = getHotel(item);
  return Number(hotel?.starRating ?? item?.starRating ?? 0);
}

function getHotelType(item) {
  const hotel = getHotel(item);
  return hotel?.type ?? item?.type ?? "";
}

function getPhotoUrl(item) {
  const hotel = getHotel(item);
  const photos =
    hotel?.photos ??
    hotel?.hotelPhotos ??
    item?.photos ??
    null;

  const directPhoto =
    hotel?.coverPhotoUrl ??
    hotel?.mainPhotoUrl ??
    hotel?.photoUrl ??
    hotel?.imageUrl ??
    item?.coverPhotoUrl ??
    item?.mainPhotoUrl ??
    item?.photoUrl ??
    item?.imageUrl ??
    hotel?.coverPhoto?.url ??
    hotel?.coverPhoto?.photoUrl ??
    item?.coverPhoto?.url ??
    item?.coverPhoto?.photoUrl;

  if (directPhoto) {
    return directPhoto;
  }

  if (Array.isArray(photos) && photos.length > 0) {
    const coverPhoto = photos.find((photo) => photo?.cover) ?? photos[0];
    return coverPhoto?.url ?? coverPhoto?.photoUrl ?? coverPhoto?.imageUrl ?? coverPhoto;
  }

  return null;
}

function StarRating({ count }) {
  if (!count) return null;
  return (
    <span className="saved-card__stars" aria-label={`${count} stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          style={{ color: i < count ? "#c9a227" : "#d7d0bf" }}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  );
}

function NotesEditor({ hotelId, initialNotes }) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const { mutate: updateNotes, isPending } = useUpdateSavedNotes(hotelId);

  function handleSave() {
    updateNotes(notes, {
      onSuccess: () => setEditing(false),
    });
  }

  if (!editing) {
    return (
      <div className="saved-card__notes">
        {notes ? (
          <p className="saved-card__notes-text">{notes}</p>
        ) : (
          <p className="saved-card__notes-empty">No notes yet</p>
        )}
        <button
          type="button"
          className="saved-card__notes-btn"
          onClick={() => setEditing(true)}
        >
          {notes ? "Edit note" : "Add note"}
        </button>
      </div>
    );
  }

  return (
    <div className="saved-card__notes saved-card__notes--editing">
      <textarea
        className="saved-card__notes-input"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add a private note about this hotel…"
        maxLength={500}
        rows={3}
        autoFocus
        disabled={isPending}
      />
      <div className="saved-card__notes-actions">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => {
            setNotes(initialNotes ?? "");
            setEditing(false);
          }}
          disabled={isPending}
        >
          Cancel
        </button>
        <button
          type="button"
          className="button button--primary"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? "Saving…" : "Save note"}
        </button>
      </div>
    </div>
  );
}

function SavedHotelCard({ item }) {
  const hotelId = getHotelId(item);
  const { mutate: unsave, isPending: isRemoving } = useUnsaveHotel(hotelId);
  const photoUrl = getPhotoUrl(item);
  const stars = getHotelStars(item);
  const hotelType = getHotelType(item);
  const location = getHotelLocation(item);
  const notes = item?.notes ?? "";

  function handleUnsave() {
    if (window.confirm("Remove this hotel from your saved list?")) {
      unsave();
    }
  }

  return (
    <article className="saved-card">
      <div className="saved-card__media">
        {photoUrl ? (
          <img src={photoUrl} alt={getHotelName(item)} />
        ) : (
          <div className="saved-card__placeholder">
            <span>&#127970;</span>
          </div>
        )}
      </div>

      <div className="saved-card__body">
        <div className="saved-card__header">
          <div>
            {hotelType && <p className="saved-card__type">{hotelType}</p>}
            <h2 className="saved-card__name">
              <Link to={`/hotels/${hotelId}`}>{getHotelName(item)}</Link>
            </h2>
            <StarRating count={stars} />
            {location && <p className="saved-card__location">{location}</p>}
          </div>
          <button
            type="button"
            className="saved-card__remove"
            onClick={handleUnsave}
            disabled={isRemoving}
            aria-label="Remove from saved"
          >
            {isRemoving ? "…" : "✕"}
          </button>
        </div>

        <NotesEditor hotelId={hotelId} initialNotes={notes} />

        <div className="saved-card__footer">
          <Link
            to={`/hotels/${hotelId}`}
            className="button button--primary"
          >
            View hotel
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function SavedHotelsPage() {
  const { data, isLoading, isError, refetch } = useSavedHotels();

  const savedList = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.content)
        ? data.content
        : [];

  if (isLoading) {
    return <LoadingState message="Loading your saved hotels…" />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Could not load saved hotels."
        onRetry={refetch}
      />
    );
  }

  if (savedList.length === 0) {
    return (
      <main className="public-page saved-page">
        <div className="saved-page__heading">
          <p className="eyebrow">My account</p>
          <h1>Saved Hotels</h1>
        </div>
        <div className="feedback-state">
          <p className="eyebrow">Nothing here yet</p>
          <h2>No saved hotels</h2>
          <p>Browse hotels and tap the heart icon to save them here.</p>
          <Link to="/search" className="button button--primary">
            Find hotels
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="public-page saved-page">
      <div className="saved-page__heading">
        <p className="eyebrow">My account</p>
        <h1>Saved Hotels</h1>
        <p className="saved-page__count">
          {savedList.length} hotel{savedList.length !== 1 ? "s" : ""} saved
        </p>
      </div>

      <div className="saved-list">
        {savedList.map((item, i) => (
          <SavedHotelCard key={getHotelId(item) ?? i} item={item} />
        ))}
      </div>
    </main>
  );
}
