import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import {
  getMyHotels,
  getHotelRoomsAll,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../../features/manager/manager.api.js";

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

const ROOM_TYPES = ["STANDARD", "DELUXE", "SUITE", "STUDIO", "FAMILY", "VILLA"];
const BED_TYPES = ["KING", "QUEEN", "TWIN", "DOUBLE", "SINGLE", "BUNK"];
const VIEW_TYPES = ["NONE", "SEA", "CITY", "GARDEN", "POOL"];

const EMPTY_FORM = {
  name: "",
  type: "STANDARD",
  bedType: "QUEEN",
  description: "",
  maxAdults: 2,
  maxChildren: 0,
  quantity: 1,
  sizeSqm: "",
  floor: "",
  view: "NONE",
  price: "",
};

function RoomFormModal({ hotelId, room, onClose }) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(room);

  const [form, setForm] = useState(
    isEdit
      ? {
          name: room.name ?? "",
          type: room.type ?? "STANDARD",
          bedType: room.bedType ?? "QUEEN",
          description: room.description ?? "",
          maxAdults: room.maxAdults ?? 2,
          maxChildren: room.maxChildren ?? 0,
          quantity: room.quantity ?? 1,
          sizeSqm: room.sizeSqm ?? "",
          floor: room.floor ?? "",
          view: room.view ?? "NONE",
          price: room.price ?? "",
        }
      : { ...EMPTY_FORM },
  );

  const { mutate: save, isPending } = useMutation({
    mutationFn: (payload) =>
      isEdit ? updateRoom(hotelId, room.id, payload) : createRoom(hotelId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", hotelId] });
      toast.success(isEdit ? "Room updated" : "Room created");
      onClose();
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Could not save room."),
  });

  function field(key) {
    return (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form };
    ["maxAdults", "maxChildren", "quantity", "floor"].forEach((k) => {
      if (payload[k] !== "") payload[k] = Number(payload[k]);
      else delete payload[k];
    });
    ["sizeSqm", "price"].forEach((k) => {
      if (payload[k] !== "") payload[k] = parseFloat(payload[k]);
      else delete payload[k];
    });
    save(payload);
  }

  return (
    <div className="bmodal-overlay" role="dialog" aria-modal="true">
      <button type="button" className="bmodal-overlay__backdrop" onClick={onClose} aria-label="Close" tabIndex={-1} />
      <div className="bmodal">
        <div className="bmodal__header">
          <div>
            <p className="eyebrow">Hotel Manager</p>
            <h2 className="bmodal__title">{isEdit ? "Edit Room" : "Add New Room"}</h2>
          </div>
          <button type="button" className="bmodal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="bmodal__body">
          <form id="room-form" onSubmit={handleSubmit} noValidate className="settings-form">
            <div className="auth-form__row">
              <div className="auth-field">
                <label className="auth-field__label">Room name *</label>
                <input
                  type="text"
                  className="auth-field__input"
                  value={form.name}
                  onChange={field("name")}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="auth-field">
                <label className="auth-field__label">Type</label>
                <select className="auth-field__input" value={form.type} onChange={field("type")} disabled={isPending}>
                  {ROOM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="auth-form__row">
              <div className="auth-field">
                <label className="auth-field__label">Bed type</label>
                <select className="auth-field__input" value={form.bedType} onChange={field("bedType")} disabled={isPending}>
                  {BED_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="auth-field">
                <label className="auth-field__label">View</label>
                <select className="auth-field__input" value={form.view} onChange={field("view")} disabled={isPending}>
                  {VIEW_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-field__label">Description</label>
              <textarea
                className="auth-field__input"
                value={form.description}
                onChange={field("description")}
                rows={3}
                disabled={isPending}
              />
            </div>

            <div className="auth-form__row">
              <div className="auth-field">
                <label className="auth-field__label">Price per night *</label>
                <input
                  type="number"
                  className="auth-field__input"
                  value={form.price}
                  onChange={field("price")}
                  min={0.01}
                  step={0.01}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="auth-field">
                <label className="auth-field__label">Quantity</label>
                <input
                  type="number"
                  className="auth-field__input"
                  value={form.quantity}
                  onChange={field("quantity")}
                  min={1}
                  max={500}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="auth-form__row">
              <div className="auth-field">
                <label className="auth-field__label">Max adults</label>
                <input
                  type="number"
                  className="auth-field__input"
                  value={form.maxAdults}
                  onChange={field("maxAdults")}
                  min={1}
                  max={20}
                  disabled={isPending}
                />
              </div>
              <div className="auth-field">
                <label className="auth-field__label">Max children</label>
                <input
                  type="number"
                  className="auth-field__input"
                  value={form.maxChildren}
                  onChange={field("maxChildren")}
                  min={0}
                  max={10}
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="auth-form__row">
              <div className="auth-field">
                <label className="auth-field__label">Size (sqm)</label>
                <input
                  type="number"
                  className="auth-field__input"
                  value={form.sizeSqm}
                  onChange={field("sizeSqm")}
                  min={1}
                  step={0.5}
                  disabled={isPending}
                />
              </div>
              <div className="auth-field">
                <label className="auth-field__label">Floor</label>
                <input
                  type="number"
                  className="auth-field__input"
                  value={form.floor}
                  onChange={field("floor")}
                  disabled={isPending}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="bmodal__footer">
          <button type="button" className="button button--secondary" onClick={onClose} disabled={isPending}>Cancel</button>
          <button type="submit" form="room-form" className="button button--primary" disabled={isPending}>
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Create room"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteRoomButton({ hotelId, room }) {
  const queryClient = useQueryClient();
  const { mutate: del, isPending } = useMutation({
    mutationFn: () => deleteRoom(hotelId, room.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms", hotelId] });
      toast.success("Room deleted");
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Could not delete room."),
  });

  function handleDelete() {
    if (window.confirm(`Delete room "${room.name ?? room.type}"? This cannot be undone.`)) {
      del();
    }
  }

  return (
    <button className="dash-action-btn dash-action-btn--cancel" onClick={handleDelete} disabled={isPending}>
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}

export default function ManagerRoomsPage() {
  const { data: hotel, isLoading: hotelLoading, isError: hotelError } = useMyHotel();
  const {
    data: rooms = [],
    isLoading: roomsLoading,
    isError: roomsError,
    refetch,
  } = useHotelRooms(hotel?.id);

  const [modal, setModal] = useState(null); // null | "add" | room object (edit)

  const isLoading = hotelLoading || roomsLoading;
  const isError = hotelError || roomsError;

  if (isLoading) return <LoadingState message="Loading rooms…" />;
  if (isError) return <ErrorState message="Could not load rooms." onRetry={refetch} />;

  if (!hotel) {
    return (
      <div className="dash-page">
        <div className="dash-page__header">
          <p className="eyebrow">Hotel Manager</p>
          <h1>Rooms</h1>
        </div>
        <div className="feedback-state">
          <p className="eyebrow">No hotel</p>
          <h2>No hotel assigned</h2>
          <p>Contact the admin to get a hotel assigned to your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="eyebrow">Hotel Manager</p>
          <h1>Rooms</h1>
          <p className="dash-page__subtitle">{hotel.name}</p>
        </div>
        <button className="button button--primary" onClick={() => setModal("add")}>
          + Add room
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="feedback-state">
          <p className="eyebrow">No rooms yet</p>
          <h2>No rooms found</h2>
          <p>Add your first room to start accepting bookings.</p>
          <button className="button button--primary" onClick={() => setModal("add")}>Add room</button>
        </div>
      ) : (
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Bed</th>
                <th>View</th>
                <th>Max adults</th>
                <th>Qty</th>
                <th>Size (sqm)</th>
                <th>Price / night</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td>{r.name ?? "—"}</td>
                  <td>{r.type ?? "—"}</td>
                  <td>{r.bedType ?? "—"}</td>
                  <td>{r.view ?? "—"}</td>
                  <td>{r.maxAdults ?? "—"}</td>
                  <td>{r.quantity ?? "—"}</td>
                  <td>{r.sizeSqm ?? "—"}</td>
                  <td>
                    {r.price != null
                      ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(r.price)
                      : "—"}
                  </td>
                  <td>
                    <div className="dash-table__actions">
                      <button className="dash-action-btn" onClick={() => setModal(r)}>Edit</button>
                      <DeleteRoomButton hotelId={hotel.id} room={r} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <RoomFormModal
          hotelId={hotel.id}
          room={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
