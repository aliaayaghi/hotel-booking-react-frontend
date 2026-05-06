import { axiosClient } from "../../api/axiosClient.js";

export async function getMyBookings() {
  const { data } = await axiosClient.get("/api/bookings");
  return data;
}

export async function getBookingById(bookingId) {
  const { data } = await axiosClient.get(`/api/bookings/${bookingId}`);
  return data;
}

export async function cancelBooking(bookingId) {
  const { data } = await axiosClient.patch(`/api/bookings/${bookingId}/cancel`);
  return data;
}

export async function confirmBooking(bookingId) {
  const { data } = await axiosClient.patch(`/api/bookings/${bookingId}/confirm`);
  return data;
}

export async function completeBooking(bookingId) {
  const { data } = await axiosClient.patch(`/api/bookings/${bookingId}/complete`);
  return data;
}

export async function noShowBooking(bookingId) {
  const { data } = await axiosClient.patch(`/api/bookings/${bookingId}/no-show`);
  return data;
}

export async function getHotelBookings(hotelId, params = {}) {
  const { data } = await axiosClient.get(`/api/bookings/hotels/${hotelId}`, { params });
  return data;
}
