import { Card } from "@/components/ui/card";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function WalletSummaryCard({ title, amount, tone = "blue" }: { title: string; amount: number; tone?: "blue" | "green" }) {
  const valueColor = tone === "green" ? "text-emerald-600" : "text-blue-600";
  return (
    <Card className="rounded-[22px] border-0 bg-white p-4 shadow-sm">
      <p className="text-[12px] font-medium text-slate-400">Saldo {title}</p>
      <p className={`mt-1.5 text-[16px] font-black ${valueColor}`}>{rupiah.format(amount)}</p>
    </Card>
  );
}
