import { CalendarDays, ClipboardList, Clock, Info, LogOut, User, UserRound, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import type { KeamananPermission } from "../../domain/keamanan-types";

interface DetailPerizinanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission: KeamananPermission | null;
}

function formatDateRaw(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().split("T")[0];
}

function formatLongDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function formatTimeOnly(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(date).replace(".", ":");
}

export function DetailPerizinanModal({ open, onOpenChange, permission }: DetailPerizinanModalProps) {
  if (!permission) return null;

  const isOutside = permission.state === "outside" || permission.stateLabel === "Sedang Keluar";
  const statusLabel = permission.stateLabel || (isOutside ? "Sedang Keluar" : "Perizinan Disetujui");

  // Determine history
  const hasHistory = isOutside || permission.waktuKeluar;
  const historyTime = formatTimeOnly(permission.waktuKeluar || permission.dateStart);
  const historyDate = formatLongDate(permission.waktuKeluar || permission.dateStart);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100svh-56px)] w-[calc(100vw-32px)] max-w-[390px] overflow-hidden rounded-[28px] border-0 bg-white p-0 shadow-2xl"
      >
        {/* Modal Header */}
        <div className="relative flex items-start justify-between gap-3 bg-[#288DE5] px-4 py-4 text-white">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
              <User className="size-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[17px] font-bold leading-tight">
                {permission.studentName}
              </h3>
              <p className="mt-0.5 text-sm font-medium text-white/80">NIS: {permission.studentNis || "-"}</p>
              <span className="mt-2 inline-flex rounded-full border border-white/30 bg-white/20 px-3 py-1 text-[12px] font-semibold leading-tight text-white">
                {statusLabel}
              </span>
            </div>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
            >
              <X className="size-5" />
            </button>
          </DialogClose>
        </div>

        {/* Modal Body */}
        <div className="max-h-[calc(100svh-205px)] space-y-5 overflow-y-auto px-4 py-5">
          {/* Section: Data Perizinan */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-[17px] font-bold text-slate-800">
              <ClipboardList className="size-4 text-[#288DE5]" />
              Data Perizinan
            </h4>
            <div className="space-y-2">
              <DetailRow label="Keperluan" value={permission.reason} />
              <DetailRow label="Tanggal Ijin" value={formatDateRaw(permission.dateStart)} />
              <DetailRow label="Tanggal Kembali" value={formatDateRaw(permission.dateReturn)} />
              <DetailRow label="Durasi" value={permission.lamaIzin || "-"} />
              <DetailRow label="Penjemput" value={permission.penjemput} />
              <DetailRow label="Jam Penjemputan" value={permission.jamPenjemputan || "-"} />
              <DetailRow label="Status" value={statusLabel} />
            </div>
          </div>

          {/* Section: Data Santri */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-[17px] font-bold text-slate-800">
              <UserRound className="size-4 text-[#288DE5]" />
              Data Santri
            </h4>
            <div className="space-y-2">
              <DetailRow label="Nama" value={permission.studentName} />
              <DetailRow label="NIS" value={permission.studentNis} />
              <DetailRow label="Kelas" value={permission.className} />
              <DetailRow label="Kamar" value={permission.kamar} />
              <DetailRow label="Halaqoh" value={permission.halaqoh} />
              <DetailRow label="Musyrif" value={permission.musyrif} />
            </div>
          </div>

          {/* Section: Riwayat */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-[17px] font-bold text-slate-800">
              <Clock className="size-4 text-[#288DE5]" />
              Riwayat
            </h4>
            {hasHistory ? (
              <div className="flex gap-3 rounded-2xl border-l-4 border-[#288DE5] bg-blue-50/50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#288DE5]">
                  <LogOut className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-slate-800">Checkout</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Clock className="size-3 text-[#288DE5]" />
                    {historyTime}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <CalendarDays className="size-3 text-[#288DE5]" />
                    {historyDate}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-slate-500">
                <Info className="size-5 shrink-0 text-slate-400" />
                <p className="text-xs font-semibold">Belum ada riwayat checkout/checkin</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DetailRowProps {
  label: string;
  value?: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex min-h-[54px] items-center justify-between gap-4 rounded-2xl bg-[#F8FAFC] px-4 py-3">
      <span className="text-sm font-medium leading-snug text-slate-400">{label}</span>
      <span className="max-w-[58%] break-words text-right text-sm font-semibold leading-snug text-slate-800">
        {value || "-"}
      </span>
    </div>
  );
}
