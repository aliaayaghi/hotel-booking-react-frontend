import { axiosClient } from "../../api/axiosClient.js";

/* ---- Hotel ---- */
export async function getMyHotels() {
  const { data } = await axiosClient.get("/api/hotels/my");
  return data;
}

export async function updateHotel(hotelId, payload) {
  const { data } = await axiosClient.patch(`/api/hotels/${hotelId}`, payload);
  return data;
}

/* ---- Rooms ---- */
export async function getHotelRoomsAll(hotelId) {
  // GET /api/hotels/{hotelId}/rooms/all — returns all rooms including inactive
  // Falls back to /rooms if /all is not supported
  try {
    const { data } = await axiosClient.get(`/api/hotels/${hotelId}/rooms/all`);
    return data;
  } catch {
    const { data } = await axiosClient.get(`/api/hotels/${hotelId}/rooms`);
    return data;
  }
}

export async function createRoom(hotelId, payload) {
  const { data } = await axiosClient.post(`/api/hotels/${hotelId}/rooms`, payload);
  return data;
}

export async function updateRoom(hotelId, roomId, payload) {
  const { data } = await axiosClient.put(`/api/hotels/${hotelId}/rooms/${roomId}`, payload);
  return data;
}

export async function deleteRoom(hotelId, roomId) {
  const { data } = await axiosClient.delete(`/api/hotels/${hotelId}/rooms/${roomId}`);
  return data;
}

/* ---- Availability ---- */
export async function checkRoomAvailability(hotelId, roomId, params) {
  const { data } = await axiosClient.get(
    `/api/hotels/${hotelId}/rooms/${roomId}/availability`,
    { params },
  );
  return data;
}
