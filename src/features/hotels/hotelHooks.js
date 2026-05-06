import { useQuery } from "@tanstack/react-query";

import {
  getHotelAccessibility,
  getHotelAmenities,
  getHotelBreakfastPolicy,
  getHotelById,
  getHotelCheckinPolicy,
  getHotelNearbyPlaces,
  getHotelPetsPolicy,
  getHotelPhotos,
} from "./hotels.api.js";
import { getHotelRooms } from "../rooms/rooms.api.js";
import {
  getHotelAverageScores,
  getHotelReviews,
} from "../reviews/reviews.api.js";

export const hotelDetailQueryKeys = {
  all: ["hotels"],
  detail: (hotelId) => ["hotels", "detail", hotelId],
  photos: (hotelId) => ["hotels", "detail", hotelId, "photos"],
  amenities: (hotelId) => ["hotels", "detail", hotelId, "amenities"],
  accessibility: (hotelId) => ["hotels", "detail", hotelId, "accessibility"],
  nearby: (hotelId) => ["hotels", "detail", hotelId, "nearby"],
  checkinPolicy: (hotelId) => [
    "hotels",
    "detail",
    hotelId,
    "policies",
    "checkin",
  ],
  petsPolicy: (hotelId) => ["hotels", "detail", hotelId, "policies", "pets"],
  breakfastPolicy: (hotelId) => [
    "hotels",
    "detail",
    hotelId,
    "policies",
    "breakfast",
  ],
  rooms: (hotelId) => ["hotels", "detail", hotelId, "rooms"],
  reviews: (hotelId) => ["reviews", "hotel", hotelId],
  averageScores: (hotelId) => ["reviews", "hotel", hotelId, "average-scores"],
};

function hasHotelId(hotelId) {
  return hotelId !== undefined && hotelId !== null && hotelId !== "";
}

export function useHotelDetails(hotelId) {
  return useQuery({
    queryKey: hotelDetailQueryKeys.detail(hotelId),
    queryFn: () => getHotelById(hotelId),
    enabled: hasHotelId(hotelId),
  });
}

export function useHotelPhotos(hotelId) {
  return useQuery({
    queryKey: hotelDetailQueryKeys.photos(hotelId),
    queryFn: () => getHotelPhotos(hotelId),
    enabled: hasHotelId(hotelId),
  });
}

export function useHotelAmenities(hotelId) {
  return useQuery({
    queryKey: hotelDetailQueryKeys.amenities(hotelId),
    queryFn: () => getHotelAmenities(hotelId),
    enabled: hasHotelId(hotelId),
  });
}

export function useHotelAccessibility(hotelId) {
  return useQuery({
    queryKey: hotelDetailQueryKeys.accessibility(hotelId),
    queryFn: () => getHotelAccessibility(hotelId),
    enabled: hasHotelId(hotelId),
  });
}

export function useHotelNearbyPlaces(hotelId) {
  return useQuery({
    queryKey: hotelDetailQueryKeys.nearby(hotelId),
    queryFn: () => getHotelNearbyPlaces(hotelId),
    enabled: hasHotelId(hotelId),
  });
}

export function useHotelCheckinPolicy(hotelId) {
  return useQuery({
    queryKey: hotelDetailQueryKeys.checkinPolicy(hotelId),
    queryFn: () => getHotelCheckinPolicy(hotelId),
    enabled: hasHotelId(hotelId),
  });
}

export function useHotelPetsPolicy(hotelId) {
  return useQuery({
    queryKey: hotelDetailQueryKeys.petsPolicy(hotelId),
    queryFn: () => getHotelPetsPolicy(hotelId),
    enabled: hasHotelId(hotelId),
  });
}

export function useHotelBreakfastPolicy(hotelId) {
  return useQuery({
    queryKey: hotelDetailQueryKeys.breakfastPolicy(hotelId),
    queryFn: () => getHotelBreakfastPolicy(hotelId),
    enabled: hasHotelId(hotelId),
  });
}

export function useHotelRooms(hotelId) {
  return useQuery({
    queryKey: hotelDetailQueryKeys.rooms(hotelId),
    queryFn: () => getHotelRooms(hotelId),
    enabled: hasHotelId(hotelId),
  });
}

export function useHotelReviews(hotelId) {
  return useQuery({
    queryKey: hotelDetailQueryKeys.reviews(hotelId),
    queryFn: () => getHotelReviews(hotelId),
    enabled: hasHotelId(hotelId),
  });
}

export function useHotelAverageScores(hotelId) {
  return useQuery({
    queryKey: hotelDetailQueryKeys.averageScores(hotelId),
    queryFn: () => getHotelAverageScores(hotelId),
    enabled: hasHotelId(hotelId),
  });
}

export function useHotelDetailsPageData(hotelId) {
  return {
    hotel: useHotelDetails(hotelId),
    photos: useHotelPhotos(hotelId),
    amenities: useHotelAmenities(hotelId),
    accessibility: useHotelAccessibility(hotelId),
    nearbyPlaces: useHotelNearbyPlaces(hotelId),
    checkinPolicy: useHotelCheckinPolicy(hotelId),
    petsPolicy: useHotelPetsPolicy(hotelId),
    breakfastPolicy: useHotelBreakfastPolicy(hotelId),
    rooms: useHotelRooms(hotelId),
    reviews: useHotelReviews(hotelId),
    averageScores: useHotelAverageScores(hotelId),
  };
}
