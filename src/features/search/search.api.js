import { axiosClient } from "../../api/axiosClient.js";

export const HOTEL_SEARCH_PARAMS = [
  "city",
  "checkIn",
  "checkOut",
  "adults",
  "children",
  "childrenAges",
  "rooms",
  "stars",
  "priceMin",
  "priceMax",
  "hotelType",
  "roomType",
  "bedType",
  "view",
  "freeCancellation",
  "breakfastIncluded",
  "petsAllowed",
  "wheelchairAccessible",
  "sortBy",
  "sortOrder",
  "page",
  "size",
];

export function buildHotelSearchParams(searchParams) {
  const params = {};

  HOTEL_SEARCH_PARAMS.forEach((paramName) => {
    const value =
      searchParams instanceof URLSearchParams
        ? searchParams.get(paramName)
        : searchParams?.[paramName];

    if (value !== undefined && value !== null && value !== "") {
      params[paramName] = value;
    }
  });

  if (!params.page) {
    params.page = "0";
  }

  if (!params.size) {
    params.size = "10";
  }

  return params;
}

export async function searchHotels(searchParams) {
  const params = buildHotelSearchParams(searchParams);
  const response = await axiosClient.get("/api/hotels/search", { params });

  return response.data;
}

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

function getHotelsFromResponse(payload) {
  const data = unwrapApiResponse(payload);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.hotels)) {
    return data.hotels;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.content)) {
    return data.data.content;
  }

  return [];
}

function getDistinctCitiesFromHotels(hotels, query) {
  const normalizedQuery = query.trim().toLowerCase();
  const seenCities = new Set();

  return hotels
    .map((hotel) => hotel?.city)
    .filter((city) => typeof city === "string" && city.trim() !== "")
    .map((city) => city.trim())
    .filter((city) => city.toLowerCase().includes(normalizedQuery))
    .filter((city) => {
      const key = city.toLowerCase();

      if (seenCities.has(key)) {
        return false;
      }

      seenCities.add(key);
      return true;
    })
    .sort((firstCity, secondCity) => firstCity.localeCompare(secondCity))
    .slice(0, 10);
}

export async function getHotelCitySuggestions(query, options = {}) {
  const response = await axiosClient.get("/api/hotels", {
    params: {
      city: query,
      page: 0,
      size: 50,
    },
    signal: options.signal,
  });

  return getDistinctCitiesFromHotels(getHotelsFromResponse(response.data), query);
}
