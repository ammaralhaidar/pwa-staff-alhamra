export function isDemoFallbackEnabled() {
  return import.meta.env.DEV || import.meta.env.VITE_ENABLE_FALLBACK_DATA === "true";
}
