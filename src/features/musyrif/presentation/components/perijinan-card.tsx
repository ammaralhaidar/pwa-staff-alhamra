import { CalendarDays, Clock, FileText, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import type { MusyrifPerijinan } from "../../domain/musyrif-types";
import { MusyrifStatusBadge } from "./musyrif-status-badge";

export function PerijinanCard({ item }: { item: MusyrifPerijinan }) {
  return (
    <Link to={`/musyrif/perijinan/${item.id}`}>
      <Card className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition text-left relative flex flex-row items-start gap-4">
        {/* Left Avatar circle */}
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>

        {/* Middle Info */}
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[16px] font-extrabold text-slate-800 leading-snug truncate">
                {item.santriName}
              </h3>
              <div className="shrink-0">
                <MusyrifStatusBadge status={item.status} label={item.statusLabel} />
              </div>
            </div>
            <p className="text-[13px] font-semibold text-slate-400">{item.name}</p>
          </div>

          <div className="space-y-1.5 text-[13px] font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-slate-400 shrink-0" />
              <span>Tanggal: {item.tanggalIzin || "-"}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-slate-400 shrink-0" />
              <span className="truncate">Keperluan: {item.keperluan || "-"}</span>
            </div>
            <div className="flex items-center gap-2 text-[#288DE5] font-semibold">
              <Clock className="size-4 text-[#288DE5] shrink-0" />
              <span>Lama Ijin: {item.durasi || "-"}</span>
            </div>
          </div>
        </div>

        {/* Right Arrow */}
        <div className="shrink-0 self-center pl-1">
          <ChevronRight className="size-5 text-slate-300" />
        </div>
      </Card>
    </Link>
  );
}
