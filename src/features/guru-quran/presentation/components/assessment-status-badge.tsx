import type { AttendanceStatus } from "../../domain/guru-quran-types";
import { cn } from "@/lib/utils";

interface AssessmentStatusBadgeProps {
  status: AttendanceStatus;
  doneCount?: number;
  totalCount?: number;
}

export function AssessmentStatusBadge({ status, doneCount, totalCount }: AssessmentStatusBadgeProps) {
  let label = "Belum Disimak";
  let className = "bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]";

  if (status === "done") {
    label = "Selesai";
    className = "bg-[#ECFDF3] text-[#027A48] border border-[#ABEFC6]";
  } else if (status === "partial") {
    if (doneCount !== undefined && totalCount !== undefined && totalCount > 0) {
      label = `Disimak (${doneCount}/${totalCount})`;
    } else if (doneCount !== undefined && doneCount > 0) {
      label = `Disimak (${doneCount})`;
    } else {
      label = "Disimak Sebagian";
    }
    className = "bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold shrink-0",
        className,
      )}
    >
      {label}
    </span>
  );
}
