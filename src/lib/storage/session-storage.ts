export type StoredProfile = {
  name?: string;
  nama?: string;
  full_name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  avatar_128?: string;
  companyId?: number;
  company_id?: number;
  login?: string;
  role?: string;
  role_name?: string;
  job_title?: string;
  user?: StoredProfile;
  employee?: StoredProfile;
  pegawai?: StoredProfile;
  session?: StoredProfile;
  result?: StoredProfile;
  roles?: string[] | Record<string, boolean>;
  roleFlags?: Record<string, boolean>;
  userId?: number;
};

export const AUTH_SESSION_KEY = "alhamra:auth-session";
export const USER_STORAGE_KEY = "alhamra:user";
export const LOGIN_RESULT_KEY = "alhamra:login-result";
export const LEGACY_SESSION_KEY = "alhamra:session";
export const ODOO_SESSION_KEY = "alhamra:odoo-session";
export const LAST_ACTIVE_ROLE_ROUTE_KEY = "alhamra:last-active-role-route";

const ROLE_DASHBOARD_ROUTES = new Set([
  "/guru-quran",
  "/guru-akademik",
  "/musyrif",
  "/keamanan",
  "/pelanggaran",
  "/pelanggaran/pendidik",
  "/kesantrian/perijinan",
]);

const SESSION_KEYS = [
  "alhamra:auth-session",
  "alhamra:user",
  "alhamra:login-result",
  "alhamra:session",
  "alhamra:odoo-session",
];

export function readJsonStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function resolveStoredProfile() {
  for (const key of SESSION_KEYS) {
    const stored = readJsonStorage<StoredProfile>(key);
    const nested = stored?.user ?? stored?.employee ?? stored?.pegawai ?? stored?.session ?? stored?.result ?? stored;
    if (nested?.name || nested?.nama || nested?.full_name || nested?.username || nested?.email || nested?.login) {
      return {
        name: nested.name || nested.nama || nested.full_name || nested.username,
        email: nested.email || nested.login,
        avatar: nested.avatar || nested.avatar_128,
        companyId: nested.companyId || nested.company_id,
        role: nested.role || nested.role_name || nested.job_title,
        hasSessionData: true,
      };
    }
  }

  return {
    name: undefined,
    email: undefined,
    role: undefined,
    hasSessionData: false,
  };
}

export function normalizeRoleFlags(value: unknown): Record<string, boolean> {
  if (Array.isArray(value)) {
    return Object.fromEntries(value.filter((item): item is string => typeof item === "string").map((role) => [role, true]));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, isActive]) => [key, Boolean(isActive)]),
    );
  }

  return {};
}

export function resolveStoredRoleFlags() {
  for (const key of [AUTH_SESSION_KEY, USER_STORAGE_KEY, LOGIN_RESULT_KEY, LEGACY_SESSION_KEY]) {
    const stored = readJsonStorage<StoredProfile>(key);
    const session = stored?.session ?? stored;
    const flags = normalizeRoleFlags(session?.roleFlags ?? session?.roles ?? stored?.roles);
    if (Object.keys(flags).length > 0) return flags;
  }

  return null;
}

export function hasStoredAuthSession() {
  return Boolean(sessionStorage.getItem(ODOO_SESSION_KEY) || localStorage.getItem(ODOO_SESSION_KEY) || localStorage.getItem(AUTH_SESSION_KEY));
}

export function persistLastActiveRoleRoute(pathname: string) {
  if (ROLE_DASHBOARD_ROUTES.has(pathname)) {
    localStorage.setItem(LAST_ACTIVE_ROLE_ROUTE_KEY, pathname);
  }
}

export function getLastActiveRoleRoute() {
  const pathname = localStorage.getItem(LAST_ACTIVE_ROLE_ROUTE_KEY);
  return pathname && ROLE_DASHBOARD_ROUTES.has(pathname) ? pathname : null;
}

export function persistAuthSession<T extends { session?: StoredProfile }>(result: T) {
  const session = result.session;
  if (!session) return result;

  const roleFlags = normalizeRoleFlags(session.roleFlags ?? session.roles);
  const normalizedSession = {
    ...session,
    roleFlags,
    roles: Object.entries(roleFlags)
      .filter(([, isActive]) => isActive)
      .map(([role]) => role),
  };
  const normalizedResult = { ...result, session: normalizedSession };

  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(normalizedResult));
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedSession));
  localStorage.setItem(LOGIN_RESULT_KEY, JSON.stringify(normalizedResult));
  localStorage.removeItem(LAST_ACTIVE_ROLE_ROUTE_KEY);

  return normalizedResult;
}

export function clearAuthSession() {
  for (const key of SESSION_KEYS) {
    localStorage.removeItem(key);
  }
  localStorage.removeItem(LAST_ACTIVE_ROLE_ROUTE_KEY);
  sessionStorage.removeItem(ODOO_SESSION_KEY);

  // Dummy data is user-scoped during development and must not leak to the next login.
  for (let index = localStorage.length - 1; index >= 0; index -= 1) {
    const key = localStorage.key(index);
    if (key?.startsWith("alhamra:guru-akademik:")) localStorage.removeItem(key);
  }

  void clearPrivateRuntimeCaches();
}

async function clearPrivateRuntimeCaches() {
  if (!("caches" in window)) return;
  const keys = await caches.keys();
  await Promise.all(keys.filter((key) => /api|runtime|data/i.test(key)).map((key) => caches.delete(key)));
}

export function initialsFromName(name: string, fallback = "U") {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || fallback;
}
