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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[360px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        {requireNote ? (
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Tuliskan alasan..."
            className="min-h-28 rounded-2xl"
          />
        ) : null}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isDisabled}>
            {loading ? "Memproses..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
