import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getSavedHotels,
  getSavedStatus,
  saveHotel,
  unsaveHotel,
  updateSavedNotes,
} from "./saved.api.js";

export function useSavedStatus(hotelId, enabled = true) {
  return useQuery({
    queryKey: ["saved", "status", hotelId],
    queryFn: () => getSavedStatus(hotelId),
    enabled: enabled && Boolean(hotelId),
    retry: false,
  });
}

export function useSavedHotels() {
  return useQuery({
    queryKey: ["saved", "list"],
    queryFn: getSavedHotels,
  });
}

export function useSaveHotel(hotelId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notes = "") => saveHotel(hotelId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved", "status", hotelId] });
      queryClient.invalidateQueries({ queryKey: ["saved", "list"] });
      toast.success("Hotel saved to your list");
    },
    onError: () => toast.error("Could not save hotel. Please try again."),
  });
}

export function useUnsaveHotel(hotelId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => unsaveHotel(hotelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved", "status", hotelId] });
      queryClient.invalidateQueries({ queryKey: ["saved", "list"] });
      toast.success("Hotel removed from saved");
    },
    onError: () => toast.error("Could not remove hotel. Please try again."),
  });
}

export function useUpdateSavedNotes(hotelId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notes) => updateSavedNotes(hotelId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved", "list"] });
      toast.success("Notes updated");
    },
    onError: () => toast.error("Could not update notes. Please try again."),
  });
}
