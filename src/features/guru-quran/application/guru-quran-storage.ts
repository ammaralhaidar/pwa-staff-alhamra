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

export function mergeTahfidzSessions(apiSessions: AttendanceSession[]) {
  const local = getLocalTahfidzSessions();
  const seen = new Set<number>();
  return [...local, ...apiSessions]
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .sort((a, b) => b.id - a.id);
}
