import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";

type MusyrifMenuCardProps = {
  to: string;
  title: string;
  description?: string;
  icon: ReactNode;
  iconBgClass?: string;
  iconColorClass?: string;
};

export function MusyrifMenuCard({
  to,
  title,
  description,
  icon,
  iconBgClass = "bg-blue-50",
  iconColorClass = "text-blue-600"
}: MusyrifMenuCardProps) {
  return (
    <Link to={to}>
      <Card className="flex flex-row items-center gap-4 rounded-[24px] border-0 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${iconBgClass} ${iconColorClass}`}>{icon}</div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-slate-900 text-[15px]">{title}</h2>
          {description ? <p className="mt-0.5 text-xs text-slate-400 font-medium leading-relaxed">{description}</p> : null}
        </div>
        <ChevronRight className="size-5 text-slate-300" />
      </Card>
    </Link>
  );
}
