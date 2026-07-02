import { CalendarDays, LogIn, LogOut, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { KeamananPermission, KeamananTab } from "../../domain/keamanan-types";

function formatDateShort(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function formatTimeOnly(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(date).replace(".", ":");
}

interface PermissionCardProps {
  permission: KeamananPermission;
  tab: KeamananTab;
  onDetailClick?: (permission: KeamananPermission) => void;
}

export function PermissionCard({ permission, tab, onDetailClick }: PermissionCardProps) {
  const isCheckout = tab === "checkout";

  // Date and Time formatting
  const timeStr = isCheckout
    ? `Rencana: ${formatTimeOnly(permission.dateStart)}`
    : `Keluar: ${formatTimeOnly(permission.waktuKeluar || permission.dateStart)}`;
  const dateStr = formatDateShort(isCheckout ? permission.dateStart : permission.waktuKeluar || permission.dateStart);

  // Styling attributes
  const badgeText = permission.stateLabel || (isCheckout ? "Disetujui" : "Sedang Keluar");
  const badgeClass = isCheckout
    ? "bg-orange-50 text-orange-600 border border-orange-100"
    : "bg-emerald-50 text-emerald-600 border border-emerald-100";

  const timeTextColor = isCheckout ? "text-orange-600 font-bold" : "text-emerald-600 font-bold";
  const TimeIcon = isCheckout ? LogOut : LogIn;

  return (
    <Card
      onClick={() => onDetailClick?.(permission)}
      className="cursor-pointer rounded-[22px] border-0 bg-white p-4 shadow-sm hover:shadow-md transition active:scale-[0.99] select-none"
    >
      <div className="flex items-start gap-4">
        {/* Left: Avatar Silhouette */}
        <div className="flex size-14 shrink-0 items-center justify-center rounded-[18px] bg-blue-50 text-[#288DE5]">
          <User className="size-6 text-[#288DE5]" />
        </div>

        {/* Center: Student Info */}
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="truncate text-base font-extrabold text-slate-900 leading-tight">
            {permission.studentName}
          </h3>
          <p className="text-sm font-semibold text-slate-400">
            {permission.className || "Kelas -"}
          </p>

          <div className="pt-1.5 space-y-1">
            <span className={`flex items-center gap-1.5 text-xs ${timeTextColor}`}>
              <TimeIcon className="size-4 shrink-0" />
              {timeStr}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <CalendarDays className="size-4 shrink-0 text-slate-300" />
              {dateStr}
            </span>
          </div>
        </div>

        {/* Right: Badge */}
        <div className="shrink-0">
          <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${badgeClass}`}>
            {badgeText}
          </span>
        </div>
      </div>
    </Card>
  );
}
