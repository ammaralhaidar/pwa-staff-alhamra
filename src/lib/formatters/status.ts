export function formatStatusLabel(value?: string | null, fallback = "-") {
  if (!value) return fallback;
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
