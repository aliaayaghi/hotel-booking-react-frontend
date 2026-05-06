import { axiosClient } from "../../api/axiosClient.js";

function savedPath(hotelId, suffix = "") {
  return `/api/customers/me/saved/${encodeURIComponent(hotelId)}${suffix}`;
}

export async function getSavedHotels() {
  const { data } = await axiosClient.get("/api/customers/me/saved");
  return data;
}

export async function getSavedStatus(hotelId) {
  const { data } = await axiosClient.get(savedPath(hotelId, "/status"));
  return data;
}

export async function saveHotel(hotelId, notes = "") {
  const { data } = await axiosClient.post(savedPath(hotelId), { notes });
  return data;
}

export async function unsaveHotel(hotelId) {
  const { data } = await axiosClient.delete(savedPath(hotelId));
  return data;
}

export async function updateSavedNotes(hotelId, notes) {
  const { data } = await axiosClient.patch(savedPath(hotelId, "/notes"), { notes });
  return data;
}
