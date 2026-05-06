import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { changePassword, updateProfile } from "../../features/auth/auth.api.js";
import { useAuth } from "../../hooks/useAuth.js";

export default function ProfilePage() {
  const { user, loadCurrentUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    nationality: "",
    dateOfBirth: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name ?? "",
        phone: user.phone ?? "",
        nationality: user.nationality ?? "",
        dateOfBirth: user.dateOfBirth ?? "",
      });
    }
  }, [user]);

  function setProfile(field) {
    return (e) =>
      setProfileForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function setPasswordField(field) {
    return (e) =>
      setPasswordForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function validateProfile() {
    const errs = {};
    if (!profileForm.name.trim() || profileForm.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    }
    if (profileForm.nationality && profileForm.nationality.trim().length !== 2) {
      errs.nationality = "Use a 2-letter country code (e.g. US, GB)";
    }
    return errs;
  }

  function validatePassword() {
    const errs = {};
    if (!passwordForm.oldPassword) errs.oldPassword = "Current password is required";
    if (!passwordForm.newPassword) {
      errs.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      errs.newPassword = "Password must be at least 8 characters";
    }
    if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length) {
      setProfileErrors(errs);
      return;
    }
    setProfileErrors({});
    setIsSavingProfile(true);

    const payload = { name: profileForm.name.trim() };
    if (profileForm.phone.trim()) payload.phone = profileForm.phone.trim();
    if (profileForm.nationality.trim())
      payload.nationality = profileForm.nationality.trim().toUpperCase();
    if (profileForm.dateOfBirth) payload.dateOfBirth = profileForm.dateOfBirth;

    try {
      await updateProfile(payload);
      await loadCurrentUser();
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ?? "Could not update profile. Please try again."
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length) {
      setPasswordErrors(errs);
      return;
    }
    setPasswordErrors({});
    setIsSavingPassword(true);

    try {
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ?? "Could not change password. Please try again."
      );
    } finally {
      setIsSavingPassword(false);
    }
  }

  const userInitials = (user?.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <main className="public-page public-page--narrow profile-page">
      <div className="profile-header">
        <div className="profile-avatar">{userInitials}</div>
        <div className="profile-header__info">
          <p className="eyebrow">My account</p>
          <h1>{user?.name ?? "Your profile"}</h1>
          <p className="profile-header__email">{user?.email}</p>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-card__header">
          <p className="eyebrow">Personal details</p>
          <h2>Update your profile</h2>
        </div>

        <form className="auth-form" onSubmit={handleProfileSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="profile-name" className="auth-field__label">
              Full name <span className="auth-field__required">*</span>
            </label>
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              value={profileForm.name}
              onChange={setProfile("name")}
              placeholder="Your full name"
              className={`auth-field__input${profileErrors.name ? " auth-field__input--error" : ""}`}
              disabled={isSavingProfile}
            />
            {profileErrors.name && (
              <p className="auth-field__error">{profileErrors.name}</p>
            )}
          </div>

          <div className="auth-form__row">
            <div className="auth-field">
              <label htmlFor="profile-phone" className="auth-field__label">
                Phone number
              </label>
              <input
                id="profile-phone"
                type="tel"
                autoComplete="tel"
                value={profileForm.phone}
                onChange={setProfile("phone")}
                placeholder="+1 555 000 0000"
                className="auth-field__input"
                disabled={isSavingProfile}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="profile-nationality" className="auth-field__label">
                Nationality
              </label>
              <input
                id="profile-nationality"
                type="text"
                value={profileForm.nationality}
                onChange={setProfile("nationality")}
                placeholder="US"
                maxLength={2}
                className={`auth-field__input${profileErrors.nationality ? " auth-field__input--error" : ""}`}
                disabled={isSavingProfile}
              />
              {profileErrors.nationality && (
                <p className="auth-field__error">{profileErrors.nationality}</p>
              )}
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="profile-dob" className="auth-field__label">
              Date of birth
            </label>
            <input
              id="profile-dob"
              type="date"
              autoComplete="bday"
              value={profileForm.dateOfBirth}
              onChange={setProfile("dateOfBirth")}
              max={new Date().toISOString().split("T")[0]}
              className="auth-field__input"
              disabled={isSavingProfile}
            />
          </div>

          <div className="auth-form__actions">
            <button
              type="submit"
              className="button button--primary"
              disabled={isSavingProfile}
            >
              {isSavingProfile ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      </div>

      <div className="auth-card">
        <div className="auth-card__header">
          <p className="eyebrow">Security</p>
          <h2>Change password</h2>
        </div>

        <form className="auth-form" onSubmit={handlePasswordSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="pw-current" className="auth-field__label">
              Current password <span className="auth-field__required">*</span>
            </label>
            <div className="auth-field__input-wrap">
              <input
                id="pw-current"
                type={showPasswords ? "text" : "password"}
                autoComplete="current-password"
                value={passwordForm.oldPassword}
                onChange={setPasswordField("oldPassword")}
                placeholder="Your current password"
                className={`auth-field__input${passwordErrors.oldPassword ? " auth-field__input--error" : ""}`}
                disabled={isSavingPassword}
              />
              <button
                type="button"
                className="auth-field__toggle"
                onClick={() => setShowPasswords((v) => !v)}
                aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
                tabIndex={-1}
              >
                {showPasswords ? "Hide" : "Show"}
              </button>
            </div>
            {passwordErrors.oldPassword && (
              <p className="auth-field__error">{passwordErrors.oldPassword}</p>
            )}
          </div>

          <div className="auth-form__row">
            <div className="auth-field">
              <label htmlFor="pw-new" className="auth-field__label">
                New password <span className="auth-field__required">*</span>
              </label>
              <input
                id="pw-new"
                type={showPasswords ? "text" : "password"}
                autoComplete="new-password"
                value={passwordForm.newPassword}
                onChange={setPasswordField("newPassword")}
                placeholder="At least 8 characters"
                className={`auth-field__input${passwordErrors.newPassword ? " auth-field__input--error" : ""}`}
                disabled={isSavingPassword}
              />
              {passwordErrors.newPassword && (
                <p className="auth-field__error">{passwordErrors.newPassword}</p>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="pw-confirm" className="auth-field__label">
                Confirm new password <span className="auth-field__required">*</span>
              </label>
              <input
                id="pw-confirm"
                type={showPasswords ? "text" : "password"}
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={setPasswordField("confirmPassword")}
                placeholder="Repeat new password"
                className={`auth-field__input${passwordErrors.confirmPassword ? " auth-field__input--error" : ""}`}
                disabled={isSavingPassword}
              />
              {passwordErrors.confirmPassword && (
                <p className="auth-field__error">{passwordErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="auth-form__actions">
            <button
              type="submit"
              className="button button--primary"
              disabled={isSavingPassword}
            >
              {isSavingPassword ? "Changing…" : "Change password"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
