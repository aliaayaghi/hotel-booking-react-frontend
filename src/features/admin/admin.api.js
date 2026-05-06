import { axiosClient } from "../../api/axiosClient.js";

export async function getAdminStats() {
  const { data } = await axiosClient.get("/api/admin/stats");
  return data;
}

export async function getAdminHotels(params = {}) {
  const { data } = await axiosClient.get("/api/admin/hotels", { params });
  return data;
}

export async function getAdminUsers(params = {}) {
  const { data } = await axiosClient.get("/api/admin/users", { params });
  return data;
}

export async function approveHotel(hotelId) {
  const { data } = await axiosClient.patch(`/api/admin/hotels/${hotelId}/approve`);
  return data;
}

export async function rejectHotel(hotelId, reason) {
  const { data } = await axiosClient.patch(`/api/admin/hotels/${hotelId}/reject`, { reason });
  return data;
}

export async function deleteAdminHotel(hotelId) {
  const { data } = await axiosClient.delete(`/api/admin/hotels/${hotelId}`);
  return data;
}

export async function suspendUser(userId, reason) {
  const { data } = await axiosClient.patch(`/api/admin/users/${userId}/suspend`, { reason });
  return data;
}

export async function unsuspendUser(userId) {
  const { data } = await axiosClient.patch(`/api/admin/users/${userId}/unsuspend`);
  return data;
}
