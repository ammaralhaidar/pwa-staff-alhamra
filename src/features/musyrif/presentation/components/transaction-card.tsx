import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { WalletHistory } from "../../domain/musyrif-types";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function TransactionCard({ item }: { item: WalletHistory }) {
  const isIn = item.kind === "in";
  return (
    <Card className="flex flex-row items-center gap-3 rounded-[20px] border-0 bg-white p-4 shadow-sm">
      <div className={`flex size-11 items-center justify-center rounded-2xl ${isIn ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
        {isIn ? <ArrowDownLeft className="size-5" /> : <ArrowUpRight className="size-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-slate-900">{item.title}</h3>
        <p className="text-sm text-slate-500">{item.date || item.description || "-"}</p>
      </div>
      <p className={`font-black ${isIn ? "text-emerald-600" : "text-red-600"}`}>
        {isIn ? "+" : "-"}{rupiah.format(item.amount)}
      </p>
    </Card>
  );
}
