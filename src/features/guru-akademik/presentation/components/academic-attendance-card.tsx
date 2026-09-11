import { CalendarDays, Clock3, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import type { AcademicAttendance } from "../../domain/guru-akademik-types";

export function AcademicAttendanceCard({ item }: { item: AcademicAttendance }) {
  const recap = item.recap ?? { present: 0, permitted: 0, sick: 0, absent: 0, total: 0 };
  const title = item.subjectName !== "-" ? item.subjectName : item.name || "Absensi Siswa";

  return (
    <Link to={`/guru-akademik/absensi/${item.id}`} className="block">
      <Card className="rounded-[22px] border-0 bg-white p-4 shadow-sm transition active:scale-[0.99]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-[16px] font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">{item.className}</p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <span className={`rounded-lg px-2 py-1 text-[10px] font-bold ${item.state === "done" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
              {item.state === "done" ? "Selesai" : "Draft"}
            </span>
            {item.meetingNumber > 0 ? <span className="rounded-lg bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-600">P-{item.meetingNumber}</span> : null}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 border-y border-slate-100 py-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{item.date || "-"}</span>
          <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{item.lessonPeriod > 0 ? `Jam ke-${item.lessonPeriod}` : "Jam -"}</span>
          {item.teacherName !== "-" ? <span className="col-span-2 truncate">Guru: {item.teacherName}</span> : null}
        </div>
        {item.material.content ? <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">Materi: {item.material.content}</p> : null}
        <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold">
          <Users className="size-3.5 text-blue-500" />
          <span className="text-emerald-600">H {recap.present}</span>
          <span className="text-amber-600">I {recap.permitted}</span>
          <span className="text-sky-600">S {recap.sick}</span>
          <span className="text-red-500">A {recap.absent}</span>
        </div>
      </Card>
    </Link>
  );
}
