import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import {
  getAdminHotels,
  approveHotel,
  rejectHotel,
  deleteAdminHotel,
} from "../../features/admin/admin.api.js";

function useAdminHotels(status) {
  const params = status !== "ALL" ? { status } : {};
  return useQuery({
    queryKey: ["admin", "hotels", status],
    queryFn: () => getAdminHotels(params),
  });
}

function getHotelList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

const STATUS_FILTERS = ["ALL", "PENDING", "ACTIVE", "REJECTED", "SUSPENDED"];

function RejectModal({ hotel, onClose }) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const { mutate: reject, isPending } = useMutation({
    mutationFn: () => rejectHotel(hotel.id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "hotels"] });
      toast.success(`${hotel.name} rejected`);
      onClose();
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Could not reject hotel."),
  });

  return (
    <div className="bmodal-overlay" role="dialog" aria-modal="true">
      <button type="button" className="bmodal-overlay__backdrop" onClick={onClose} aria-label="Close" tabIndex={-1} />
      <div className="bmodal">
        <div className="bmodal__header">
          <div>
            <p className="eyebrow">Admin</p>
            <h2 className="bmodal__title">Reject Hotel</h2>
          </div>
          <button type="button" className="bmodal__close" onClick={onClose}>✕</button>
        </div>
        <div className="bmodal__body">
          <p style={{ marginBottom: 12 }}>Rejecting: <strong>{hotel.name}</strong></p>
          <div className="auth-field">
            <label className="auth-field__label">Reason (optional)</label>
            <textarea
              className="auth-field__input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Explain why this hotel is being rejected…"
              disabled={isPending}
            />
          </div>
        </div>
        <div className="bmodal__footer">
          <button type="button" className="button button--secondary" onClick={onClose} disabled={isPending}>Cancel</button>
          <button type="button" className="button button--danger" onClick={() => reject()} disabled={isPending}>
            {isPending ? "Rejecting…" : "Reject hotel"}
          </button>
        </div>
      </div>
    </div>
  );
}

function HotelActions({ hotel }) {
  const queryClient = useQueryClient();
  const [rejectModal, setRejectModal] = useState(false);

  const { mutate: approve, isPending: approving } = useMutation({
    mutationFn: () => approveHotel(hotel.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "hotels"] });
      toast.success(`${hotel.name} approved`);
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Could not approve hotel."),
  });

  const { mutate: del, isPending: deleting } = useMutation({
    mutationFn: () => deleteAdminHotel(hotel.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "hotels"] });
      toast.success(`${hotel.name} deleted`);
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Could not delete hotel."),
  });

  const busy = approving || deleting;

  return (
    <>
      <div className="dash-table__actions">
        {hotel.status === "PENDING" && (
          <>
            <button className="dash-action-btn dash-action-btn--confirm" onClick={() => approve()} disabled={busy}>
              Approve
            </button>
            <button className="dash-action-btn dash-action-btn--cancel" onClick={() => setRejectModal(true)} disabled={busy}>
              Reject
            </button>
          </>
        )}
        <button
          className="dash-action-btn dash-action-btn--cancel"
          onClick={() => {
            if (window.confirm(`Delete "${hotel.name}"? This cannot be undone.`)) del();
          }}
          disabled={busy}
        >
          Delete
        </button>
      </div>
      {rejectModal && <RejectModal hotel={hotel} onClose={() => setRejectModal(false)} />}
    </>
  );
}

export default function AdminHotelsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useAdminHotels(statusFilter);

  if (isLoading) return <LoadingState message="Loading hotels…" />;
  if (isError) return <ErrorState message="Could not load hotels." onRetry={refetch} />;

  const allHotels = getHotelList(data);
  const hotels = search.trim()
    ? allHotels.filter((h) => {
        const q = search.toLowerCase();
        return (
          h.name?.toLowerCase().includes(q) ||
          h.city?.toLowerCase().includes(q) ||
          h.countryCode?.toLowerCase().includes(q)
        );
      })
    : allHotels;

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <p className="eyebrow">Admin</p>
        <h1>Manage Hotels</h1>
      </div>

      <div className="dash-filters">
        <div className="dash-filter-group">
          <label className="dash-filter-label">Status</label>
          <div className="dash-filter-tabs">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                className={`dash-filter-tab${statusFilter === s ? " dash-filter-tab--active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="dash-search">
          <input
            type="search"
            className="auth-field__input"
            placeholder="Search by name or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <p className="dash-results-count">{hotels.length} hotel{hotels.length !== 1 ? "s" : ""}</p>

      {hotels.length === 0 ? (
        <div className="feedback-state">
          <p className="eyebrow">No results</p>
          <h2>No hotels found</h2>
          <p>{search ? "Try a different search term." : "No hotels match the selected filter."}</p>
        </div>
      ) : (
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Country</th>
                <th>Type</th>
                <th>Stars</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((h) => (
                <tr key={h.id}>
                  <td><strong>{h.name}</strong></td>
                  <td>{h.city ?? "—"}</td>
                  <td>{h.countryCode ?? "—"}</td>
                  <td>{h.type ?? "—"}</td>
                  <td>{h.starRating ? `${h.starRating} ★` : "—"}</td>
                  <td><StatusBadge status={h.status} type="hotel" /></td>
                  <td><HotelActions hotel={h} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
