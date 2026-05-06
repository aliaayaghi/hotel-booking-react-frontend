import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { queryClient } from "../api/queryClient.js";
import { AuthProvider } from "../features/auth/AuthContext.jsx";

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1f2937",
              color: "#ffffff",
              border: "1px solid rgba(201, 162, 39, 0.36)",
              borderRadius: "8px",
              fontWeight: "700",
            },
            classNames: {
              success: "toast--success",
              error: "toast--error",
            },
          }}
          richColors
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
