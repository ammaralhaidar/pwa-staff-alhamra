import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackMusyrifStudents } from "../../application/musyrif-fallback-data";
import {
  useCheckMusyrifPerijinan,
  useCreateMusyrifPerijinan,
  useMusyrifStudents,
} from "../../application/musyrif-queries";
import { validatePerijinanPayload } from "../../application/musyrif-schemas";
import { MusyrifDatePicker } from "../components/musyrif-date-picker";
import { MusyrifHeader } from "../components/musyrif-header";
import { MusyrifTimePicker } from "../components/musyrif-time-picker";
import { SearchableOptionPicker } from "../components/searchable-option-picker";

function dateDiffLabel(start: string, end: string) {
  if (!start || !end) return "0 Hari";
  const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000);
  if (diff < 0) return "Tanggal Invalid";
  return `${diff} Hari`;
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function MusyrifPerijinanFormPage() {
  const navigate = useNavigate();
  const today = useMemo(() => formatDateInput(new Date()), []);
  const studentsQuery = useMusyrifStudents();
  const createMutation = useCreateMusyrifPerijinan();
  const checkMutation = useCheckMusyrifPerijinan();
  const isUsingStudentFallback = studentsQuery.isError && isDemoFallbackEnabled();
  const students = useMemo(
    () => studentsQuery.data ?? (isUsingStudentFallback ? fallbackMusyrifStudents : []),
    [studentsQuery.data, isUsingStudentFallback],
  );
  
  const [form, setForm] = useState({
    siswa_id: "",
    tgl_ijin: today,
    tgl_kembali: today,
    jam_penjemputan: "",
    penjemput: "",
    keperluan: "",
    catatan: "",
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const duration = useMemo(() => dateDiffLabel(form.tgl_ijin, form.tgl_kembali), [form.tgl_ijin, form.tgl_kembali]);
  const selectedStudent = useMemo(() => {
    return students.find((s) => String(s.id) === form.siswa_id);
  }, [students, form.siswa_id]);
  const studentOptions = useMemo(
    () => students.map((student) => ({
      value: String(student.id),
      label: student.name,
      subtitle: student.nis ? `NIS: ${student.nis}` : undefined,
      badge: student.kelas,
    })),
    [students],
  );

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const updateTanggalIzin = (value: string) => {
    setForm((current) => ({
      ...current,
      tgl_ijin: value,
      tgl_kembali: current.tgl_kembali && current.tgl_kembali >= value ? current.tgl_kembali : value,
    }));
  };

  const handleOpenConfirm = () => {
    if (isUsingStudentFallback) {
      toast.error("Data santri contoh tidak bisa dipakai untuk submit.");
      return;
    }
    const payload = { ...form, siswa_id: Number(form.siswa_id) };
    const error = validatePerijinanPayload(payload);
    if (error) {
      toast.error(error);
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const payload = { ...form, siswa_id: Number(form.siswa_id) };
    try {
      const createRes = await createMutation.mutateAsync(payload);
      const newId = createRes?.id;

      if (newId && newId > 0) {
        try {
          await checkMutation.mutateAsync({ izin_id: newId });
          toast.success("Perijinan berhasil diajukan dan langsung berstatus Diperiksa!");
        } catch {
          toast.warning("Perijinan berhasil dibuat (Draft), namun gagal di-verifikasi (Check).");
        }
      } else {
        toast.success("Perijinan berhasil diajukan.");
      }
      setShowConfirmModal(false);
      navigate("/musyrif/perijinan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat perijinan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative mx-auto flex h-svh max-w-[430px] flex-col bg-[#EFF6FF]">
      <div className="shrink-0 z-40">
        <MusyrifHeader
          title="Tambah Perijinan"
          subtitle="Isi formulir perijinan santri"
          onBack={() => navigate("/musyrif/perijinan")}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto pb-28">
        <section className="flex flex-col gap-4 px-4 py-6">
          {/* Card 1: No. Referensi */}
          <Card className="rounded-[24px] border-0 bg-white p-5 shadow-sm space-y-2">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">No. Referensi (Auto)</label>
              <Input 
                value="Auto" 
                readOnly 
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-400 font-semibold"
              />
            </div>
          </Card>

          {/* Card 2: Data Ijin Santri */}
          <Card className="rounded-[24px] border-0 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-700 text-sm border-b border-slate-100 pb-2">Data Ijin Santri</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">
                Tanggal Ijin <span className="text-red-500">*</span>
              </label>
              <MusyrifDatePicker value={form.tgl_ijin} min={today} onChange={updateTanggalIzin} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">
                Siswa <span className="text-red-500">*</span>
              </label>
              <SearchableOptionPicker
                value={form.siswa_id}
                onChange={(value) => update("siswa_id", value)}
                title="Pilih Santri"
                placeholder="Pilih Santri"
                searchPlaceholder="Cari nama, NIS, atau kelas..."
                options={studentOptions}
              />
              {!students.length ? <p className="text-xs font-semibold text-amber-600">Data santri belum tersedia.</p> : null}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">Kelas</label>
              <Input 
                value={selectedStudent?.kelas || ""} 
                readOnly 
                placeholder=""
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">Kamar</label>
              <Input 
                value={selectedStudent?.kamar || ""} 
                readOnly 
                placeholder=""
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-500"
              />
            </div>
          </Card>

          {/* Card 3: Pengajuan Ijin Santri */}
          <Card className="rounded-[24px] border-0 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-700 text-sm border-b border-slate-100 pb-2">Pengajuan Ijin Santri</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">
                Tanggal Kembali <span className="text-red-500">*</span>
              </label>
              <MusyrifDatePicker value={form.tgl_kembali} min={form.tgl_ijin || today} onChange={(value) => update("tgl_kembali", value)} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">
                Penjemput <span className="text-red-500">*</span>
              </label>
              <Input 
                placeholder="Nama Penjemput" 
                value={form.penjemput} 
                onChange={(event) => update("penjemput", event.target.value)} 
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">
                Jam Penjemputan <span className="text-red-500">*</span>
              </label>
              <MusyrifTimePicker value={form.jam_penjemputan} onChange={(value) => update("jam_penjemputan", value)} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">Lama Ijin</label>
              <Input 
                value={duration} 
                readOnly 
                className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-500 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">
                Keperluan <span className="text-red-500">*</span>
              </label>
              <Textarea 
                placeholder="Tuliskan keperluan ijin" 
                value={form.keperluan} 
                onChange={(event) => update("keperluan", event.target.value)} 
                className="rounded-xl border-slate-200 focus-visible:ring-blue-500 min-h-[90px] resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">Catatan</label>
              <Textarea 
                placeholder="Tuliskan catatan" 
                value={form.catatan} 
                onChange={(event) => update("catatan", event.target.value)} 
                className="rounded-xl border-slate-200 focus-visible:ring-blue-500 min-h-[90px] resize-none"
              />
            </div>
          </Card>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur z-30">
        <div className="mx-auto max-w-[430px]">
          <Button className="h-12 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={createMutation.isPending || isSubmitting || isUsingStudentFallback} onClick={handleOpenConfirm}>
            Ajukan Izin
          </Button>
        </div>
      </div>

      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="max-w-[400px] rounded-3xl p-6 bg-white border-0 shadow-2xl">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-800">
                  Konfirmasi Pengajuan Izin
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-slate-500">
                  Mohon periksa kembali data perizinan santri sebelum diajukan.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="my-2 space-y-3 rounded-2xl bg-slate-50/80 p-4 border border-slate-100 text-xs">
            {/* Santri */}
            <div className="flex justify-between items-start gap-2 border-b border-slate-200/60 pb-2.5">
              <span className="font-semibold text-slate-500 shrink-0">Santri</span>
              <div className="text-right font-bold text-slate-800">
                <p>{selectedStudent?.name ?? "-"}</p>
                <p className="text-[11px] font-medium text-slate-500">
                  {selectedStudent?.kelas ? `Kelas ${selectedStudent.kelas}` : ""} {selectedStudent?.kamar ? `• Kamar ${selectedStudent.kamar}` : ""}
                </p>
              </div>
            </div>

            {/* Tanggal Izin & Kembali */}
            <div className="flex justify-between items-center gap-2 border-b border-slate-200/60 pb-2.5">
              <span className="font-semibold text-slate-500 shrink-0">Tanggal Izin</span>
              <span className="font-bold text-slate-800 text-right">{form.tgl_ijin} s/d {form.tgl_kembali} ({duration})</span>
            </div>

            {/* Jam & Penjemput */}
            <div className="flex justify-between items-center gap-2 border-b border-slate-200/60 pb-2.5">
              <span className="font-semibold text-slate-500 shrink-0">Penjemput</span>
              <span className="font-bold text-slate-800 text-right">{form.penjemput || "-"} ({form.jam_penjemputan || "-"})</span>
            </div>

            {/* Keperluan */}
            <div className="flex justify-between items-start gap-2 border-b border-slate-200/60 pb-2.5">
              <span className="font-semibold text-slate-500 shrink-0">Keperluan</span>
              <span className="font-medium text-slate-800 text-right max-w-[200px] break-words">{form.keperluan || "-"}</span>
            </div>

            {/* Catatan */}
            {form.catatan ? (
              <div className="flex justify-between items-start gap-2 border-b border-slate-200/60 pb-2.5">
                <span className="font-semibold text-slate-500 shrink-0">Catatan</span>
                <span className="font-medium text-slate-800 text-right max-w-[200px] break-words">{form.catatan}</span>
              </div>
            ) : null}

            {/* Status Target Badge */}
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold text-slate-500">Status Pengajuan</span>
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                🟠 Diperiksa (Check)
              </span>
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border-slate-200 text-slate-600 font-semibold h-11"
            >
              Periksa Kembali
            </Button>
            <Button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-11"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memproses...
                </span>
              ) : (
                "Konfirmasi & Ajukan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
