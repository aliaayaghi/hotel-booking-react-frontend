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

function hotelPath(hotelId, suffix = "") {
  return `/api/hotels/${encodeURIComponent(hotelId)}${suffix}`;
}

export async function getPublicHotels(params = {}) {
  const response = await axiosClient.get("/api/hotels", { params });

  return unwrapApiResponse(response.data);
}

export async function getHotelById(hotelId) {
  const response = await axiosClient.get(hotelPath(hotelId));

  return unwrapApiResponse(response.data);
}

export async function getHotelPhotos(hotelId) {
  const response = await axiosClient.get(hotelPath(hotelId, "/photos"));

  return unwrapApiResponse(response.data);
}

export async function getHotelAmenities(hotelId) {
  const response = await axiosClient.get(hotelPath(hotelId, "/amenities"));

  return unwrapApiResponse(response.data);
}

export async function getHotelAccessibility(hotelId) {
  const response = await axiosClient.get(hotelPath(hotelId, "/accessibility"));

  return unwrapApiResponse(response.data);
}

export async function getHotelNearbyPlaces(hotelId) {
  const response = await axiosClient.get(hotelPath(hotelId, "/nearby"));

  return unwrapApiResponse(response.data);
}

export async function getHotelCheckinPolicy(hotelId) {
  const response = await axiosClient.get(hotelPath(hotelId, "/policies/checkin"));

  return unwrapApiResponse(response.data);
}

export async function getHotelPetsPolicy(hotelId) {
  const response = await axiosClient.get(hotelPath(hotelId, "/policies/pets"));

  return unwrapApiResponse(response.data);
}

export async function getHotelBreakfastPolicy(hotelId) {
  const response = await axiosClient.get(
    hotelPath(hotelId, "/policies/breakfast"),
  );

  return unwrapApiResponse(response.data);
}
