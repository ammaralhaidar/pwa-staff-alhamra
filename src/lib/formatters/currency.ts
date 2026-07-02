const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(value?: number | string | null, fallback = "Rp 0") {
  if (value === null || value === undefined || value === "") return fallback;
  const numberValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numberValue)) return fallback;
  return rupiahFormatter.format(numberValue);
}
