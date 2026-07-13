import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

export function AcademicMenuCard({ to, title, description, icon, color }: { to: string; title: string; description: string; icon: ReactNode; color: string }) {
  return <Link to={to} className="block"><Card className="flex flex-row min-h-[112px] items-center gap-4 rounded-[26px] border-0 bg-white px-5 py-4 shadow-[0_8px_22px_rgba(15,23,42,0.06)] transition active:scale-[0.99]">
    <div className={`flex size-[72px] shrink-0 items-center justify-center rounded-[22px] ${color}`}>{icon}</div>
    <div className="min-w-0 flex-1"><h2 className="text-[17px] font-bold leading-tight text-slate-900">{title}</h2><p className="mt-1 text-[13px] font-medium leading-relaxed text-slate-400">{description}</p></div>
    <ChevronRight className="size-6 shrink-0 text-slate-300" />
  </Card></Link>;
}
