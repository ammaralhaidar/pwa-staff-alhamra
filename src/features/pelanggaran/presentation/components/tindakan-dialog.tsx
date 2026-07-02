import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TindakanOption } from "../../domain/pelanggaran-types";

type TindakanDialogProps = {
  open: boolean;
  loading?: boolean;
  tindakanOptions: TindakanOption[];
  onOpenChange: (open: boolean) => void;
  onConfirm: (tindakanId: number, deskripsi?: string) => void;
};

export function TindakanDialog({ open, loading, tindakanOptions, onOpenChange, onConfirm }: TindakanDialogProps) {
  const [tindakanId, setTindakanId] = useState("");
  const [deskripsi, setDeskripsi] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[360px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>Validasi Pelanggaran</DialogTitle>
          <DialogDescription>Pilih tindakan atau hukuman untuk melanjutkan ke status Validasi.</DialogDescription>
        </DialogHeader>
        <Select value={tindakanId} onValueChange={setTindakanId}>
          <SelectTrigger><SelectValue placeholder="Pilih tindakan" /></SelectTrigger>
          <SelectContent>
            {tindakanOptions.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Textarea className="min-h-24 rounded-2xl" placeholder="Deskripsi tindakan opsional" value={deskripsi} onChange={(event) => setDeskripsi(event.target.value)} />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Batal</Button>
          <Button type="button" onClick={() => onConfirm(Number(tindakanId), deskripsi.trim() || undefined)} disabled={loading || !tindakanId}>
            {loading ? "Memproses..." : "Validasi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
