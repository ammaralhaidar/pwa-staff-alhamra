import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

// Shared with session cleanup so logout can clear private query data immediately.
// eslint-disable-next-line react-refresh/only-export-components
export const appQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={appQueryClient}>
      <BrowserRouter>{children}</BrowserRouter>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
