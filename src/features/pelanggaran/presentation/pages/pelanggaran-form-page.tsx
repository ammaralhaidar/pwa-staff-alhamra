import { useMemo, useState } from "react";
import { ArrowLeft, User, FileText, Info, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackMasterPelanggaran, fallbackStudents } from "../../application/pelanggaran-fallback-data";
import { useCreatePelanggaran, useMasterPelanggaran, usePelanggaranStudents } from "../../application/pelanggaran-queries";
import { validateCreatePelanggaran } from "../../application/pelanggaran-schemas";
import type { MasterPelanggaran, PelanggaranAccessType, StudentOption } from "../../domain/pelanggaran-types";
import { PelanggaranHeader } from "../components/pelanggaran-header";

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function PelanggaranFormPage({ accessType }: { accessType: PelanggaranAccessType }) {
  const navigate = useNavigate();
  const basePath = accessType === "kesantrian" 
    ? "/kesantrian/pelanggaran" 
    : accessType === "pendidik" 
      ? "/pelanggaran/pendidik" 
      : "/pelanggaran";
  const reporterLabel = accessType === "pendidik" ? "Petugas Pelanggaran Pendidik" : accessType === "kesantrian" ? "Manajer Kesantrian" : "Petugas Pelanggaran";
  
  const [form, setForm] = useState({ 
    siswaId: "", 
    tgl: getTodayString(), 
    pelanggaranId: "", 
    catatan: "" 
  });
  const [studentSearch, setStudentSearch] = useState("");
  const [masterSearch, setMasterSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedStudentSnapshot, setSelectedStudentSnapshot] = useState<StudentOption>();
  const [selectedMasterSnapshot, setSelectedMasterSnapshot] = useState<MasterPelanggaran>();
  
  const studentsQuery = usePelanggaranStudents({ search: studentSearch.trim() || undefined });
  const masterQuery = useMasterPelanggaran({ search: masterSearch.trim() || undefined });
  const createMutation = useCreatePelanggaran();
  const isStudentFallbackMode = studentsQuery.isError && isDemoFallbackEnabled();
  const isMasterFallbackMode = masterQuery.isError && isDemoFallbackEnabled();
  
  const students = useMemo(() => (isStudentFallbackMode ? fallbackStudents : studentsQuery.data ?? []), [studentsQuery.data, isStudentFallbackMode]);
  const masters = useMemo(() => (isMasterFallbackMode ? fallbackMasterPelanggaran : masterQuery.data ?? []), [masterQuery.data, isMasterFallbackMode]);
  
  const selectedStudent = useMemo(() => students.find((item) => item.id === Number(form.siswaId)) ?? selectedStudentSnapshot, [form.siswaId, selectedStudentSnapshot, students]);
  const selectedMaster = useMemo(() => masters.find((item) => item.id === Number(form.pelanggaranId)) ?? selectedMasterSnapshot, [form.pelanggaranId, masters, selectedMasterSnapshot]);
  const payload = useMemo(() => ({
    siswaId: Number(form.siswaId),
    pelanggaranId: Number(form.pelanggaranId),
    tgl: form.tgl,
    catatan: form.catatan.trim() || undefined,
    autoConfirm: true,
  }), [form.catatan, form.pelanggaranId, form.siswaId, form.tgl]);
  const validationError = validateCreatePelanggaran(payload);

  const submit = () => {
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setConfirmOpen(true);
  };

  const confirmSubmit = () => {
    createMutation.mutate(payload, {
      onSuccess: () => {
        setConfirmOpen(false);
        toast.success("Pelanggaran berhasil dikonfirmasi.");
        navigate(basePath);
      },
      onError: (error) => toast.error(getErrorMessage(error, "Gagal menyimpan pelanggaran.")),
    });
  };

  return (
    <div className="relative mx-auto flex h-svh w-full max-w-[430px] flex-col bg-[#EFF6FF]">
      {/* Sticky Header */}
      <div className="shrink-0 z-40">
        <PelanggaranHeader
          title="Tambah Pelanggaran"
          action={
            <Button asChild size="icon" variant="secondary" className="rounded-full">
              <Link to={basePath}>
                <ArrowLeft className="size-5" />
              </Link>
            </Button>
          }
        />
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <section className="space-y-4 px-5 py-6">
          {/* CARD 1: Pelapor */}
          <Card className="rounded-[20px] border-0 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">No. Referensi (Auto)</label>
              <div className="relative">
                <div className="w-full h-12 rounded-[12px] border border-slate-100 bg-slate-50/50 px-4 flex items-center text-sm font-semibold text-slate-400">
                  PG/YY.MM/XXXX
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <FileText className="size-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Pelapor</label>
              <div className="w-full h-12 rounded-[12px] border border-slate-100 bg-slate-50/50 px-4 flex items-center text-sm font-semibold text-slate-500">
                {reporterLabel}
              </div>
            </div>
          </Card>

          {/* CARD 2: Data Santri */}
          <Card className="rounded-[20px] border-0 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Data Santri</h3>
            
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Tanggal Pelanggaran *</label>
              <div className="relative">
                <input
                  type="date"
                  value={form.tgl}
                  onChange={(event) => setForm((current) => ({ ...current, tgl: event.target.value }))}
                  className="w-full h-12 rounded-[12px] border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Siswa *</label>
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder="Cari nama santri"
                  className="h-10 rounded-[12px] border-slate-200 bg-white pl-9 text-sm shadow-none"
                />
              </div>
              {studentsQuery.isError ? <p className="mb-2 text-xs font-semibold text-amber-600">{isStudentFallbackMode ? "Gagal memuat siswa dari API. Data contoh ditampilkan." : "Gagal memuat siswa dari API."}</p> : null}
              {!studentsQuery.isError && studentsQuery.isLoading ? <p className="mb-2 text-xs font-semibold text-slate-400">Memuat data siswa...</p> : null}
              {!studentsQuery.isError && !studentsQuery.isLoading && students.length === 0 ? <p className="mb-2 text-xs font-semibold text-slate-400">Tidak ada siswa ditemukan.</p> : null}
              <div className="relative">
                <Select
                  value={form.siswaId}
                  onValueChange={(value) => {
                    setForm((current) => ({ ...current, siswaId: value }));
                    setSelectedStudentSnapshot(students.find((item) => item.id === Number(value)));
                  }}
                >
                  <SelectTrigger className="w-full h-12 rounded-[12px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-10">
                    <SelectValue placeholder="Pilih Santri" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[12px]">
                    {students.length ? students.map((student) => (
                      <SelectItem key={student.id} value={String(student.id)}>
                        {student.name}{student.kelas ? ` - ${student.kelas}` : ""}
                      </SelectItem>
                    )) : <SelectItem value="__empty_students" disabled>Tidak ada data siswa</SelectItem>}
                  </SelectContent>
                </Select>
                <div className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 text-slate-400">
                  <User className="size-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Kelas</label>
              <div className="w-full h-12 rounded-[12px] border border-slate-100 bg-slate-50/50 px-4 flex items-center text-sm font-semibold text-slate-500">
                {selectedStudent?.kelas ?? "-"}
              </div>
            </div>
          </Card>

          {/* CARD 3: Data Pelanggaran */}
          <Card className="rounded-[20px] border-0 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Data Pelanggaran</h3>
            
            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Nama Pelanggaran *</label>
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={masterSearch}
                  onChange={(event) => setMasterSearch(event.target.value)}
                  placeholder="Cari jenis pelanggaran"
                  className="h-10 rounded-[12px] border-slate-200 bg-white pl-9 text-sm shadow-none"
                />
              </div>
              {masterQuery.isError ? <p className="mb-2 text-xs font-semibold text-amber-600">{isMasterFallbackMode ? "Gagal memuat master pelanggaran dari API. Data contoh ditampilkan." : "Gagal memuat master pelanggaran dari API."}</p> : null}
              {!masterQuery.isError && masterQuery.isLoading ? <p className="mb-2 text-xs font-semibold text-slate-400">Memuat jenis pelanggaran...</p> : null}
              {!masterQuery.isError && !masterQuery.isLoading && masters.length === 0 ? <p className="mb-2 text-xs font-semibold text-slate-400">Tidak ada jenis pelanggaran ditemukan.</p> : null}
              <div className="relative">
                <Select 
                  value={form.pelanggaranId} 
                  onValueChange={(value) => {
                    setForm((current) => ({ ...current, pelanggaranId: value }));
                    setSelectedMasterSnapshot(masters.find((item) => item.id === Number(value)));
                  }}
                  disabled={!form.siswaId}
                >
                  <SelectTrigger className="w-full h-12 rounded-[12px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-10 disabled:opacity-60">
                    <SelectValue placeholder={form.siswaId ? "Pilih Pelanggaran" : "Pilih siswa dulu"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-[12px]">
                    {masters.length ? masters.map((master) => (
                      <SelectItem key={master.id} value={String(master.id)}>
                        {master.name}{master.kategori ? ` - ${master.kategori}` : ""}
                      </SelectItem>
                    )) : <SelectItem value="__empty_masters" disabled>Tidak ada master pelanggaran</SelectItem>}
                  </SelectContent>
                </Select>
                <div className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 text-slate-400">
                  <Info className="size-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Kategori</label>
              <div className="w-full h-12 rounded-[12px] border border-slate-100 bg-slate-50/50 px-4 flex items-center text-sm font-semibold text-slate-500">
                {selectedMaster?.kategori ?? "-"}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Poin</label>
              <div className="w-full h-12 rounded-[12px] border border-slate-100 bg-slate-50/50 px-4 flex items-center text-sm font-bold text-red-600">
                {selectedMaster ? selectedMaster.poin : "0"}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Deskripsi Pelanggaran</label>
              <Textarea 
                placeholder="Tuliskan deskripsi pelanggaran" 
                value={form.catatan} 
                onChange={(event) => setForm((current) => ({ ...current, catatan: event.target.value }))}
                className="w-full min-h-[100px] rounded-[12px] border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none shadow-none"
              />
            </div>
          </Card>
        </section>
      </div>

      {/* Sticky Bottom Button */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white/95 px-5 py-4 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur z-30">
        <div className="mx-auto max-w-[430px]">
          {validationError ? <p className="mb-2 text-center text-xs font-semibold text-slate-400">{validationError}</p> : null}
          <Button 
            className="w-full h-12 rounded-[16px] bg-[#288DE5] hover:bg-[#1E74C5] text-white text-sm font-bold shadow-md shadow-[#288DE5]/20 border-0" 
            disabled={createMutation.isPending || Boolean(validationError)} 
            onClick={submit}
          >
            {createMutation.isPending ? "Menyimpan..." : "Konfirmasi"}
          </Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={(open) => !createMutation.isPending && setConfirmOpen(open)}>
        <DialogContent className="max-w-[360px] rounded-3xl">
          <DialogHeader>
            <DialogTitle>Konfirmasi Pelanggaran</DialogTitle>
            <DialogDescription>Pastikan data sudah benar sebelum disimpan dan dikonfirmasi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between gap-3"><span className="text-slate-500">Santri</span><span className="text-right font-semibold text-slate-800">{selectedStudent?.name ?? "-"}</span></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Kelas</span><span className="text-right font-semibold text-slate-800">{selectedStudent?.kelas ?? "-"}</span></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Pelanggaran</span><span className="text-right font-semibold text-slate-800">{selectedMaster?.name ?? "-"}</span></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Kategori</span><span className="text-right font-semibold text-slate-800">{selectedMaster?.kategori ?? "-"}</span></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Poin</span><span className="text-right font-semibold text-red-600">{selectedMaster?.poin ?? 0}</span></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Tanggal</span><span className="text-right font-semibold text-slate-800">{form.tgl}</span></div>
            {form.catatan.trim() ? <div className="border-t border-slate-200 pt-2"><span className="text-slate-500">Catatan</span><p className="mt-1 font-semibold text-slate-800">{form.catatan.trim()}</p></div> : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)} disabled={createMutation.isPending}>Batal</Button>
            <Button type="button" onClick={confirmSubmit} disabled={createMutation.isPending || Boolean(validationError)}>
              {createMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
