import type { KeamananPermission } from "../domain/keamanan-types";

const STORAGE_KEY = "alhamra:keamanan-permission-state";

export function loadLocalPermissionState(): KeamananPermission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as KeamananPermission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function saveLocalPermissionState(items: KeamananPermission[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addLocalPermissionState(permission: KeamananPermission) {
  const updated: KeamananPermission = {
    ...permission,
    state: "Permission",
    stateLabel: "Sedang Keluar",
    status: "outside",
    statusLabel: "Sedang Keluar",
    waktuKeluar: permission.waktuKeluar || new Date().toISOString(),
  };
  const ids = new Set([updated.permissionId, updated.perijinanId, updated.id].filter(Boolean));
  const items = loadLocalPermissionState().filter((item) => !ids.has(item.permissionId) && !ids.has(item.perijinanId) && !ids.has(item.id));
  items.push(updated);
  saveLocalPermissionState(items);
  return items;
}

export function removeLocalPermissionState(permissionId: number) {
  const items = loadLocalPermissionState().filter((item) => item.permissionId !== permissionId && item.perijinanId !== permissionId && item.id !== permissionId);
  saveLocalPermissionState(items);
  return items;
}

export function mergeLocalPermissionState(apiItems: KeamananPermission[]) {
  const local = loadLocalPermissionState();
  const apiIds = new Set(apiItems.flatMap((item) => [item.permissionId, item.perijinanId, item.id]).filter(Boolean));
  const reconciledLocal = local.filter((item) => !apiIds.has(item.permissionId) && !apiIds.has(item.perijinanId) && !apiIds.has(item.id));
  if (reconciledLocal.length !== local.length) saveLocalPermissionState(reconciledLocal);
  return [...apiItems, ...reconciledLocal];
}
