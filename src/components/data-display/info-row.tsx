import type { ReactNode } from "react";

interface InfoRowProps {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-4">
      {icon ? <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F0F9FF]">{icon}</div> : null}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[#98A2B3]">{label}</p>
        <div className="mt-0.5 truncate text-[15px] font-medium text-[#344054]">{value}</div>
      </div>
    </div>
  );
}
