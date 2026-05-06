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

export async function getHotelCitySuggestions(query, options = {}) {
  const response = await axiosClient.get("/api/hotels/autocomplete", {
    params: { q: query },
    signal: options.signal,
  });

  return response.data;
}
