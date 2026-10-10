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

const ACTIVE_HALAQOH_KEY = "alhamra:guru-quran:active-halaqoh-id";

export function getSavedHalaqohId(): number | null {
  try {
    const raw = localStorage.getItem(ACTIVE_HALAQOH_KEY);
    if (!raw) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function setSavedHalaqohId(id: number) {
  try {
    if (id > 0) {
      localStorage.setItem(ACTIVE_HALAQOH_KEY, String(id));
    }
  } catch {
    // ignore storage errors
  }
}

function isNameMatching(sourceName?: string, targetName?: string): boolean {
  if (!sourceName || !targetName) return false;
  const s = sourceName.toLowerCase().trim();
  const t = targetName.toLowerCase().trim();
  if (s === t || s.includes(t) || t.includes(s)) return true;
  const wordsS = s.split(/\s+/).filter((w) => w.length >= 4);
  const wordsT = t.split(/\s+/).filter((w) => w.length >= 4);
  return wordsS.some((ws) => wordsT.some((wt) => ws === wt));
}

export function resolveSmartDefaultHalaqoh<T extends {
  id: number;
  penanggungJawab?: { id?: number; name?: string };
  ustadz?: { id?: number; name?: string }[];
}>(halaqohList: T[], profileName?: string): T | undefined {
  if (!halaqohList || halaqohList.length === 0) return undefined;

  // 1. Cek apakah ada pilihan yang tersimpan di localStorage dan masih valid
  const savedId = getSavedHalaqohId();
  if (savedId) {
    const foundSaved = halaqohList.find((h) => h.id === savedId);
    if (foundSaved) return foundSaved;
  }

  // 2. Jika ada profile pengguna, cari halaqoh di mana user login adalah PJ atau ustadz
  if (profileName) {
    const matched = halaqohList.find((h) => {
      const isPj = isNameMatching(profileName, h.penanggungJawab?.name);
      const isUstadz = h.ustadz?.some((u) => isNameMatching(profileName, u.name));
      return isPj || isUstadz;
    });
    if (matched) return matched;
  }

  // 3. Fallback ke elemen pertama jika tidak ada yang cocok
  return halaqohList[0];
}
