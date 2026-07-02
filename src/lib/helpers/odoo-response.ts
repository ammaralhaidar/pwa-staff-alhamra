type OdooLikeResponse = {
  result?: unknown;
  data?: unknown;
  error?: unknown;
  message?: unknown;
};

export function unwrapOdooData<T = unknown>(response: unknown): T {
  const first = response as OdooLikeResponse;
  const result = first?.result ?? first;
  const second = result as OdooLikeResponse;
  const nestedResult = second?.result ?? second?.data ?? result;
  const third = nestedResult as OdooLikeResponse;
  return (third?.data ?? nestedResult) as T;
}

export function getOdooErrorMessage(error: unknown, fallback = "Terjadi kesalahan. Silakan coba lagi.") {
  if (!error || typeof error !== "object") return fallback;
  const value = error as OdooLikeResponse;
  if (typeof value.message === "string") return value.message;
  const nested = value.error as OdooLikeResponse | undefined;
  if (typeof nested?.message === "string") return nested.message;
  return fallback;
}
