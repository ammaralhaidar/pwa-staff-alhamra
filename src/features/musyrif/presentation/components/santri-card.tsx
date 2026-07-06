import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import type { MusyrifStudent } from "../../domain/musyrif-types";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function SantriCard({ student }: { student: MusyrifStudent }) {
  return (
    <Link to={`/musyrif/santri/${student.id}`}>
      <Card hasRing={false} className="rounded-2xl border-0 bg-white p-4 shadow-[0_4px_16px_rgba(15,23,42,0.04)] transition active:scale-[0.99]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-base font-bold leading-snug tracking-tight text-slate-800 line-clamp-1">{student.name}</h3>
            <p className="text-xs text-slate-500">NIS: {student.nis || "-"}</p>
            <p className="text-xs text-slate-500">Kelas: {student.kelas || "-"}</p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-slate-400" strokeWidth={2} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-400">Saldo Uang Saku:</span>
            <span className="mt-0.5 text-sm font-bold leading-none text-emerald-600">{rupiah.format(student.saldoUangSaku)}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs font-medium text-slate-400">Saldo Dompet:</span>
            <span className="mt-0.5 text-sm font-bold leading-none text-blue-600">{rupiah.format(student.saldoDompet)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
