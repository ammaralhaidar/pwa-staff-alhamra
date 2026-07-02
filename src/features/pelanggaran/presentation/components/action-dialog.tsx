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
      <DialogContent className="max-w-[360px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Textarea className="min-h-28 rounded-2xl" placeholder={noteLabel ?? "Tuliskan alasan atau catatan..."} value={note} onChange={(event) => setNote(event.target.value)} />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>Batal</Button>
          <Button type="button" onClick={handleConfirm} disabled={disabled}>
            {loading ? "Memproses..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
