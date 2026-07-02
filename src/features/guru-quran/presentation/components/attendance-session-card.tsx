import { BookOpen, CalendarDays, Users } from "lucide-react";
import type { AttendanceSession } from "../../domain/guru-quran-types";
import { AssessmentStatusBadge } from "./assessment-status-badge";

interface AttendanceSessionCardProps {
  session: AttendanceSession;
  onClick?: () => void;
}

export function AttendanceSessionCard({
  session,
  onClick,
}: AttendanceSessionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl bg-white p-4 text-left shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-[#F2F4F7] transition-all duration-200 active:scale-[0.98]"
    >
      {/* Top Row: Icon + Info + Badge */}
      <div className="flex items-start gap-4">
        {/* Icon wrapper */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E0F2FE]">
          <BookOpen className="h-6 w-6 text-[#0EA5E9]" />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[15px] font-bold text-[#101828]">
              {session.sesiName}
            </p>
            <AssessmentStatusBadge status={session.status} />
          </div>
          <p className="mt-1 text-sm font-semibold text-[#475467]">
            {session.ustadzName}
          </p>
          <p className="mt-0.5 text-xs text-[#98A2B3] font-medium">{session.halaqohName}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="my-3.5 h-px bg-[#F2F4F7]" />

      {/* Bottom Row: Date + Students count */}
      <div className="flex items-center justify-between text-xs font-semibold text-[#667085]">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-[#98A2B3]" />
          <span>{session.tanggal}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#98A2B3]" />
          <span className="text-[#0ea5e9] bg-[#e0f2fe]/40 px-2 py-0.5 rounded-full">{session.jumlahSiswa} Siswa</span>
        </div>
      </div>
    </button>
  );
}
