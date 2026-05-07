import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createPayment,
  getPaymentByBooking,
  getPaymentById,
  requestRefund,
} from "./payments.api.js";

export function usePaymentByBooking(bookingId) {
  return useQuery({
    queryKey: ["payments", "booking", bookingId],
    queryFn: () => getPaymentByBooking(bookingId),
    enabled: Boolean(bookingId),
    retry: false,
  });
}

export function usePaymentById(paymentId) {
  return useQuery({
    queryKey: ["payments", paymentId],
    queryFn: () => getPaymentById(paymentId),
    enabled: Boolean(paymentId),
  });
}

export function useCreatePayment(bookingId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentData) => createPayment(bookingId, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "booking", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["bookings", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "my"] });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ?? "Payment failed. Please try again.",
      );
    },
  });
}

export function useRequestRefund(bookingId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => requestRefund(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments", "booking", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["bookings", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "my"] });
      toast.success("Refund requested successfully");
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ?? "Refund request failed. Please try again.",
      );
    },
  });
}
