import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

export function AcademicMenuCard({ to, title, description, icon, color }: { to: string; title: string; description: string; icon: ReactNode; color: string }) {
  return <Link to={to}><Card className="flex items-center gap-4 rounded-[24px] border-0 bg-white p-4 shadow-sm transition active:scale-[0.99]">
    <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${color}`}>{icon}</div>
    <div className="min-w-0 flex-1"><h2 className="text-[15px] font-bold text-slate-900">{title}</h2><p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-400">{description}</p></div>
    <ChevronRight className="size-5 text-slate-300" />
  </Card></Link>;
}
