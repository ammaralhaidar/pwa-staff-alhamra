import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type MoneyActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  onSubmit: (amount: number) => void;
};

export function MoneyActionDialog({ open, onOpenChange, isLoading, onSubmit }: MoneyActionDialogProps) {
  const [amount, setAmount] = useState("");
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setAmount("");
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="fixed bottom-0 top-auto left-1/2 -translate-x-1/2 translate-y-0 w-full max-w-[430px] rounded-t-[28px] rounded-b-none border-t border-slate-100 bg-white p-6 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] outline-none sm:max-w-[430px] gap-5 z-[100]"
        showCloseButton={false}
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-black text-slate-900 text-center">Isi Dompet</DialogTitle>
          <div className="mx-auto w-12 h-1 bg-slate-200 rounded-full" />
        </DialogHeader>
        <div className="grid gap-3 mt-2">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nominal Topup</label>
            <Input 
              type="number" 
              placeholder="Masukkan nominal (cth: 50000)" 
              value={amount} 
              onChange={(event) => setAmount(event.target.value)} 
              className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500 font-bold"
            />
          </div>
          <p className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold leading-relaxed text-blue-700">
            Saldo akan dipindahkan dari uang saku ke dompet santri.
          </p>
        </div>
        <DialogFooter className="flex flex-row gap-3 mt-4 border-t-0 p-0 bg-transparent -mx-0 -mb-0">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            className="flex-1 h-11 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Batal
          </Button>
          <Button 
            disabled={isLoading} 
            onClick={() => onSubmit(Number(amount))}
            className="flex-1 h-11 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Memproses..." : "Isi Dompet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
