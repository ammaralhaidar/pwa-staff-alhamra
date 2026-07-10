import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { RoleKey } from "@/features/roles/domain/role";
import { hasStoredAuthSession, resolveStoredRoleFlags } from "@/lib/storage";

type ProtectedRouteProps = { allowedRoles?: RoleKey[]; children?: ReactNode };

/** UI guard only. Backend remains the source of truth for authorization. */
export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const location = useLocation();
  if (!hasStoredAuthSession()) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  const flags = resolveStoredRoleFlags();
  if (allowedRoles?.length && !allowedRoles.some((role) => flags?.[role])) {
    return <Navigate to="/roles" replace />;
  }

  return children ?? <Outlet />;
}
