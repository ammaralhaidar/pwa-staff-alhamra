import { Suspense, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import { AppRoutes } from "@/app/routes/app-routes";
import { AppErrorBoundary } from "@/components/feedback/app-error-boundary";
import { PageLoadingState } from "@/components/feedback/page-loading-state";
import { persistLastActiveRoleRoute } from "@/lib/storage";

export function AppRouter() {
  const location = useLocation();
  const seenRoleSwitchId = useRef<number | null>(null);
  const [showRoleSwitchSkeleton, setShowRoleSwitchSkeleton] = useState(false);
  const roleSwitchId = (location.state as { roleSwitchId?: number } | null)?.roleSwitchId;

  useEffect(() => {
    if (!roleSwitchId || seenRoleSwitchId.current === roleSwitchId) return;

    seenRoleSwitchId.current = roleSwitchId;
    setShowRoleSwitchSkeleton(true);
    const timeout = window.setTimeout(() => setShowRoleSwitchSkeleton(false), 260);
    return () => window.clearTimeout(timeout);
  }, [roleSwitchId]);

  useEffect(() => {
    persistLastActiveRoleRoute(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <AppErrorBoundary>
        <Suspense fallback={<PageLoadingState label="Memuat halaman..." />}>
          <AppRoutes />
        </Suspense>
      </AppErrorBoundary>
      {showRoleSwitchSkeleton ? <div className="fixed inset-0 z-[100] bg-[#EFF6FF]"><PageLoadingState label="Memuat role..." /></div> : null}
    </>
  );
}
