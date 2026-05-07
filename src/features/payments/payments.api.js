import { axiosClient } from "../../api/axiosClient.js";

export async function createPayment(bookingId, paymentData) {
  const { data } = await axiosClient.post(
    `/api/bookings/${encodeURIComponent(bookingId)}/payment`,
    paymentData,
  );
  return data;
}

export async function getPaymentByBooking(bookingId) {
  const { data } = await axiosClient.get(
    `/api/bookings/${encodeURIComponent(bookingId)}/payment`,
  );
  return data;
}

export async function getPaymentById(paymentId) {
  const { data } = await axiosClient.get(
    `/api/payments/${encodeURIComponent(paymentId)}`,
  );
  return data;
}

export async function requestRefund(bookingId) {
  const { data } = await axiosClient.post(
    `/api/bookings/${encodeURIComponent(bookingId)}/payment/refund`,
  );
  return data;
}
