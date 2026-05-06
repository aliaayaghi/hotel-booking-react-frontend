import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "react-router-dom";

import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import { getMyHotels, updateHotel } from "../../features/manager/manager.api.js";

function getHotelList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function useMyHotels() {
  return useQuery({ queryKey: ["hotels", "my"], queryFn: getMyHotels });
}

function useUpdateHotel(hotelId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => updateHotel(hotelId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotels", "my"] });
      toast.success("Hotel updated successfully");
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Could not update hotel."),
  });
}

const HOTEL_TYPES = ["HOTEL", "MOTEL", "RESORT", "HOSTEL", "BOUTIQUE", "APARTMENT", "VILLA"];

function HotelEditForm({ hotel, onClose }) {
  const { mutate: save, isPending } = useUpdateHotel(hotel.id);
  const [form, setForm] = useState({
    name: hotel.name ?? "",
    overview: hotel.overview ?? hotel.description ?? "",
    address: hotel.address ?? "",
    city: hotel.city ?? "",
    countryCode: hotel.countryCode ?? "",
    phone: hotel.phone ?? "",
    email: hotel.email ?? "",
    website: hotel.website ?? "",
    type: hotel.type ?? "HOTEL",
    starRating: hotel.starRating ?? 3,
  });

  function field(key) {
    return (e) => setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form };
    if (payload.starRating) payload.starRating = Number(payload.starRating);
    save(payload);
  }

  return (
    <div className="hotel-edit-form">
      <div className="hotel-edit-form__header">
        <h2>Edit Hotel Information</h2>
        <button type="button" className="bmodal__close" onClick={onClose}>✕</button>
      </div>
      <form onSubmit={handleSubmit} noValidate className="settings-form">
        <div className="auth-form__row">
          <div className="auth-field">
            <label className="auth-field__label">Hotel name *</label>
            <input
              type="text"
              value={form.name}
              onChange={field("name")}
              required
              className="auth-field__input"
              disabled={isPending}
            />
          </div>
          <div className="auth-field">
            <label className="auth-field__label">Type</label>
            <select value={form.type} onChange={field("type")} className="auth-field__input" disabled={isPending}>
              {HOTEL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-field__label">Overview / Description</label>
          <textarea
            value={form.overview}
            onChange={field("overview")}
            className="auth-field__input"
            rows={4}
            disabled={isPending}
          />
        </div>

        <div className="auth-form__row">
          <div className="auth-field">
            <label className="auth-field__label">Address</label>
            <input type="text" value={form.address} onChange={field("address")} className="auth-field__input" disabled={isPending} />
          </div>
          <div className="auth-field">
            <label className="auth-field__label">City *</label>
            <input type="text" value={form.city} onChange={field("city")} className="auth-field__input" disabled={isPending} />
          </div>
        </div>

        <div className="auth-form__row">
          <div className="auth-field">
            <label className="auth-field__label">Country code (e.g. US)</label>
            <input type="text" value={form.countryCode} onChange={field("countryCode")} maxLength={2} className="auth-field__input" disabled={isPending} />
          </div>
          <div className="auth-field">
            <label className="auth-field__label">Star rating</label>
            <select value={form.starRating} onChange={field("starRating")} className="auth-field__input" disabled={isPending}>
              {[1,2,3,4,5].map((s) => <option key={s} value={s}>{s} ★</option>)}
            </select>
          </div>
        </div>

        <div className="auth-form__row">
          <div className="auth-field">
            <label className="auth-field__label">Phone</label>
            <input type="tel" value={form.phone} onChange={field("phone")} className="auth-field__input" disabled={isPending} />
          </div>
          <div className="auth-field">
            <label className="auth-field__label">Email</label>
            <input type="email" value={form.email} onChange={field("email")} className="auth-field__input" disabled={isPending} />
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-field__label">Website</label>
          <input type="url" value={form.website} onChange={field("website")} placeholder="https://..." className="auth-field__input" disabled={isPending} />
        </div>

        <div className="auth-form__actions">
          <button type="button" className="button button--secondary" onClick={onClose} disabled={isPending}>Cancel</button>
          <button type="submit" className="button button--primary" disabled={isPending}>
            {isPending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function StarRating({ count }) {
  return (
    <span aria-label={`${count} stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < count ? "#c9a227" : "#d7d0bf" }}>★</span>
      ))}
    </span>
  );
}

export default function ManagerHotelPage() {
  const { data, isLoading, isError, refetch } = useMyHotels();
  const [editing, setEditing] = useState(false);
  const hotels = getHotelList(data);
  const hotel = hotels[0];

  if (isLoading) return <LoadingState message="Loading hotel details…" />;
  if (isError) return <ErrorState message="Could not load hotel." onRetry={refetch} />;

  if (!hotel) {
    return (
      <div className="dash-page">
        <div className="dash-page__header">
          <p className="eyebrow">Hotel Manager</p>
          <h1>My Hotel</h1>
        </div>
        <div className="feedback-state">
          <p className="eyebrow">No hotel assigned</p>
          <h2>You don&apos;t have a hotel yet</h2>
          <p>Contact the admin to get a hotel assigned to your account.</p>
        </div>
      </div>
    );
  }

  const photoUrl =
    hotel?.photos?.[0]?.url ?? hotel?.coverPhoto ?? hotel?.photoUrl ?? null;
  const location = [hotel.city, hotel.countryCode].filter(Boolean).join(", ");

  if (editing) {
    return (
      <div className="dash-page">
        <div className="dash-page__header">
          <p className="eyebrow">Hotel Manager</p>
          <h1>My Hotel</h1>
        </div>
        <HotelEditForm hotel={hotel} onClose={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <p className="eyebrow">Hotel Manager</p>
        <h1>My Hotel</h1>
      </div>

      <div className="hotel-profile-card">
        <div className="hotel-profile-card__image">
          {photoUrl ? (
            <img src={photoUrl} alt={hotel.name} />
          ) : (
            <div className="hotel-profile-card__image-placeholder">🏨</div>
          )}
        </div>

        <div className="hotel-profile-card__info">
          <div className="hotel-profile-card__top">
            <div>
              {hotel.type && <p className="eyebrow">{hotel.type}</p>}
              <h2 className="hotel-profile-card__name">{hotel.name}</h2>
              {hotel.starRating && <StarRating count={hotel.starRating} />}
              {location && <p className="hotel-profile-card__location">{location}</p>}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="button button--primary"
                onClick={() => setEditing(true)}
              >
                Edit Hotel
              </button>
              <Link to={`/hotels/${hotel.id}`} className="button button--secondary" target="_blank" rel="noreferrer">
                Public View
              </Link>
            </div>
          </div>

          {(hotel.overview || hotel.description) && (
            <p className="hotel-profile-card__overview">
              {hotel.overview ?? hotel.description}
            </p>
          )}

          <div className="hotel-profile-card__details">
            {hotel.address && (
              <div className="hotel-profile-card__detail">
                <span>Address</span>
                <strong>{hotel.address}</strong>
              </div>
            )}
            {hotel.phone && (
              <div className="hotel-profile-card__detail">
                <span>Phone</span>
                <strong>{hotel.phone}</strong>
              </div>
            )}
            {hotel.email && (
              <div className="hotel-profile-card__detail">
                <span>Email</span>
                <strong>{hotel.email}</strong>
              </div>
            )}
            {hotel.website && (
              <div className="hotel-profile-card__detail">
                <span>Website</span>
                <strong>
                  <a href={hotel.website} target="_blank" rel="noreferrer" className="dash-table__link">
                    {hotel.website}
                  </a>
                </strong>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dash-shortcuts">
        <p className="eyebrow">Quick Actions</p>
        <div className="dash-shortcuts__grid">
          <Link to="/manager/rooms" className="dash-shortcut-card">
            <span className="dash-shortcut-card__icon">🛏️</span>
            <span>Manage Rooms</span>
          </Link>
          <Link to="/manager/bookings" className="dash-shortcut-card">
            <span className="dash-shortcut-card__icon">📋</span>
            <span>View Bookings</span>
          </Link>
          <Link to="/manager/availability" className="dash-shortcut-card">
            <span className="dash-shortcut-card__icon">📅</span>
            <span>Availability</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
