export function safeString(value: unknown, fallback = "-") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function safeNumber(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
