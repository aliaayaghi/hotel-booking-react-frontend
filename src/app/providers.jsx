import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "../api/queryClient.js";
import { AuthProvider } from "../features/auth/AuthContext.jsx";

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
