import { FileText, AlertTriangle, ChevronRight, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import type { Pelanggaran, PelanggaranAccessType } from "../../domain/pelanggaran-types";
import { PelanggaranStatusBadge } from "./pelanggaran-status-badge";

export function PelanggaranCard({ item, accessType }: { item: Pelanggaran; accessType: PelanggaranAccessType }) {
  const basePath = accessType === "pendidik" ? "/pelanggaran/pendidik" : "/pelanggaran";
  
  return (
    <Link to={`${basePath}/${item.id}`} className="block">
      <Card className="rounded-[22px] border-0 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow duration-200">
        {/* Top Section: Avatar, Name, Badge, Chevron */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#F8FAFC] text-[#94A3B8]">
            <User className="size-5" />
          </div>
          
          {/* Name and Class */}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-800 leading-snug truncate">
              {item.namaSantri}
            </h3>
            <p className="text-xs font-semibold text-[#94A3B8] mt-0.5">
              {item.kelasSantri || "-"}
            </p>
          </div>
          
          {/* Status & Chevron */}
          <div className="flex items-center gap-1.5 shrink-0">
            <PelanggaranStatusBadge status={item.status} label={item.statusLabel} />
            <ChevronRight className="size-5 text-[#94A3B8]" />
          </div>
        </div>

        {/* Middle Section: Reference Code & Violations Info */}
        <div className="mt-4 space-y-2.5 text-xs text-[#64748B] font-medium pl-1">
          <div className="flex items-center gap-3">
            <FileText className="size-4 shrink-0 text-[#94A3B8]" />
            <span className="tracking-wide">{item.reference}</span>
          </div>
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-4 shrink-0 text-[#94A3B8] mt-0.5" />
            <span className="leading-relaxed">
              Pelanggaran: {item.namaPelanggaran}
            </span>
          </div>
        </div>

        {/* Bottom Section: Points */}
        <div className="mt-4 pt-1.5 pl-1">
          <span className="text-sm font-bold text-red-600">
            Poin: {item.poin}
          </span>
        </div>
      </Card>
    </Link>
  );
}
