import type { KeamananPermission } from "../domain/keamanan-types";

const STORAGE_KEY = "alhamra:keamanan-permission-state";

function getIds(permission: KeamananPermission) {
  return [permission.permissionId, permission.perijinanId, permission.id].filter(Boolean).map(Number);
}

function hasMatchingId(first: KeamananPermission, second: KeamananPermission) {
  const firstIds = new Set(getIds(first));
  return getIds(second).some((id) => firstIds.has(id));
}

function isLocalOutside(permission: KeamananPermission) {
  const marker = `${permission.status ?? ""} ${permission.state} ${permission.stateLabel} ${permission.statusLabel ?? ""}`.toLowerCase();
  return marker.includes("outside") || marker.includes("permission") || marker.includes("keluar");
}

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
  const ids = new Set(getIds(updated));
  const items = loadLocalPermissionState().filter((item) => !getIds(item).some((id) => ids.has(id)));
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
  const activeLocal = local.filter(isLocalOutside);
  const mergedApi = apiItems.map((apiItem) => {
    const localMatch = activeLocal.find((localItem) => hasMatchingId(localItem, apiItem));
    return localMatch ?? apiItem;
  });
  const extraLocal = activeLocal.filter((localItem) => !apiItems.some((apiItem) => hasMatchingId(localItem, apiItem)));
  const merged = [...mergedApi, ...extraLocal];
  if (activeLocal.length !== local.length) saveLocalPermissionState(activeLocal);
  return merged;
}
