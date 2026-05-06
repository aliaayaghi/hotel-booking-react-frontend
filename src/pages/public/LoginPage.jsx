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

export default function LoginPage() {
  const { login, isAuthenticated, isLoadingUser, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isLoadingUser && isAuthenticated && user) {
    return <Navigate to={getRoleRedirect(user)} replace />;
  }

  function validate() {
    const errs = {};
    if (!email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = "Enter a valid email address";
    }
    if (!password) {
      errs.password = "Password is required";
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
    try {
      await login({ email: email.trim(), password });
      toast.success("Welcome back!");
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Login failed. Please check your credentials.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="public-page public-page--narrow auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to your account</h1>
          <p className="auth-card__subtitle">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="auth-card__link">
              Create one
            </Link>
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="login-email" className="auth-field__label">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`auth-field__input${fieldErrors.email ? " auth-field__input--error" : ""}`}
              disabled={isSubmitting}
            />
            {fieldErrors.email && (
              <p className="auth-field__error">{fieldErrors.email}</p>
            )}
          </div>

          <div className="auth-field">
            <div className="auth-field__label-row">
              <label htmlFor="login-password" className="auth-field__label">
                Password
              </label>
            </div>
            <div className="auth-field__input-wrap">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
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

          <button
            type="submit"
            className="button button--primary auth-form__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
