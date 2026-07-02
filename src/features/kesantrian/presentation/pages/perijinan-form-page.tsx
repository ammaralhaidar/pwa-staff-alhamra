import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPerijinanSchema } from "../../application/kesantrian-schemas";
import { useCreatePerijinan, useStudentSearch } from "../../application/kesantrian-queries";
import type { CreatePerijinanPayload } from "../../domain/kesantrian-types";
import { KesantrianHeader } from "../components/kesantrian-header";

export function PerijinanFormPage() {
  const navigate = useNavigate();
  const createMutation = useCreatePerijinan();
  const { data: students = [], isLoading: isLoadingStudents, error: studentsError, refetch: refetchStudents } = useStudentSearch();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    santriId: "",
    tanggalIjin: today,
    tanggalKembali: "",
    penjemput: "",
    jamPenjemputan: "",
    keperluan: "",
    catatan: "",
  });
  const [pendingPayload, setPendingPayload] = useState<CreatePerijinanPayload | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedStudent = students.find((student) => String(student.id) === form.santriId);
  const duration = useMemo(() => calculateDuration(form.tanggalIjin, form.tanggalKembali), [form.tanggalIjin, form.tanggalKembali]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = createPerijinanSchema.safeParse({
      ...form,
      santriId: Number(form.santriId),
      catatan: form.catatan || undefined,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Periksa kembali form");
      return;
    }

    setPendingPayload(parsed.data);
    setConfirmOpen(true);
  }

  async function confirmSubmit() {
    if (!pendingPayload) return;
    try {
      await createMutation.mutateAsync(pendingPayload);
      toast.success("Perijinan berhasil dibuat");
      setConfirmOpen(false);
      setPendingPayload(null);
      navigate("/kesantrian/perijinan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat perijinan");
    }
  }

  return (
    <main className="min-h-svh bg-[#EFF6FF]">
      <KesantrianHeader title="Tambah Perijinan" onBack={() => navigate("/kesantrian/perijinan")} />
      <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4 px-4 py-5">
        <section className="space-y-4 rounded-3xl bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">Data Izin Santri</h2>
          <Field label="Santri">
            <Select value={form.santriId} onValueChange={(value) => setForm((prev) => ({ ...prev, santriId: value }))}>
              <SelectTrigger className="h-11 w-full rounded-2xl border-blue-100">
                <SelectValue placeholder="Pilih santri" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingStudents ? (
                  <div className="px-3 py-2 text-sm text-slate-500">Memuat data santri...</div>
                ) : null}
                {studentsError ? (
                  <div className="space-y-2 px-3 py-2 text-sm text-rose-600">
                    <p>Gagal memuat santri.</p>
                    <Button type="button" size="sm" variant="outline" onClick={() => refetchStudents()}>
                      Coba lagi
                    </Button>
                  </div>
                ) : null}
                {!isLoadingStudents && !studentsError && students.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-slate-500">Belum ada santri yang bisa dipilih.</div>
                ) : null}
                {students.map((student) => (
                  <SelectItem key={student.id} value={String(student.id)}>
                    {student.name} {student.kelas ? `- ${student.kelas}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {selectedStudent ? (
            <div className="rounded-2xl bg-blue-50 px-3 py-2 text-sm text-slate-600">
              {selectedStudent.kelas ?? "-"} | {selectedStudent.kamar ?? "-"} | {selectedStudent.halaqoh ?? "-"}
            </div>
          ) : null}
        </section>

        <section className="space-y-4 rounded-3xl bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">Pengajuan Izin Santri</h2>
          <Field label="Tanggal Izin">
            <Input type="date" value={form.tanggalIjin} onChange={(event) => setForm((prev) => ({ ...prev, tanggalIjin: event.target.value }))} className="h-11 rounded-2xl border-blue-100" />
          </Field>
          <Field label="Tanggal Kembali">
            <Input type="date" value={form.tanggalKembali} onChange={(event) => setForm((prev) => ({ ...prev, tanggalKembali: event.target.value }))} className="h-11 rounded-2xl border-blue-100" />
          </Field>
          <Field label="Durasi">
            <Input value={duration} readOnly className={`h-11 rounded-2xl border-blue-100 bg-slate-50 ${duration === "Tanggal invalid" ? "text-rose-600" : ""}`} />
          </Field>
          <Field label="Penjemput">
            <Input value={form.penjemput} onChange={(event) => setForm((prev) => ({ ...prev, penjemput: event.target.value }))} placeholder="Nama penjemput" className="h-11 rounded-2xl border-blue-100" />
          </Field>
          <Field label="Jam Penjemputan">
            <Input type="time" value={form.jamPenjemputan} onChange={(event) => setForm((prev) => ({ ...prev, jamPenjemputan: event.target.value }))} className="h-11 rounded-2xl border-blue-100" />
          </Field>
          <Field label="Keperluan">
            <Textarea value={form.keperluan} onChange={(event) => setForm((prev) => ({ ...prev, keperluan: event.target.value }))} placeholder="Tuliskan keperluan izin" className="min-h-24 rounded-2xl border-blue-100" />
          </Field>
          <Field label="Catatan">
            <Textarea value={form.catatan} onChange={(event) => setForm((prev) => ({ ...prev, catatan: event.target.value }))} placeholder="Catatan tambahan" className="min-h-20 rounded-2xl border-blue-100" />
          </Field>
        </section>

        <Button type="submit" className="h-12 w-full rounded-2xl bg-[#288DE5]" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Menyimpan..." : "Simpan Perijinan"}
        </Button>
      </form>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-[360px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Konfirmasi Perijinan</DialogTitle>
            <DialogDescription>Pastikan data pengajuan izin sudah benar sebelum dikirim.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-2xl bg-blue-50 p-3 text-sm text-slate-700">
            <SummaryRow label="Santri" value={selectedStudent?.name ?? "-"} />
            <SummaryRow label="Tanggal Izin" value={form.tanggalIjin} />
            <SummaryRow label="Tanggal Kembali" value={form.tanggalKembali} />
            <SummaryRow label="Durasi" value={duration} />
            <SummaryRow label="Keperluan" value={form.keperluan} />
            <SummaryRow label="Penjemput" value={form.penjemput} />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)} disabled={createMutation.isPending}>
              Batal
            </Button>
            <Button type="button" onClick={confirmSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Menyimpan..." : "Kirim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      {children}
    </div>
  );
}

function calculateDuration(start: string, end: string) {
  if (!start || !end) return "-";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return "Tanggal invalid";
  if (endDate.getTime() < startDate.getTime()) return "Tanggal invalid";
  const days = Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  return `${days} Hari`;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[60%] text-right font-semibold text-slate-900">{value || "-"}</span>
    </div>
  );
}
