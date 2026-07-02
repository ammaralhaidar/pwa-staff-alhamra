import { Suspense } from "react";

import { AppRoutes } from "@/app/routes/app-routes";
import { PageLoadingState } from "@/components/feedback/page-loading-state";

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoadingState label="Memuat halaman..." />}>
      <AppRoutes />
    </Suspense>
  );
}
