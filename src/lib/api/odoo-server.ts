const SESSION_STORAGE_KEY = "alhamra:odoo-session";

function isApiDebugEnabled() {
  return import.meta.env.VITE_API_DEBUG === "true";
}

function getRequestUrl(baseUrl: string, path: string) {
  return `${baseUrl}${path}`;
}

function isLikelyUnproxiedLocalApi404(response: Response, requestUrl: string) {
  return response.status === 404 && requestUrl.startsWith("/api") && window.location.host.includes("localhost");
}

export function getOdooConfig() {
  const baseUrl = (import.meta.env.VITE_ODOO_BASE_URL as string | undefined) ?? "";
  const database = import.meta.env.VITE_ODOO_DATABASE as string | undefined;

  if (!database) {
    throw new Error("VITE_ODOO_DATABASE belum dikonfigurasi");
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), database };
}

export function getSessionId() {
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

export function setSessionId(sessionId: string) {
  localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
}

export function clearSessionId() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function postOdoo<T>(
  path: string,
  params: Record<string, unknown>,
  sessionId = getSessionId() ?? undefined,
): Promise<T> {
  const { baseUrl } = getOdooConfig();
  const requestUrl = getRequestUrl(baseUrl, path);
  const debugEnabled = isApiDebugEnabled();

  if (debugEnabled) {
    console.groupCollapsed(`[odoo-api] POST ${requestUrl}`);
    console.log("baseUrl:", baseUrl || "(relative)");
    console.log("path:", path);
    console.log("params:", params);
    console.log("hasSessionId:", Boolean(sessionId));
  }

  let response: Response;
  try {
    response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(sessionId ? { "X-Session-Id": sessionId } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ params }),
    });
  } catch (error) {
    if (debugEnabled) {
      console.error("fetch failed:", error);
      console.groupEnd();
    }
    throw error;
  }

  const body = await response.json().catch((error) => {
    if (debugEnabled) {
      console.warn("response json parse failed:", error);
    }
    return {};
  });

  if (debugEnabled) {
    console.log("status:", response.status);
    console.log("ok:", response.ok);
    console.log("response body:", body);
    console.groupEnd();
  }

  if (isLikelyUnproxiedLocalApi404(response, requestUrl)) {
    throw new Error("Proxy Vite belum aktif. Restart dev server dari folder alhamraPwa, lalu coba login lagi.");
  }

  if (!response.ok || body.error) {
    const message =
      body.error?.data?.message ||
      body.error?.message ||
      `Odoo request gagal (${response.status})`;
    throw new Error(message);
  }

  return body as T;
}
