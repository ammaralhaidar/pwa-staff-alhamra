import { apiEndpoints } from "@/lib/api/api-constants";
import { postOdoo } from "@/lib/api/odoo-server";
import {
  assertOdooSuccess,
  getPerijinanId,
  mapDashboard,
  mapManualSearch,
  mapPermission,
  mapScanResult,
  unwrapOdooData,
} from "../application/keamanan-mappers";
import type {
  KeamananActionPayload,
  KeamananDashboard,
  KeamananDashboardParams,
  KeamananManualSearch,
  KeamananPermission,
  KeamananScanResult,
  KeamananUpdatePayload,
} from "../domain/keamanan-types";

function compactPayload(payload: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== "" && value !== null));
}

function resolvePerijinanId(payload: number | KeamananActionPayload) {
  if (typeof payload === "number") return payload;
  if (payload.perijinanId) return payload.perijinanId;
  if (payload.permission) return getPerijinanId(payload.permission);
  return payload.permissionId;
}

export async function fetchKeamananDashboard(params: KeamananDashboardParams = {}): Promise<KeamananDashboard> {
  const response = await postOdoo(apiEndpoints.keamanan.dashboard, compactPayload(params));
  assertOdooSuccess(response);
  return mapDashboard(response);
}

export async function fetchKeamananDetail(permissionId: number): Promise<KeamananPermission> {
  const response = await postOdoo(apiEndpoints.keamanan.detail, { permission_id: permissionId });
  assertOdooSuccess(response);
  return mapPermission(unwrapOdooData(response));
}

export async function scanSecurityStudent(barcode: string): Promise<KeamananScanResult> {
  const response = await postOdoo(apiEndpoints.keamanan.scanStudent, { barcode });
  assertOdooSuccess(response);
  return mapScanResult(response);
}

export async function searchSecurityManual(keyword: string): Promise<KeamananManualSearch> {
  const response = await postOdoo(apiEndpoints.keamanan.searchManual, { keyword });
  assertOdooSuccess(response);
  return mapManualSearch(response);
}

export async function updateSecurityStatus(payload: KeamananUpdatePayload) {
  const params = {
    permission_id: payload.permissionId,
    action_type: payload.actionType,
  };
  const response = await postOdoo(apiEndpoints.keamanan.updateStatus, params);
  assertOdooSuccess(response);
  return response;
}

export async function checkoutSecurity(payload: number | KeamananActionPayload) {
  return updateSecurityStatus({
    permissionId: resolvePerijinanId(payload),
    actionType: "checkout",
  });
}

export async function checkinSecurity(payload: number | KeamananActionPayload) {
  return updateSecurityStatus({
    permissionId: resolvePerijinanId(payload),
    actionType: "checkin",
  });
}
