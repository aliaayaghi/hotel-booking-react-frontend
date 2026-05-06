import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosClient } from "../../api/axiosClient.js";

import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import { getMyHotels, getHotelRoomsAll } from "../../features/manager/manager.api.js";

function useMyHotel() {
  return useQuery({
    queryKey: ["hotels", "my"],
    queryFn: getMyHotels,
    select: (data) => {
      if (Array.isArray(data)) return data[0];
      if (Array.isArray(data?.data)) return data.data[0];
      if (Array.isArray(data?.content)) return data.content[0];
      return null;
    },
  });
}

function useHotelRooms(hotelId) {
  return useQuery({
    queryKey: ["rooms", hotelId],
    queryFn: () => getHotelRoomsAll(hotelId),
    enabled: Boolean(hotelId),
    select: (data) => {
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.content)) return data.content;
      return [];
    },
  });
}

async function checkAvailability(hotelId, roomId, from, to, roomQuantity) {
  const { data } = await axiosClient.get(
    `/api/hotels/${hotelId}/rooms/${roomId}/availability`,
    { params: { from, to, roomQuantity } },
  );
  return data;
}

export default function ManagerAvailabilityPage() {
  const { data: hotel, isLoading: hotelLoading, isError: hotelError } = useMyHotel();
  const { data: rooms = [], isLoading: roomsLoading } = useHotelRooms(hotel?.id);

  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);

  if (hotelLoading || roomsLoading) return <LoadingState message="Loading availability data…" />;
  if (hotelError) return <ErrorState message="Could not load hotel." />;

  if (!hotel) {
    return (
      <div className="dash-page">
        <div className="dash-page__header">
          <p className="eyebrow">Hotel Manager</p>
          <h1>Availability</h1>
        </div>
        <div className="feedback-state">
          <p className="eyebrow">No hotel</p>
          <h2>No hotel assigned</h2>
          <p>Contact the admin to get a hotel assigned to your account.</p>
        </div>
      </div>
    );
  }

  async function handleCheck(e) {
    e.preventDefault();
    if (!selectedRoomId || !from || !to) {
      toast.error("Please select a room and enter both dates.");
      return;
    }
    if (new Date(to) <= new Date(from)) {
      toast.error("Check-out must be after check-in.");
      return;
    }
    setChecking(true);
    setResult(null);
    try {
      const data = await checkAvailability(hotel.id, selectedRoomId, from, to, quantity);
      setResult({ ok: true, data });
    } catch (err) {
      setResult({ ok: false, message: err?.response?.data?.message ?? "Could not check availability." });
    } finally {
      setChecking(false);
    }
  }

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <p className="eyebrow">Hotel Manager</p>
        <h1>Availability</h1>
        <p className="dash-page__subtitle">{hotel.name}</p>
      </div>

      <div className="avail-card">
        <h2 className="avail-card__title">Check Room Availability</h2>
        <form onSubmit={handleCheck} className="avail-form">
          <div className="auth-field">
            <label className="auth-field__label">Room</label>
            <select
              className="auth-field__input"
              value={selectedRoomId}
              onChange={(e) => { setSelectedRoomId(e.target.value); setResult(null); }}
              disabled={checking}
              required
            >
              <option value="">Select a room…</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name ?? r.type} {r.bedType ? `— ${r.bedType}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="auth-form__row">
            <div className="auth-field">
              <label className="auth-field__label">Check-in date</label>
              <input
                type="date"
                className="auth-field__input"
                value={from}
                onChange={(e) => { setFrom(e.target.value); setResult(null); }}
                disabled={checking}
                required
              />
            </div>
            <div className="auth-field">
              <label className="auth-field__label">Check-out date</label>
              <input
                type="date"
                className="auth-field__input"
                value={to}
                onChange={(e) => { setTo(e.target.value); setResult(null); }}
                disabled={checking}
                required
              />
            </div>
          </div>

          <div className="auth-field avail-form__qty">
            <label className="auth-field__label">Rooms requested</label>
            <input
              type="number"
              className="auth-field__input"
              value={quantity}
              min={1}
              max={selectedRoom?.quantity ?? 100}
              onChange={(e) => { setQuantity(Number(e.target.value)); setResult(null); }}
              disabled={checking}
            />
          </div>

          <button type="submit" className="button button--primary" disabled={checking || !selectedRoomId}>
            {checking ? "Checking…" : "Check availability"}
          </button>
        </form>

        {result && (
          <div className={`avail-result${result.ok ? " avail-result--available" : " avail-result--unavailable"}`}>
            {result.ok ? (
              <>
                <p className="avail-result__status">
                  {result.data?.available !== false ? "✓ Available" : "✗ Not available"}
                </p>
                {result.data?.availableRooms != null && (
                  <p className="avail-result__detail">Available rooms: {result.data.availableRooms}</p>
                )}
                {result.data?.message && (
                  <p className="avail-result__detail">{result.data.message}</p>
                )}
              </>
            ) : (
              <p className="avail-result__status">✗ {result.message}</p>
            )}
          </div>
        )}
      </div>

      {rooms.length > 0 && (
        <div className="dash-section">
          <h2 className="dash-section__title">Room Inventory</h2>
          <div className="dash-table-wrapper">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Type</th>
                  <th>Bed</th>
                  <th>Max adults</th>
                  <th>Quantity</th>
                  <th>Price / night</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((r) => (
                  <tr key={r.id}>
                    <td>{r.name ?? "—"}</td>
                    <td>{r.type ?? "—"}</td>
                    <td>{r.bedType ?? "—"}</td>
                    <td>{r.maxAdults ?? "—"}</td>
                    <td>{r.quantity ?? "—"}</td>
                    <td>
                      {r.price != null
                        ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(r.price)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
