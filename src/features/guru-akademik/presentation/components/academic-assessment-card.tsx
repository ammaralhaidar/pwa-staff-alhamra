import { BookOpenCheck, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { AcademicAssessment } from "../../domain/guru-akademik-types";

export function AcademicAssessmentCard({ item }: { item: AcademicAssessment }) {
  return <Card className="rounded-[22px] border-0 bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="text-[16px] font-bold text-slate-900">{item.subjectName}</h2><p className="mt-1 text-xs font-medium text-slate-500">{item.className}</p></div><span className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${item.status === "done" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{item.status === "done" ? "Selesai" : "Draft"}</span></div><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500"><span>{item.schoolYear} • {item.semester}</span><span className="flex items-center gap-1"><Users className="size-3.5" />{item.items.length} Siswa</span></div><div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-violet-600"><BookOpenCheck className="size-4" />KKM {item.kkm}</div></Card>;
}
