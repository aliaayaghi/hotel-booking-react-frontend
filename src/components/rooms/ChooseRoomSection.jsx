import React, { useState } from "react";

import EmptyState from "../feedback/EmptyState.jsx";
import ErrorState from "../feedback/ErrorState.jsx";
import LoadingState from "../feedback/LoadingState.jsx";
import RoomCard from "./RoomCard.jsx";
import RoomInfoModal from "./RoomInfoModal.jsx";

function getRooms(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  return data.rooms ?? data.items ?? data.content ?? data.results ?? [];
}

function getTravelersLabel(searchValues) {
  const adults = Number(searchValues.adults);
  const children = Number(searchValues.children);
  const rooms = Number(searchValues.rooms);
  const parts = [];

  if (Number.isFinite(adults) && adults > 0) {
    parts.push(`${adults} adult${adults === 1 ? "" : "s"}`);
  }

  if (Number.isFinite(children) && children > 0) {
    parts.push(`${children} child${children === 1 ? "" : "ren"}`);
  }

  if (Number.isFinite(rooms) && rooms > 0) {
    parts.push(`${rooms} room${rooms === 1 ? "" : "s"}`);
  }

  return parts.join(", ") || "Travelers and rooms";
}

function SearchSummaryField({ label, value }) {
  return (
    <div className="choose-room-search__field">
      <span>{label}</span>
      <strong>{value || "Not selected"}</strong>
    </div>
  );
}

export default function ChooseRoomSection({ roomsQuery, searchValues }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const rooms = getRooms(roomsQuery.data);

  return (
    <section
      aria-labelledby="hotel-rooms-title"
      className="hotel-details-section choose-room-section"
      id="rooms"
    >
      <div className="choose-room-section__heading">
        <div>
          <p className="eyebrow">Rooms</p>
          <h2 id="hotel-rooms-title">Choose your room</h2>
        </div>
      </div>

      <div className="choose-room-search" aria-label="Selected stay details">
        <SearchSummaryField label="Check-in" value={searchValues.checkIn} />
        <SearchSummaryField label="Check-out" value={searchValues.checkOut} />
        <SearchSummaryField
          label="Travelers"
          value={getTravelersLabel(searchValues)}
        />
      </div>

      {roomsQuery.isLoading ? (
        <LoadingState message="Fetching room options from the backend." />
      ) : null}

      {roomsQuery.isError ? (
        <ErrorState
          message={
            roomsQuery.error?.response?.data?.message ??
            roomsQuery.error?.message ??
            "Rooms request failed."
          }
          onRetry={roomsQuery.refetch}
        />
      ) : null}

      {roomsQuery.isSuccess && !rooms.length ? (
        <EmptyState
          title="No rooms available"
          message="The backend did not return active rooms for this hotel yet."
        />
      ) : null}

      {roomsQuery.isSuccess && rooms.length ? (
        <div className="choose-room-list">
          {rooms.map((room, index) => (
            <RoomCard
              key={room?.id ?? room?.roomId ?? `${room?.name ?? "room"}-${index}`}
              onMoreDetails={setSelectedRoom}
              room={room}
            />
          ))}
        </div>
      ) : null}

      <RoomInfoModal
        room={selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />
    </section>
  );
}
