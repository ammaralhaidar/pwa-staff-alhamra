import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackMusyrifStudents } from "../../application/musyrif-fallback-data";
import { useCreateMusyrifPerijinan, useMusyrifStudents } from "../../application/musyrif-queries";
import { validatePerijinanPayload } from "../../application/musyrif-schemas";
import { MusyrifHeader } from "../components/musyrif-header";

function dateDiffLabel(start: string, end: string) {
  if (!start || !end) return "0 Hari";
  const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000);
  if (diff < 0) return "Tanggal Invalid";
  return `${diff} Hari`;
}

export function MusyrifPerijinanFormPage() {
  const navigate = useNavigate();
  const studentsQuery = useMusyrifStudents();
  const createMutation = useCreateMusyrifPerijinan();
  const isUsingStudentFallback = studentsQuery.isError && isDemoFallbackEnabled();
  const students = useMemo(
    () => studentsQuery.data ?? (isUsingStudentFallback ? fallbackMusyrifStudents : []),
    [studentsQuery.data, isUsingStudentFallback],
  );
  
  const [form, setForm] = useState({
    siswa_id: "",
    tgl_ijin: "",
    tgl_kembali: "",
    jam_penjemputan: "",
    penjemput: "",
    keperluan: "",
    catatan: "",
  });

  const duration = useMemo(() => dateDiffLabel(form.tgl_ijin, form.tgl_kembali), [form.tgl_ijin, form.tgl_kembali]);
  const selectedStudent = useMemo(() => {
    return students.find((s) => String(s.id) === form.siswa_id);
  }, [students, form.siswa_id]);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
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
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Perijinan berhasil diajukan.");
        navigate("/musyrif/perijinan");
      },
      onError: () => toast.error("Gagal membuat perijinan."),
    });
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
              <Input 
                type="date" 
                value={form.tgl_ijin} 
                onChange={(event) => update("tgl_ijin", event.target.value)} 
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">
                Siswa <span className="text-red-500">*</span>
              </label>
              <Select value={form.siswa_id} onValueChange={(value) => update("siswa_id", value)}>
                <SelectTrigger className="h-11 rounded-xl border-slate-200">
                  <SelectValue placeholder="Pilih Santri" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Input 
                type="date" 
                value={form.tgl_kembali} 
                onChange={(event) => update("tgl_kembali", event.target.value)} 
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500"
              />
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
              <Input 
                type="time" 
                value={form.jam_penjemputan} 
                onChange={(event) => update("jam_penjemputan", event.target.value)} 
                className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-500"
              />
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
          <Button className="h-12 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={createMutation.isPending || isUsingStudentFallback} onClick={submit}>
            Ijin Diperiksa
          </Button>
        </div>
      </div>
    </div>
  );
}
