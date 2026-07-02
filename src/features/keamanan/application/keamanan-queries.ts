import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkinSecurity,
  checkoutSecurity,
  fetchKeamananDashboard,
  fetchKeamananDetail,
  scanSecurityStudent,
  searchSecurityManual,
  updateSecurityStatus,
} from "../api/keamanan-api";
import { addLocalPermissionState, removeLocalPermissionState } from "./keamanan-storage";
import type { KeamananActionPayload, KeamananDashboardParams, KeamananUpdatePayload } from "../domain/keamanan-types";

export const keamananKeys = {
  all: ["keamanan"] as const,
  dashboard: (params?: KeamananDashboardParams) => [...keamananKeys.all, "dashboard", params ?? {}] as const,
  detail: (id: number) => [...keamananKeys.all, "detail", id] as const,
};

export function useKeamananDashboard(params?: KeamananDashboardParams) {
  return useQuery({
    queryKey: keamananKeys.dashboard(params),
    queryFn: () => fetchKeamananDashboard(params),
  });
}

export function useKeamananDetail(permissionId: number) {
  return useQuery({
    queryKey: keamananKeys.detail(permissionId),
    queryFn: () => fetchKeamananDetail(permissionId),
    enabled: permissionId > 0,
  });
}

export function useScanSecurityStudent() {
  return useMutation({ mutationFn: scanSecurityStudent });
}

export function useSearchSecurityManual() {
  return useMutation({ mutationFn: searchSecurityManual });
}

export function useUpdateSecurityStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSecurityStatus,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: keamananKeys.all });
      queryClient.invalidateQueries({ queryKey: keamananKeys.detail(variables.permissionId) });
    },
  });
}

export function useCheckoutSecurity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: KeamananActionPayload) => {
      await checkoutSecurity(payload);
      const { permission } = payload;
      if (permission) addLocalPermissionState(permission);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: keamananKeys.all });
      queryClient.invalidateQueries({ queryKey: keamananKeys.detail(variables.permissionId) });
    },
  });
}

export function useCheckinSecurity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: KeamananActionPayload) => {
      await checkinSecurity(payload);
      const ids = [payload.permissionId, payload.perijinanId, payload.permission?.permissionId, payload.permission?.perijinanId].filter(Boolean);
      ids.forEach((id) => removeLocalPermissionState(Number(id)));
      // Keep legacy payload type close by because update_status still exists as backend fallback.
      void ({ permissionId: payload.permissionId, actionType: "checkin" } satisfies KeamananUpdatePayload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: keamananKeys.all });
      queryClient.invalidateQueries({ queryKey: keamananKeys.detail(variables.permissionId) });
    },
  });
}
