import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  cancelBooking,
  completeBooking,
  confirmBooking,
  createBooking,
  getBookingById,
  getHotelBookings,
  getMyBookings,
  noShowBooking,
} from "./bookings.api.js";

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Could not create booking. Please try again.");
    },
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: ["bookings", "my"],
    queryFn: getMyBookings,
  });
}

export function useBooking(bookingId) {
  return useQuery({
    queryKey: ["bookings", bookingId],
    queryFn: () => getBookingById(bookingId),
    enabled: Boolean(bookingId),
  });
}

export function useHotelBookings(hotelId, params) {
  return useQuery({
    queryKey: ["bookings", "hotel", hotelId, params],
    queryFn: () => getHotelBookings(hotelId, params),
    enabled: Boolean(hotelId),
  });
}

function useBookingStatusMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success(successMessage);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "Action failed. Please try again.");
    },
  });
}

export function useCancelBooking(bookingId) {
  return useBookingStatusMutation(() => cancelBooking(bookingId), "Booking cancelled");
}

export function useConfirmBooking(bookingId) {
  return useBookingStatusMutation(() => confirmBooking(bookingId), "Booking confirmed");
}

export function useCompleteBooking(bookingId) {
  return useBookingStatusMutation(() => completeBooking(bookingId), "Booking marked as completed");
}

export function useNoShowBooking(bookingId) {
  return useBookingStatusMutation(() => noShowBooking(bookingId), "Booking marked as no-show");
}
