import { axiosClient } from "../../api/axiosClient.js";

function unwrapApiResponse(payload) {
  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    return payload;
  }

  const apiResponseKeys = [
    "success",
    "message",
    "status",
    "timestamp",
    "error",
    "path",
  ];
  const looksLikeApiResponse = apiResponseKeys.some((key) => key in payload);

  return looksLikeApiResponse ? payload.data : payload;
}

export async function getHotelRooms(hotelId) {
  const response = await axiosClient.get(
    `/api/hotels/${encodeURIComponent(hotelId)}/rooms`,
  );

  return unwrapApiResponse(response.data);
}

function getAvailabilityValue(payload, roomQuantity = 1) {
  const normalizedPayload = unwrapApiResponse(payload);

  if (typeof normalizedPayload === "boolean") {
    return normalizedPayload;
  }

  if (Array.isArray(normalizedPayload)) {
    const requestedQuantity = Number(roomQuantity);
    const safeRoomQuantity =
      Number.isFinite(requestedQuantity) && requestedQuantity > 0
        ? requestedQuantity
        : 1;

    return normalizedPayload.every((dateAvailability) => {
      const availableCount = Number(dateAvailability?.availableCount);

      return (
        dateAvailability?.fullyBooked === false &&
        Number.isFinite(availableCount) &&
        availableCount >= safeRoomQuantity
      );
    });
  }

  if (!normalizedPayload || typeof normalizedPayload !== "object") {
    return null;
  }

  if (typeof normalizedPayload.available === "boolean") {
    return normalizedPayload.available;
  }

  if (typeof normalizedPayload.isAvailable === "boolean") {
    return normalizedPayload.isAvailable;
  }

  if ("data" in normalizedPayload) {
    return getAvailabilityValue(normalizedPayload.data, roomQuantity);
  }

  return null;
}

export async function checkHotelRoomAvailability({
  from,
  hotelId,
  roomId,
  roomQuantity,
  to,
}) {
  const response = await axiosClient.get(
    `/api/hotels/${encodeURIComponent(hotelId)}/rooms/${encodeURIComponent(roomId)}/availability`,
    {
      params: {
        from,
        roomQuantity,
        to,
      },
    },
  );
  const availability = getAvailabilityValue(response.data, roomQuantity);

  if (typeof availability !== "boolean") {
    throw new Error("Availability response needs backend verification.");
  }

  return availability;
}
