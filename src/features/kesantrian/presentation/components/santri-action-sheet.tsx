import { ChevronRight, KeyRound, User, Wallet, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { KesantrianStudent } from "../../domain/kesantrian-types";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

interface SantriActionSheetProps {
  student: KesantrianStudent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTopup: () => void;
  onChangePin: () => void;
  onViewDetail: () => void;
}

export function SantriActionSheet({
  student,
  open,
  onOpenChange,
  onTopup,
  onChangePin,
  onViewDetail,
}: SantriActionSheetProps) {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="fixed bottom-0 top-auto left-1/2 -translate-x-1/2 translate-y-0 w-full max-w-[430px] rounded-t-[28px] rounded-b-none border-t border-slate-100 bg-white p-6 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] outline-none sm:max-w-[430px] gap-4 z-[90]"
        showCloseButton={false}
      >
        {/* Drag Handle */}
        <div className="mx-auto w-12 h-1 bg-slate-200 rounded-full -mt-2 mb-1" />

        <DialogHeader className="space-y-1 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7] bg-[#E0F2FE] px-2.5 py-0.5 rounded-full">
              Aksi Santri
            </span>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="size-5" />
            </button>
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900 leading-snug">
            {student.name}
          </DialogTitle>
          <p className="text-xs text-slate-500 font-medium">
            NIS: {student.nis || "-"} • Kelas {student.kelas || "-"} • Kamar {student.kamar || "-"}
          </p>
        </DialogHeader>

        {/* Saldo Brief Card */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 grid grid-cols-2 gap-3">
          <div>
            <span className="text-[11px] font-medium text-slate-400">Saldo Uang Saku:</span>
            <p className="text-sm font-bold text-emerald-600 mt-0.5">
              {rupiah.format(student.saldoUangSaku)}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-medium text-slate-400">Saldo Dompet:</span>
            <p
              className={`text-sm font-bold mt-0.5 ${
                student.saldoDompet === 0
                  ? "text-red-600"
                  : student.saldoDompet < 20000
                  ? "text-amber-600"
                  : "text-blue-600"
              }`}
            >
              {rupiah.format(student.saldoDompet)}
            </p>
          </div>
        </div>

        {/* Action Buttons List */}
        <div className="flex flex-col gap-2.5 pt-1">
          {/* Action 1: Isi Saldo */}
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onTopup();
            }}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 text-left transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/30">
                <Wallet className="size-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Isi Saldo Dompet</p>
                <p className="text-xs text-slate-500">Top-up dompet belanja dari saldo uang saku</p>
              </div>
            </div>
            <ChevronRight className="size-5 text-blue-400 shrink-0" />
          </button>

          {/* Action 2: Ganti PIN */}
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onChangePin();
            }}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 text-left shadow-xs transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/30">
                <KeyRound className="size-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Ganti PIN Dompet</p>
                <p className="text-xs text-slate-500">Ubah 6 digit PIN transaksi santri</p>
              </div>
            </div>
            <ChevronRight className="size-5 text-slate-300 shrink-0" />
          </button>

          {/* Action 3: Lihat Detail */}
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onViewDetail();
            }}
            className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-white hover:bg-slate-50 text-left shadow-xs transition active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white shadow-sm shadow-slate-700/30">
                <User className="size-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Lihat Detail Profil</p>
                <p className="text-xs text-slate-500">Biodata lengkap, kamar, asrama & wali santri</p>
              </div>
            </div>
            <ChevronRight className="size-5 text-slate-300 shrink-0" />
          </button>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="mt-1 h-11 w-full rounded-xl border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
        >
          Tutup
        </Button>
      </DialogContent>
    </Dialog>
  );
}
