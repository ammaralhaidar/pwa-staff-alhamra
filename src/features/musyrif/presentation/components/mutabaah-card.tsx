import { Card } from "@/components/ui/card";
import type { Mutabaah } from "../../domain/musyrif-types";

export function MutabaahCard({ item }: { item: Mutabaah }) {
  const isPagi = item.sesiName?.toLowerCase() === "pagi";
  // Format date if needed
  const dateParts = item.tanggal ? item.tanggal.split("-") : [];
  const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : item.tanggal;

  return (
    <Card className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition text-left flex flex-col gap-4">
      <div className="space-y-1">
        <p className="text-[12px] font-bold text-slate-400">
          No. Ref: <span className="text-blue-600 font-extrabold">{item.name}</span>
        </p>
        <h3 className="text-[16px] font-extrabold text-slate-800 leading-snug">
          {item.santriName}
        </h3>
      </div>

      <div className="space-y-3 text-[13px] font-medium text-slate-500 border-t border-slate-50/80 pt-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Tanggal:</span>
          <span className="font-bold text-slate-700">{formattedDate || "-"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Kelas:</span>
          <span className="font-bold text-slate-700">Kelas VIII A</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Sesi:</span>
          <span className={`rounded-full px-3 py-0.5 text-[11px] font-extrabold ${
            isPagi 
              ? "bg-blue-50 text-blue-600 border border-blue-100/50" 
              : "bg-orange-50 text-orange-600 border border-orange-100/50"
          }`}>
            {item.sesiName || "Pagi"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Total Skor:</span>
          <span className="font-black text-blue-600">
            {item.totalSkor} dari {item.maxSkor}
          </span>
        </div>
      </div>
    </Card>
  );
}
