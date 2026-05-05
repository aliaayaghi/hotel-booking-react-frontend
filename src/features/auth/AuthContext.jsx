import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loadCurrentUser as loadCurrentUserRequest,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "./auth.api.js";
import { clearStoredAuthToken, getStoredAuthToken } from "./auth.store.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(
    Boolean(getStoredAuthToken()),
  );
  const [authError, setAuthError] = useState(null);

  const loadCurrentUser = useCallback(async () => {
    if (!getStoredAuthToken()) {
      setUser(null);
      setIsLoadingUser(false);
      return null;
    }

    setIsLoadingUser(true);
    setAuthError(null);

    try {
      const currentUser = await loadCurrentUserRequest();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      clearStoredAuthToken();
      setUser(null);
      setAuthError(error);
      throw error;
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setAuthError(null);
    const authData = await loginRequest(credentials);
    await loadCurrentUser();
    return authData;
  }, [loadCurrentUser]);

  const register = useCallback(async (registrationData) => {
    setAuthError(null);
    const authData = await registerRequest(registrationData);
    await loadCurrentUser();
    return authData;
  }, [loadCurrentUser]);

  const logout = useCallback(async () => {
    setAuthError(null);
    await logoutRequest();
    setUser(null);
  }, []);

  useEffect(() => {
    loadCurrentUser().catch(() => {
      // Auth restoration failure is exposed through authError.
    });
  }, [loadCurrentUser]);

  const value = useMemo(
    () => ({
      authError,
      isAuthenticated: Boolean(user),
      isLoadingUser,
      loadCurrentUser,
      login,
      logout,
      register,
      user,
    }),
    [
      authError,
      isLoadingUser,
      loadCurrentUser,
      login,
      logout,
      register,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
