import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import EmptyState from "../feedback/EmptyState.jsx";
import ErrorState from "../feedback/ErrorState.jsx";
import LoadingState from "../feedback/LoadingState.jsx";
import {
  DateRangeField,
  GuestSelector,
} from "../hotels/HotelSearchBar.jsx";
import RoomCard from "./RoomCard.jsx";
import RoomInfoModal from "./RoomInfoModal.jsx";
import { checkHotelRoomAvailability } from "../../features/rooms/rooms.api.js";

function getRooms(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  return data.rooms ?? data.items ?? data.content ?? data.results ?? [];
}

function getRoomId(room) {
  return room?.id ?? room?.roomId;
}

function hasStayDates(searchValues) {
  return Boolean(searchValues.checkIn && searchValues.checkOut);
}

function getRoomQuantity(searchValues) {
  const rooms = Number(searchValues.rooms);

  return Number.isFinite(rooms) && rooms > 0 ? rooms : 1;
}

function SearchSummaryField({ label, value }) {
  return (
    <div className="choose-room-search__field">
      <span>{label}</span>
      <strong>{value || "Not selected"}</strong>
    </div>
  );
}

export default function ChooseRoomSection({ hotelId, roomsQuery, searchValues }) {
  const [, setSearchParams] = useSearchParams();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [availabilityByRoom, setAvailabilityByRoom] = useState({});
  const rooms = getRooms(roomsQuery.data);
  const datesSelected = hasStayDates(searchValues);
  const roomQuantity = getRoomQuantity(searchValues);
  const availabilityMutation = useMutation({
    mutationFn: checkHotelRoomAvailability,
    onError: (_error, variables) => {
      if (
        variables.from !== searchValues.checkIn ||
        variables.hotelId !== hotelId ||
        variables.roomQuantity !== roomQuantity ||
        variables.to !== searchValues.checkOut
      ) {
        return;
      }

      setAvailabilityByRoom((currentAvailability) => ({
        ...currentAvailability,
        [variables.roomId]: "error",
      }));
    },
    onSuccess: (available, variables) => {
      if (
        variables.from !== searchValues.checkIn ||
        variables.hotelId !== hotelId ||
        variables.roomQuantity !== roomQuantity ||
        variables.to !== searchValues.checkOut
      ) {
        return;
      }

      setAvailabilityByRoom((currentAvailability) => ({
        ...currentAvailability,
        [variables.roomId]: available ? "available" : "unavailable",
      }));
    },
  });

  useEffect(() => {
    setAvailabilityByRoom({});
  }, [hotelId, searchValues.checkIn, searchValues.checkOut, roomQuantity]);

  function updateSearchParams(updates) {
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);

        Object.entries(updates).forEach(([name, value]) => {
          if (name === "petsAllowed") {
            if (value) {
              nextParams.set("petsAllowed", "true");
            } else {
              nextParams.delete("petsAllowed");
            }

            return;
          }

          if (value === "") {
            nextParams.delete(name);
          } else {
            nextParams.set(name, value);
          }

          if (name === "children" && Number(value) <= 0) {
            nextParams.delete("childrenAges");
          }
        });

        nextParams.set("page", "0");

        return nextParams;
      },
      { replace: true },
    );
  }

  function handleCheckAvailability(room) {
    const roomId = getRoomId(room);

    if (!datesSelected || !roomId) {
      return;
    }

    setAvailabilityByRoom((currentAvailability) => ({
      ...currentAvailability,
      [roomId]: "checking",
    }));

    availabilityMutation.mutate({
      from: searchValues.checkIn,
      hotelId,
      roomId,
      roomQuantity,
      to: searchValues.checkOut,
    });
  }

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
        {searchValues.city ? (
          <SearchSummaryField label="Destination" value={searchValues.city} />
        ) : null}

        <DateRangeField
          checkIn={searchValues.checkIn}
          checkOut={searchValues.checkOut}
          onChange={updateSearchParams}
        />

        <GuestSelector
          adults={searchValues.adults || "2"}
          children={searchValues.children || "0"}
          childrenAges={searchValues.childrenAges}
          onChange={updateSearchParams}
          petsAllowed={searchValues.petsAllowed}
          rooms={searchValues.rooms || "1"}
        />
      </div>

      {!datesSelected ? (
        <p className="choose-room-section__availability-note">
          Choose dates to check availability.
        </p>
      ) : null}

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
              availabilityStatus={
                datesSelected
                  ? availabilityByRoom[getRoomId(room)] ?? "unchecked"
                  : "needs-dates"
              }
              isCheckingAvailability={
                availabilityMutation.isPending &&
                availabilityMutation.variables?.roomId === getRoomId(room)
              }
              onMoreDetails={setSelectedRoom}
              onCheckAvailability={handleCheckAvailability}
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
