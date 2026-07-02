import type { AttendanceStatus } from "../../domain/guru-quran-types";
import { cn } from "@/lib/utils";

interface AssessmentStatusBadgeProps {
  status: AttendanceStatus;
}

const config: Record<AttendanceStatus, { label: string; className: string }> = {
  done: {
    label: "Selesai",
    className: "bg-[#ECFDF3] text-[#027A48]",
  },
  draft: {
    label: "Draft",
    className: "bg-[#FEF3F2] text-[#B42318]",
  },
};

export function AssessmentStatusBadge({ status }: AssessmentStatusBadgeProps) {
  const { label, className } = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold",
        className,
      )}
    >
      {label}
    </span>
  );
}
