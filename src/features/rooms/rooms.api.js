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
