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

export async function getHotelReviews(hotelId) {
  const response = await axiosClient.get(
    `/api/reviews/hotel/${encodeURIComponent(hotelId)}`,
  );

  return unwrapApiResponse(response.data);
}

export async function getHotelAverageScores(hotelId) {
  const response = await axiosClient.get(
    `/api/reviews/hotel/${encodeURIComponent(hotelId)}/average-scores`,
  );

  return unwrapApiResponse(response.data);
}
