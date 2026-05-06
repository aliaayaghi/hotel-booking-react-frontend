import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "../../hooks/useAuth.js";
import { getUserRoles } from "../../utils/roleUtils.js";

function getRoleRedirect(user) {
  const roles = getUserRoles(user);
  if (roles.includes("ADMIN")) return "/admin/dashboard";
  if (roles.includes("HOTEL_MANAGER")) return "/manager/dashboard";
  return "/";
}

const ALLOWED_ROLES = [
  { value: "CUSTOMER", label: "Guest — Browse and book hotels" },
  { value: "HOTEL_MANAGER", label: "Hotel Manager — List and manage properties" },
];

export default function RegisterPage() {
  const { register, isAuthenticated, isLoadingUser, user } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CUSTOMER",
    phone: "",
    nationality: "",
    dateOfBirth: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isLoadingUser && isAuthenticated && user) {
    return <Navigate to={getRoleRedirect(user)} replace />;
  }

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    }
    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email address";
    }
    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }
    if (form.confirmPassword !== form.password) {
      errs.confirmPassword = "Passwords do not match";
    }
    if (!form.role) {
      errs.role = "Please select an account type";
    }
    if (form.nationality && form.nationality.length !== 2) {
      errs.nationality = "Use a 2-letter country code (e.g. US, GB)";
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    };
    if (form.phone.trim()) payload.phone = form.phone.trim();
    if (form.nationality.trim()) payload.nationality = form.nationality.trim().toUpperCase();
    if (form.dateOfBirth) payload.dateOfBirth = form.dateOfBirth;

    try {
      await register(payload);
      toast.success("Account created! Welcome aboard.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="public-page public-page--narrow auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <p className="eyebrow">Create account</p>
          <h1>Start your booking journey</h1>
          <p className="auth-card__subtitle">
            Already have an account?{" "}
            <Link to="/login" className="auth-card__link">
              Sign in
            </Link>
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <p className="auth-form__section-label">Account type</p>
          <div className="auth-role-selector">
            {ALLOWED_ROLES.map((r) => (
              <label
                key={r.value}
                className={`auth-role-option${form.role === r.value ? " auth-role-option--selected" : ""}`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={form.role === r.value}
                  onChange={set("role")}
                  disabled={isSubmitting}
                />
                <span className="auth-role-option__label">{r.label}</span>
              </label>
            ))}
          </div>
          {fieldErrors.role && (
            <p className="auth-field__error">{fieldErrors.role}</p>
          )}

          <p className="auth-form__section-label">Your details</p>

          <div className="auth-field">
            <label htmlFor="reg-name" className="auth-field__label">
              Full name <span className="auth-field__required">*</span>
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={set("name")}
              placeholder="Jane Smith"
              className={`auth-field__input${fieldErrors.name ? " auth-field__input--error" : ""}`}
              disabled={isSubmitting}
            />
            {fieldErrors.name && (
              <p className="auth-field__error">{fieldErrors.name}</p>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="reg-email" className="auth-field__label">
              Email address <span className="auth-field__required">*</span>
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              className={`auth-field__input${fieldErrors.email ? " auth-field__input--error" : ""}`}
              disabled={isSubmitting}
            />
            {fieldErrors.email && (
              <p className="auth-field__error">{fieldErrors.email}</p>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="reg-password" className="auth-field__label">
              Password <span className="auth-field__required">*</span>
            </label>
            <div className="auth-field__input-wrap">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={form.password}
                onChange={set("password")}
                placeholder="At least 8 characters"
                className={`auth-field__input${fieldErrors.password ? " auth-field__input--error" : ""}`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="auth-field__toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="auth-field__error">{fieldErrors.password}</p>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="reg-confirm" className="auth-field__label">
              Confirm password <span className="auth-field__required">*</span>
            </label>
            <input
              id="reg-confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="Repeat your password"
              className={`auth-field__input${fieldErrors.confirmPassword ? " auth-field__input--error" : ""}`}
              disabled={isSubmitting}
            />
            {fieldErrors.confirmPassword && (
              <p className="auth-field__error">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <p className="auth-form__section-label auth-form__section-label--optional">
            Optional details
          </p>

          <div className="auth-form__row">
            <div className="auth-field">
              <label htmlFor="reg-phone" className="auth-field__label">
                Phone number
              </label>
              <input
                id="reg-phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+1 555 000 0000"
                className="auth-field__input"
                disabled={isSubmitting}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-nationality" className="auth-field__label">
                Nationality
              </label>
              <input
                id="reg-nationality"
                type="text"
                value={form.nationality}
                onChange={set("nationality")}
                placeholder="US"
                maxLength={2}
                className={`auth-field__input${fieldErrors.nationality ? " auth-field__input--error" : ""}`}
                disabled={isSubmitting}
              />
              {fieldErrors.nationality && (
                <p className="auth-field__error">{fieldErrors.nationality}</p>
              )}
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="reg-dob" className="auth-field__label">
              Date of birth
            </label>
            <input
              id="reg-dob"
              type="date"
              autoComplete="bday"
              value={form.dateOfBirth}
              onChange={set("dateOfBirth")}
              max={new Date().toISOString().split("T")[0]}
              className="auth-field__input"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="button button--primary auth-form__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>

          <p className="auth-form__fine-print">
            By creating an account you agree to our terms and privacy policy.
          </p>
        </form>
      </div>
    </main>
  );
}
