import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type ActionDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  loading?: boolean;
  requireNote?: boolean;
  noteLabel?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (note?: string) => void;
};

export function ActionDialog({ open, title, description, confirmLabel, loading, requireNote, noteLabel, onOpenChange, onConfirm }: ActionDialogProps) {
  const [note, setNote] = useState("");
  const disabled = loading || (requireNote && !note.trim());
  const isDestructive = confirmLabel.toLowerCase().includes("batal");

  function handleConfirm() {
    if (disabled) return;
    onConfirm(note.trim() || undefined);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setNote("");
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[360px] rounded-3xl border-0 p-5">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-950">{title}</DialogTitle>
          <DialogDescription className="text-sm font-medium leading-relaxed text-slate-600">{description}</DialogDescription>
        </DialogHeader>
        <Textarea
          className="min-h-28 rounded-2xl border-slate-200 text-sm font-medium text-slate-800 shadow-none focus-visible:ring-2 focus-visible:ring-blue-500/20"
          placeholder={noteLabel ?? "Tuliskan alasan atau catatan..."}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
        <DialogFooter className="flex-col-reverse gap-2 border-0 pt-0 sm:flex-col-reverse sm:space-x-0">
          <Button type="button" variant="outline" className="h-10 w-full rounded-xl border-slate-300 font-bold text-slate-900" onClick={() => handleOpenChange(false)} disabled={loading}>Batal</Button>
          <Button
            type="button"
            className={`h-10 w-full rounded-xl font-bold text-white shadow-none ${
              isDestructive ? "bg-[#DC2626] hover:bg-[#B91C1C]" : "bg-[#288DE5] hover:bg-[#1E74C5]"
            }`}
            onClick={handleConfirm}
            disabled={disabled}
          >
            {loading ? "Memproses..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
