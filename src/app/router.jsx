import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import ProtectedRoute from "../components/layout/ProtectedRoute.jsx";
import PublicLayout from "../components/layout/PublicLayout.jsx";
import RoleRoute from "../components/layout/RoleRoute.jsx";
import AboutPage from "../pages/public/AboutPage.jsx";
import HelpPage from "../pages/public/HelpPage.jsx";
import HotelDetailsPage from "../pages/public/HotelDetailsPage.jsx";
import HomePage from "../pages/public/HomePage.jsx";
import LoginPage from "../pages/public/LoginPage.jsx";
import NotFoundPage from "../pages/public/NotFoundPage.jsx";
import RegisterPage from "../pages/public/RegisterPage.jsx";
import SearchResultsPage from "../pages/public/SearchResultsPage.jsx";
import ProfilePage from "../pages/profile/ProfilePage.jsx";

// Customer pages
import MyBookingsPage from "../pages/customer/MyBookingsPage.jsx";
import SavedHotelsPage from "../pages/customer/SavedHotelsPage.jsx";
import AccountSettingsPage from "../pages/customer/AccountSettingsPage.jsx";
import PaymentMethodsPage from "../pages/customer/PaymentMethodsPage.jsx";

// Manager pages
import ManagerDashboardPage from "../pages/manager/ManagerDashboardPage.jsx";
import ManagerHotelPage from "../pages/manager/ManagerHotelPage.jsx";
import ManagerBookingsPage from "../pages/manager/ManagerBookingsPage.jsx";
import ManagerRoomsPage from "../pages/manager/ManagerRoomsPage.jsx";
import ManagerAvailabilityPage from "../pages/manager/ManagerAvailabilityPage.jsx";

// Admin pages
import AdminDashboardPage from "../pages/admin/AdminDashboardPage.jsx";
import AdminHotelsPage from "../pages/admin/AdminHotelsPage.jsx";
import AdminUsersPage from "../pages/admin/AdminUsersPage.jsx";
import AdminBookingsPage from "../pages/admin/AdminBookingsPage.jsx";
import AdminReportsPage from "../pages/admin/AdminReportsPage.jsx";

import { USER_ROLES } from "../utils/roleUtils.js";

export const router = createBrowserRouter([
  /* ── Public layout (navbar visible) ── */
  {
    path: "/",
    element: <PublicLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "search", element: <SearchResultsPage /> },
      { path: "hotels/:hotelId", element: <HotelDetailsPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      /* Customer-only pages */
      {
        path: "my-bookings",
        element: (
          <RoleRoute allowedRole={USER_ROLES.CUSTOMER}>
            <MyBookingsPage />
          </RoleRoute>
        ),
      },
      {
        path: "saved-hotels",
        element: (
          <RoleRoute allowedRole={USER_ROLES.CUSTOMER}>
            <SavedHotelsPage />
          </RoleRoute>
        ),
      },
      {
        path: "account/settings",
        element: (
          <RoleRoute allowedRole={USER_ROLES.CUSTOMER}>
            <AccountSettingsPage />
          </RoleRoute>
        ),
      },
      {
        path: "payment-methods",
        element: (
          <RoleRoute allowedRole={USER_ROLES.CUSTOMER}>
            <PaymentMethodsPage />
          </RoleRoute>
        ),
      },
      { path: "help", element: <HelpPage /> },

    ],
  },

  /* ── Manager dashboard layout ── */
  {
    element: (
      <RoleRoute allowedRole={USER_ROLES.HOTEL_MANAGER}>
        <DashboardLayout />
      </RoleRoute>
    ),
    children: [
      { path: "/manager", element: <Navigate to="/manager/dashboard" replace /> },
      { path: "/manager/dashboard", element: <ManagerDashboardPage /> },
      { path: "/manager/hotel", element: <ManagerHotelPage /> },
      { path: "/manager/bookings", element: <ManagerBookingsPage /> },
      { path: "/manager/rooms", element: <ManagerRoomsPage /> },
      { path: "/manager/availability", element: <ManagerAvailabilityPage /> },
      { path: "/manager/account", element: <ProfilePage /> },
    ],
  },

  /* ── Admin dashboard layout ── */
  {
    element: (
      <RoleRoute allowedRole={USER_ROLES.ADMIN}>
        <DashboardLayout />
      </RoleRoute>
    ),
    children: [
      { path: "/admin", element: <Navigate to="/admin/dashboard" replace /> },
      { path: "/admin/dashboard", element: <AdminDashboardPage /> },
      { path: "/admin/hotels", element: <AdminHotelsPage /> },
      { path: "/admin/users", element: <AdminUsersPage /> },
      { path: "/admin/bookings", element: <AdminBookingsPage /> },
      { path: "/admin/reports", element: <AdminReportsPage /> },
      { path: "/admin/account", element: <ProfilePage /> },
    ],
  },

  { path: "*", element: <NotFoundPage /> },
]);
