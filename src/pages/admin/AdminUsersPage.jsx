import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import StatusBadge from "../../components/dashboard/StatusBadge.jsx";
import ErrorState from "../../components/feedback/ErrorState.jsx";
import LoadingState from "../../components/feedback/LoadingState.jsx";
import { getAdminUsers, suspendUser, unsuspendUser } from "../../features/admin/admin.api.js";

function useAdminUsers() {
  return useQuery({ queryKey: ["admin", "users"], queryFn: () => getAdminUsers() });
}

function getUserList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

const ROLE_FILTERS = ["ALL", "CUSTOMER", "HOTEL_MANAGER", "ADMIN"];

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function SuspendModal({ user, onClose }) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const { mutate: suspend, isPending } = useMutation({
    mutationFn: () => suspendUser(user.id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(`${user.name} suspended`);
      onClose();
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Could not suspend user."),
  });

  return (
    <div className="bmodal-overlay" role="dialog" aria-modal="true">
      <button type="button" className="bmodal-overlay__backdrop" onClick={onClose} aria-label="Close" tabIndex={-1} />
      <div className="bmodal">
        <div className="bmodal__header">
          <div>
            <p className="eyebrow">Admin</p>
            <h2 className="bmodal__title">Suspend User</h2>
          </div>
          <button type="button" className="bmodal__close" onClick={onClose}>✕</button>
        </div>
        <div className="bmodal__body">
          <p style={{ marginBottom: 12 }}>Suspending: <strong>{user.name}</strong> ({user.email})</p>
          <div className="auth-field">
            <label className="auth-field__label">Reason (optional)</label>
            <textarea
              className="auth-field__input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Explain why this user is being suspended…"
              disabled={isPending}
            />
          </div>
        </div>
        <div className="bmodal__footer">
          <button type="button" className="button button--secondary" onClick={onClose} disabled={isPending}>Cancel</button>
          <button type="button" className="button button--danger" onClick={() => suspend()} disabled={isPending}>
            {isPending ? "Suspending…" : "Suspend user"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserActions({ user }) {
  const queryClient = useQueryClient();
  const [suspendModal, setSuspendModal] = useState(false);

  const { mutate: unsuspend, isPending } = useMutation({
    mutationFn: () => unsuspendUser(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(`${user.name} unsuspended`);
    },
    onError: (err) => toast.error(err?.response?.data?.message ?? "Could not unsuspend user."),
  });

  const isSuspended = user.active === false;

  return (
    <>
      <div className="dash-table__actions">
        {isSuspended ? (
          <button className="dash-action-btn dash-action-btn--confirm" onClick={() => unsuspend()} disabled={isPending}>
            {isPending ? "Unsuspending…" : "Unsuspend"}
          </button>
        ) : (
          <button className="dash-action-btn dash-action-btn--cancel" onClick={() => setSuspendModal(true)} disabled={isPending}>
            Suspend
          </button>
        )}
      </div>
      {suspendModal && <SuspendModal user={user} onClose={() => setSuspendModal(false)} />}
    </>
  );
}

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useAdminUsers();

  if (isLoading) return <LoadingState message="Loading users…" />;
  if (isError) return <ErrorState message="Could not load users." onRetry={refetch} />;

  const allUsers = getUserList(data);
  let users = roleFilter !== "ALL"
    ? allUsers.filter((u) => u.role === roleFilter)
    : allUsers;

  if (search.trim()) {
    const q = search.toLowerCase();
    users = users.filter(
      (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
    );
  }

  function roleLabel(role) {
    if (role === "HOTEL_MANAGER") return "Manager";
    if (role === "ADMIN") return "Admin";
    return "Customer";
  }

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <p className="eyebrow">Admin</p>
        <h1>Manage Users</h1>
      </div>

      <div className="dash-filters">
        <div className="dash-filter-group">
          <label className="dash-filter-label">Role</label>
          <div className="dash-filter-tabs">
            {ROLE_FILTERS.map((r) => (
              <button
                key={r}
                className={`dash-filter-tab${roleFilter === r ? " dash-filter-tab--active" : ""}`}
                onClick={() => setRoleFilter(r)}
              >
                {r === "ALL" ? "All" : roleLabel(r)}
              </button>
            ))}
          </div>
        </div>
        <div className="dash-search">
          <input
            type="search"
            className="auth-field__input"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <p className="dash-results-count">{users.length} user{users.length !== 1 ? "s" : ""}</p>

      {users.length === 0 ? (
        <div className="feedback-state">
          <p className="eyebrow">No results</p>
          <h2>No users found</h2>
          <p>{search ? "Try a different search term." : "No users match the selected filter."}</p>
        </div>
      ) : (
        <div className="dash-table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.name ?? "—"}</strong></td>
                  <td>{u.email ?? "—"}</td>
                  <td><StatusBadge status={u.role} type="role" /></td>
                  <td>
                    {u.active === false
                      ? <span className="booking-badge" style={{ background: "#fee2e2", color: "#991b1b" }}>Suspended</span>
                      : <span className="booking-badge" style={{ background: "#d1fae5", color: "#065f46" }}>Active</span>
                    }
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td><UserActions user={u} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
