import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="rounded-[24px] border-0 bg-white p-5 shadow-sm">
      <h3 className="font-black text-slate-900">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </Card>
  );
}

export function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value || "-"}</p>
    </div>
  );
}
