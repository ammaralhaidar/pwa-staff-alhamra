import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  tone?: "blue" | "red" | "orange" | "green";
  requireNote?: boolean;
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (note?: string) => void;
};

export function DecisionDialog({
  open,
  title,
  description,
  confirmLabel,
  tone = "blue",
  requireNote,
  loading,
  onOpenChange,
  onConfirm,
}: Props) {
  const [note, setNote] = useState("");
  const isDisabled = loading || (requireNote && !note.trim());

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setNote("");
    onOpenChange(nextOpen);
  }

  function handleConfirm() {
    onConfirm(note.trim() || undefined);
    if (!loading) setNote("");
  }

  const toneClass = {
    blue: "bg-[#288DE5] hover:bg-[#1F7CD4]",
    red: "bg-[#DC2626] hover:bg-[#B91C1C]",
    orange: "bg-[#EA580C] hover:bg-[#C2410C]",
    green: "bg-[#059669] hover:bg-[#047857]",
  }[tone];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[360px] rounded-3xl border-0 p-5">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-950">{title}</DialogTitle>
          {description ? <DialogDescription className="text-sm font-medium leading-relaxed text-slate-600">{description}</DialogDescription> : null}
        </DialogHeader>
        {requireNote ? (
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Tuliskan alasan..."
            className="min-h-28 rounded-2xl border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-500/20"
          />
        ) : null}
        <DialogFooter className="flex-col-reverse gap-2 pt-1 sm:flex-col-reverse sm:space-x-0">
          <Button type="button" variant="outline" className="h-10 w-full rounded-xl border-slate-300 font-bold text-slate-900" onClick={() => handleOpenChange(false)} disabled={loading}>
            Kembali
          </Button>
          <Button type="button" className={`h-10 w-full rounded-xl font-bold text-white shadow-none ${toneClass}`} onClick={handleConfirm} disabled={isDisabled}>
            {loading ? "Memproses..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
