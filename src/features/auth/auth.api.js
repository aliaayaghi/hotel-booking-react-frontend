import { axiosClient } from "../../api/axiosClient.js";

import { clearStoredAuthToken, storeAuthToken } from "./auth.store.js";

function getTokenFromAuthResponse(data) {
  if (typeof data === "string") {
    return data;
  }

  return data?.token ?? null;
}

function persistTokenFromResponse(data) {
  const token = getTokenFromAuthResponse(data);

  if (token) {
    storeAuthToken(token);
  }

  return data;
}

export async function login(credentials) {
  const { data } = await axiosClient.post("/api/auth/login", credentials);

  return persistTokenFromResponse(data);
}

export async function register(registrationData) {
  const { data } = await axiosClient.post(
    "/api/auth/register",
    registrationData,
  );

  return persistTokenFromResponse(data);
}

export async function logout() {
  try {
    await axiosClient.post("/api/auth/logout");
  } finally {
    clearStoredAuthToken();
  }
}

export async function loadCurrentUser() {
  const { data } = await axiosClient.get("/api/auth/me");

  return data;
}
