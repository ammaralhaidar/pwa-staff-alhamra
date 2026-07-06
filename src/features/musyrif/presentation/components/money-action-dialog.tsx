import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
const numberFormatter = new Intl.NumberFormat("id-ID");

type MoneyActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  studentName?: string;
  uangSaku?: number;
  dompet?: number;
  onSubmit: (amount: number) => void;
};

function parseFormattedNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function formatInputAmount(value: string) {
  const amount = parseFormattedNumber(value);
  return amount ? numberFormatter.format(amount) : "";
}

export function MoneyActionDialog({
  open,
  onOpenChange,
  isLoading,
  studentName = "-",
  uangSaku = 0,
  dompet = 0,
  onSubmit,
}: MoneyActionDialogProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setAmount("");
      setError("");
    }
    onOpenChange(nextOpen);
  };
  const numericAmount = parseFormattedNumber(amount);

  const submit = () => {
    if (numericAmount < 1000) {
      setError("Minimal isi dompet Rp 1.000.");
      return;
    }
    if (numericAmount > uangSaku) {
      setError("Saldo uang saku tidak cukup untuk nominal ini.");
      return;
    }
    setError("");
    onSubmit(numericAmount);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="fixed bottom-0 left-1/2 top-auto z-[100] w-full max-w-[430px] -translate-x-1/2 translate-y-0 gap-0 rounded-b-none rounded-t-[28px] border-t border-slate-100 bg-white p-0 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] outline-none sm:max-w-[430px]"
        showCloseButton={false}
      >
        <div className="space-y-6 px-7 pb-7 pt-10">
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="absolute right-6 top-6 flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-700"
            aria-label="Tutup"
          >
            <X className="size-6" />
          </button>

          <div className="space-y-4 pt-6">
            <div>
              <p className="text-[15px] font-medium text-slate-400">Nama Siswa</p>
              <p className="mt-1 text-[22px] font-semibold leading-snug text-slate-900">{studentName}</p>
            </div>
            <div>
              <p className="text-[15px] font-medium text-slate-400">Saldo Uang Saku</p>
              <p className="mt-1 text-[21px] font-semibold text-slate-900">{rupiah.format(uangSaku)}</p>
            </div>
            <div>
              <p className="text-[15px] font-medium text-slate-400">Saldo Dompet</p>
              <p className="mt-1 text-[21px] font-semibold text-slate-900">{rupiah.format(dompet)}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              inputMode="numeric"
              placeholder="Minimal Rp 1.000"
              value={amount}
              onChange={(event) => {
                setAmount(formatInputAmount(event.target.value));
                if (error) setError("");
              }}
              className="h-[58px] rounded-2xl border-slate-400 bg-white px-5 text-[18px] font-semibold text-slate-900 shadow-none placeholder:text-slate-300 focus-visible:ring-blue-500"
            />
            {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
            <p className="text-[15px] italic leading-relaxed text-slate-500">
              Saldo akan dipindahkan dari Uang Saku ke Dompet
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="h-14 rounded-[22px] border-slate-500 bg-white text-lg font-semibold text-slate-500 hover:bg-slate-50"
            >
              Batal
            </Button>
            <Button
              disabled={isLoading}
              onClick={submit}
              className="h-14 rounded-[22px] border-0 bg-[#288DE5] text-lg font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-[#1E74C5]"
            >
              {isLoading ? "Memproses..." : "Isi Dompet"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
