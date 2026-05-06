import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { changePassword, updateProfile } from "../../features/auth/auth.api.js";
import { useAuth } from "../../hooks/useAuth.js";

function SectionCard({ eyebrow, title, children }) {
  return (
    <div className="settings-card">
      <div className="settings-card__header">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ProfileSection({ user, loadCurrentUser }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    nationality: "",
    dateOfBirth: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        phone: user.phone ?? "",
        nationality: user.nationality ?? "",
        dateOfBirth: user.dateOfBirth ?? "",
      });
    }
  }, [user]);

  function field(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    }
    if (form.nationality && form.nationality.trim().length !== 2) {
      errs.nationality = "Use a 2-letter country code (e.g. US, GB)";
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);
    const payload = { name: form.name.trim() };
    if (form.phone.trim()) payload.phone = form.phone.trim();
    if (form.nationality.trim()) payload.nationality = form.nationality.trim().toUpperCase();
    if (form.dateOfBirth) payload.dateOfBirth = form.dateOfBirth;
    try {
      await updateProfile(payload);
      await loadCurrentUser();
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  const initials = (user?.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <SectionCard eyebrow="Profile" title="Personal Information">
      <div className="settings-avatar-row">
        <div className="settings-avatar">{initials}</div>
        <div>
          <p className="settings-avatar__name">{user?.name}</p>
          <p className="settings-avatar__email">{user?.email}</p>
        </div>
      </div>
      <form className="settings-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="as-name" className="auth-field__label">
            Full name <span className="auth-field__required">*</span>
          </label>
          <input
            id="as-name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={field("name")}
            className={`auth-field__input${errors.name ? " auth-field__input--error" : ""}`}
            disabled={saving}
          />
          {errors.name && <p className="auth-field__error">{errors.name}</p>}
        </div>
        <div className="auth-field">
          <label htmlFor="as-email" className="auth-field__label">
            Email address
          </label>
          <input
            id="as-email"
            type="email"
            value={user?.email ?? ""}
            readOnly
            className="auth-field__input auth-field__input--readonly"
            title="Email cannot be changed"
          />
          <p className="auth-field__hint">Email changes are not supported yet.</p>
        </div>
        <div className="auth-form__row">
          <div className="auth-field">
            <label htmlFor="as-phone" className="auth-field__label">
              Phone number
            </label>
            <input
              id="as-phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={field("phone")}
              placeholder="+1 555 000 0000"
              className="auth-field__input"
              disabled={saving}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="as-nationality" className="auth-field__label">
              Nationality
            </label>
            <input
              id="as-nationality"
              type="text"
              value={form.nationality}
              onChange={field("nationality")}
              placeholder="US"
              maxLength={2}
              className={`auth-field__input${errors.nationality ? " auth-field__input--error" : ""}`}
              disabled={saving}
            />
            {errors.nationality && (
              <p className="auth-field__error">{errors.nationality}</p>
            )}
          </div>
        </div>
        <div className="auth-field">
          <label htmlFor="as-dob" className="auth-field__label">
            Date of birth
          </label>
          <input
            id="as-dob"
            type="date"
            autoComplete="bday"
            value={form.dateOfBirth}
            onChange={field("dateOfBirth")}
            max={new Date().toISOString().split("T")[0]}
            className="auth-field__input"
            disabled={saving}
          />
        </div>
        <div className="auth-form__actions">
          <button type="submit" className="button button--primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

function SecuritySection() {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function field(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function validate() {
    const errs = {};
    if (!form.oldPassword) errs.oldPassword = "Current password is required";
    if (!form.newPassword) errs.newPassword = "New password is required";
    else if (form.newPassword.length < 8) errs.newPassword = "At least 8 characters";
    if (form.confirmPassword !== form.newPassword)
      errs.confirmPassword = "Passwords do not match";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await changePassword({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Could not change password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard eyebrow="Security" title="Change Password">
      <form className="settings-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="as-pw-current" className="auth-field__label">
            Current password <span className="auth-field__required">*</span>
          </label>
          <div className="auth-field__input-wrap">
            <input
              id="as-pw-current"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={form.oldPassword}
              onChange={field("oldPassword")}
              className={`auth-field__input${errors.oldPassword ? " auth-field__input--error" : ""}`}
              disabled={saving}
            />
            <button
              type="button"
              className="auth-field__toggle"
              onClick={() => setShow((v) => !v)}
              tabIndex={-1}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
          {errors.oldPassword && <p className="auth-field__error">{errors.oldPassword}</p>}
        </div>
        <div className="auth-form__row">
          <div className="auth-field">
            <label htmlFor="as-pw-new" className="auth-field__label">
              New password <span className="auth-field__required">*</span>
            </label>
            <input
              id="as-pw-new"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={form.newPassword}
              onChange={field("newPassword")}
              placeholder="At least 8 characters"
              className={`auth-field__input${errors.newPassword ? " auth-field__input--error" : ""}`}
              disabled={saving}
            />
            {errors.newPassword && <p className="auth-field__error">{errors.newPassword}</p>}
          </div>
          <div className="auth-field">
            <label htmlFor="as-pw-confirm" className="auth-field__label">
              Confirm new password <span className="auth-field__required">*</span>
            </label>
            <input
              id="as-pw-confirm"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={field("confirmPassword")}
              placeholder="Repeat new password"
              className={`auth-field__input${errors.confirmPassword ? " auth-field__input--error" : ""}`}
              disabled={saving}
            />
            {errors.confirmPassword && (
              <p className="auth-field__error">{errors.confirmPassword}</p>
            )}
          </div>
        </div>
        <div className="auth-form__actions">
          <button type="submit" className="button button--primary" disabled={saving}>
            {saving ? "Changing…" : "Change password"}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

function PreferencesSection() {
  return (
    <SectionCard eyebrow="Preferences" title="Notifications & Language">
      <div className="settings-form settings-preferences">
        <div className="settings-preference-row">
          <div>
            <strong>Email notifications</strong>
            <p>Receive emails about your bookings and offers.</p>
          </div>
          {/* TODO: Backend support for notification preferences is not yet available */}
          <label className="settings-toggle" aria-label="Email notifications toggle">
            <input type="checkbox" defaultChecked disabled />
            <span className="settings-toggle__track" />
          </label>
        </div>
        <div className="settings-preference-row">
          <div>
            <strong>Booking reminders</strong>
            <p>Get reminded before your check-in date.</p>
          </div>
          {/* TODO: Backend support for booking reminders is not yet available */}
          <label className="settings-toggle" aria-label="Booking reminders toggle">
            <input type="checkbox" defaultChecked disabled />
            <span className="settings-toggle__track" />
          </label>
        </div>
        <p className="settings-hint">
          Notification preferences are not yet connected to the backend.
        </p>
      </div>
    </SectionCard>
  );
}

export default function AccountSettingsPage() {
  const { user, loadCurrentUser, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      toast.success("You've been signed out");
    } catch {
      toast.error("Sign out failed.");
    }
  }

  return (
    <main className="public-page public-page--narrow account-settings-page">
      <div className="account-settings-page__header">
        <p className="eyebrow">My account</p>
        <h1>Account Settings</h1>
      </div>

      <ProfileSection user={user} loadCurrentUser={loadCurrentUser} />
      <SecuritySection />
      <PreferencesSection />

      <div className="settings-card settings-card--danger">
        <div className="settings-card__header">
          <p className="eyebrow">Account actions</p>
          <h2>Danger Zone</h2>
        </div>
        <div className="settings-danger-actions">
          <button
            type="button"
            className="button button--secondary"
            onClick={handleLogout}
          >
            Logout
          </button>
          {/* TODO: Delete account — backend endpoint not yet available */}
          <button
            type="button"
            className="button button--danger"
            disabled
            title="Account deletion is not supported yet"
          >
            Delete account
          </button>
        </div>
        <p className="settings-hint">
          Account deletion is not yet supported by the backend.
        </p>
      </div>
    </main>
  );
}
