import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createBooking } from "./bookings.api.js";
import { checkHotelRoomAvailability } from "../rooms/rooms.api.js";

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ?? "Could not create booking. Please try again.",
      );
    },
  });
}

export function useCheckRoomAvailability() {
  return useMutation({
    mutationFn: checkHotelRoomAvailability,
    onError: () => {
      toast.error("Could not check room availability. Please try again.");
    },
  });
}
