import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { WalletHistory } from "../../domain/musyrif-types";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

type TransactionDetailDialogProps = {
  item: WalletHistory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

export function TransactionDetailDialog({ item, open, onOpenChange }: TransactionDetailDialogProps) {
  if (!item) return null;
  const isIn = item.kind === "in";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="fixed bottom-0 top-auto left-1/2 -translate-x-1/2 translate-y-0 w-full max-w-[430px] rounded-t-[28px] rounded-b-none border-t border-slate-100 bg-white p-6 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] outline-none sm:max-w-[430px] gap-5 z-[100]"
        showCloseButton={false}
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-black text-slate-900 text-center">Detail Transaksi</DialogTitle>
          <div className="mx-auto w-12 h-1 bg-slate-200 rounded-full" />
        </DialogHeader>

        <div className="mt-3 flex flex-col items-center text-center space-y-4">
          <div className={`flex size-14 items-center justify-center rounded-2xl ${isIn ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
            {isIn ? <ArrowDownLeft className="size-7" /> : <ArrowUpRight className="size-7" />}
          </div>
          
          <div className="space-y-1">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
              isIn ? "bg-emerald-100/70 text-emerald-700" : "bg-red-100/70 text-red-700"
            }`}>
              {isIn ? "Uang Masuk" : "Uang Keluar"}
            </span>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {isIn ? "+" : "-"}{rupiah.format(item.amount)}
            </p>
          </div>
        </div>

        <div className="mt-4 bg-slate-50 rounded-2xl p-4 space-y-3 text-sm">
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium text-xs">Judul</span>
            <span className="font-bold text-slate-800 text-right">{item.title}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium text-xs">Keterangan</span>
            <span className="font-bold text-slate-800 text-right max-w-[200px] truncate">{item.description || "-"}</span>
          </div>
          <div className="flex justify-between items-center py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium text-xs">No. Ref</span>
            <span className="font-mono font-bold text-blue-600">{item.reference || "-"}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400 font-medium text-xs">Tanggal</span>
            <span className="font-bold text-slate-800">{item.date || "-"}</span>
          </div>
        </div>

        <div className="mt-4">
          <Button 
            onClick={() => onOpenChange(false)}
            className="w-full h-12 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
