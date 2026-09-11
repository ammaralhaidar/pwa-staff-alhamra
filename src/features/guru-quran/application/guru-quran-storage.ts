import { mapAttendanceList } from "./guru-quran-mappers";
import type { AttendanceSession } from "../domain/guru-quran-types";

const STORAGE_KEY = "alhamra:guru-quran:tahfidz-sessions";

export function getLocalTahfidzSessions(): AttendanceSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return mapAttendanceList(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function addLocalTahfidzSession(value: Record<string, unknown>) {
  const current = getLocalTahfidzSessions();
  const [session] = mapAttendanceList([value]);
  if (!session || session.id <= 0) return;
  const next = [session, ...current.filter((item) => item.id !== session.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 20)));
}

export function removeLocalTahfidzSession(id: number) {
  try {
    const current = getLocalTahfidzSessions();
    const next = current.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors
  }
}

export function syncLocalTahfidzSessionsWithApi(apiSessions: AttendanceSession[]) {
  try {
    if (!apiSessions) return;
    const serverIds = new Set(apiSessions.map((item) => item.id));
    const currentLocal = getLocalTahfidzSessions();
    const validLocal = currentLocal.filter((localItem) => serverIds.has(localItem.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validLocal));
  } catch {
    // ignore storage errors
  }
}

export function mergeTahfidzSessions(apiSessions: AttendanceSession[]) {
  if (apiSessions && apiSessions.length > 0) {
    syncLocalTahfidzSessionsWithApi(apiSessions);
  }
  const local = getLocalTahfidzSessions();
  const seen = new Set<number>();
  return [...apiSessions, ...local]
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .sort((a, b) => b.id - a.id);
}
