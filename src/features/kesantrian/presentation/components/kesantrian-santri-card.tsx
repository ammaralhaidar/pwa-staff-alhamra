import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { KesantrianStudent } from "../../domain/kesantrian-types";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

interface KesantrianSantriCardProps {
  student: KesantrianStudent;
  onClick: () => void;
}

export function KesantrianSantriCard({ student, onClick }: KesantrianSantriCardProps) {
  const isHabis = student.saldoDompet === 0;
  const isMenipis = student.saldoDompet > 0 && student.saldoDompet < 20000;

  return (
    <Card
      hasRing={false}
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_4px_16px_rgba(15,23,42,0.03)] transition-all duration-150 active:scale-[0.99] hover:border-slate-200 hover:shadow-md"
    >
      {/* Top Row: Name + Balance Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-bold leading-snug tracking-tight text-slate-800">
            {student.name}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-slate-400">
            NIS: {student.nis || "-"} • Kelas {student.kelas || "-"} • Kamar {student.kamar || "-"}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isHabis && (
            <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
              🚫 Saldo Habis
            </span>
          )}
          {isMenipis && (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
              ⚠️ Saldo Menipis
            </span>
          )}
          <ChevronRight className="size-4.5 text-slate-300" strokeWidth={2.5} />
        </div>
      </div>

      {/* Financial Block 2 Columns */}
      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-2.5">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-slate-400">Saldo Uang Saku:</span>
          <span className="mt-0.5 text-[13px] font-bold leading-none text-emerald-600">
            {rupiah.format(student.saldoUangSaku)}
          </span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[11px] font-medium text-slate-400">Saldo Dompet:</span>
          <span
            className={`mt-0.5 text-[13px] font-bold leading-none ${
              isHabis ? "text-red-600" : isMenipis ? "text-amber-600" : "text-blue-600"
            }`}
          >
            {rupiah.format(student.saldoDompet)}
          </span>
        </div>
      </div>
    </Card>
  );
}
