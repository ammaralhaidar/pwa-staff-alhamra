import { useMemo, useState } from "react";
import { ArrowLeft, User, FileText, Info, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  const [studentPickerOpen, setStudentPickerOpen] = useState(false);
  const [masterPickerOpen, setMasterPickerOpen] = useState(false);
  const [selectedStudentSnapshot, setSelectedStudentSnapshot] = useState<StudentOption>();
  const [selectedMasterSnapshot, setSelectedMasterSnapshot] = useState<MasterPelanggaran>();
  
  const studentsQuery = usePelanggaranStudents({ search: studentSearch.trim() || undefined });
  const masterQuery = useMasterPelanggaran({ search: masterSearch.trim() || undefined });
  const createMutation = useCreatePelanggaran();
  const isStudentFallbackMode = studentsQuery.isError && isDemoFallbackEnabled();
  const isMasterFallbackMode = masterQuery.isError && isDemoFallbackEnabled();
  
  const students = useMemo(() => (isStudentFallbackMode ? fallbackStudents : studentsQuery.data ?? []), [studentsQuery.data, isStudentFallbackMode]);
  const masters = useMemo(() => (isMasterFallbackMode ? fallbackMasterPelanggaran : masterQuery.data ?? []), [masterQuery.data, isMasterFallbackMode]);
  const filteredStudents = useMemo(() => {
    const keyword = studentSearch.toLowerCase().trim();
    if (!keyword) return students;
    return students.filter((student) => [
      student.name,
      student.nis,
      student.kelas,
    ].filter(Boolean).join(" ").toLowerCase().includes(keyword));
  }, [studentSearch, students]);
  const filteredMasters = useMemo(() => {
    const keyword = masterSearch.toLowerCase().trim();
    if (!keyword) return masters;
    return masters.filter((master) => [
      master.name,
      master.kategori,
      master.jenis,
      String(master.poin),
    ].filter(Boolean).join(" ").toLowerCase().includes(keyword));
  }, [masterSearch, masters]);
  
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
                  min={getTodayString()}
                  onChange={(event) => setForm((current) => ({ ...current, tgl: event.target.value }))}
                  className="w-full h-12 rounded-[12px] border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Siswa *</label>
              {studentsQuery.isError ? <p className="mb-2 text-xs font-semibold text-amber-600">{isStudentFallbackMode ? "Gagal memuat siswa dari API. Data contoh ditampilkan." : "Gagal memuat siswa dari API."}</p> : null}
              {!studentsQuery.isError && studentsQuery.isLoading ? <p className="mb-2 text-xs font-semibold text-slate-400">Memuat data siswa...</p> : null}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setStudentPickerOpen(true)}
                  className="flex min-h-12 w-full items-center justify-between gap-3 rounded-[12px] border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-800 shadow-none transition active:scale-[0.99]"
                >
                  <span className={`min-w-0 flex-1 ${selectedStudent ? "line-clamp-2 text-slate-800" : "text-slate-400"}`}>
                    {selectedStudent?.name ?? "Pilih Santri"}
                  </span>
                  <User className="size-4 shrink-0" />
                </button>
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
              {masterQuery.isError ? <p className="mb-2 text-xs font-semibold text-amber-600">{isMasterFallbackMode ? "Gagal memuat master pelanggaran dari API. Data contoh ditampilkan." : "Gagal memuat master pelanggaran dari API."}</p> : null}
              {!masterQuery.isError && masterQuery.isLoading ? <p className="mb-2 text-xs font-semibold text-slate-400">Memuat jenis pelanggaran...</p> : null}
              <div className="relative">
                <button
                  type="button"
                  disabled={!form.siswaId}
                  onClick={() => {
                    if (!form.siswaId) return;
                    setMasterPickerOpen(true);
                  }}
                  className="flex min-h-12 w-full items-center justify-between gap-3 rounded-[12px] border border-slate-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-800 shadow-none transition active:scale-[0.99] disabled:bg-slate-50 disabled:text-slate-300 disabled:opacity-80"
                >
                  <span className={`min-w-0 flex-1 ${selectedMaster ? "line-clamp-2 text-slate-800" : "text-slate-400"}`}>
                    {selectedMaster?.name ?? (form.siswaId ? "Pilih Pelanggaran" : "Pilih siswa dulu")}
                  </span>
                  <Info className="size-4 shrink-0" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Kategori</label>
              <div className="flex min-h-12 w-full items-center rounded-[12px] border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-slate-500">
                {selectedMaster?.kategori ?? "-"}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 mb-1.5 block">Poin</label>
              <div className="flex min-h-12 w-full items-center rounded-[12px] border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-red-600">
                {selectedMaster ? selectedMaster.poin : "-"}
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
        <DialogContent className="max-w-[360px] rounded-3xl border-0 p-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-950">Konfirmasi Pelanggaran</DialogTitle>
            <DialogDescription className="text-sm font-medium leading-relaxed text-slate-600">Pastikan data sudah benar sebelum disimpan dan dikonfirmasi.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-2xl bg-slate-50 p-4 text-sm">
            <div className="flex justify-between gap-3"><span className="text-slate-500">Santri</span><span className="text-right font-semibold text-slate-800">{selectedStudent?.name ?? "-"}</span></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Kelas</span><span className="text-right font-semibold text-slate-800">{selectedStudent?.kelas ?? "-"}</span></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Pelanggaran</span><span className="text-right font-semibold text-slate-800">{selectedMaster?.name ?? "-"}</span></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Kategori</span><span className="text-right font-semibold text-slate-800">{selectedMaster?.kategori ?? "-"}</span></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Poin</span><span className="text-right font-semibold text-red-600">{selectedMaster?.poin ?? 0}</span></div>
            <div className="flex justify-between gap-3"><span className="text-slate-500">Tanggal</span><span className="text-right font-semibold text-slate-800">{form.tgl}</span></div>
            {form.catatan.trim() ? <div className="pt-2"><span className="text-slate-500">Catatan</span><p className="mt-1 font-semibold text-slate-800">{form.catatan.trim()}</p></div> : null}
          </div>
          <DialogFooter className="flex-col-reverse gap-2 border-0 pt-0 sm:flex-col-reverse sm:space-x-0">
            <Button type="button" variant="outline" className="h-10 w-full rounded-xl border-slate-300 font-bold text-slate-900" onClick={() => setConfirmOpen(false)} disabled={createMutation.isPending}>Batal</Button>
            <Button type="button" className="h-10 w-full rounded-xl bg-[#288DE5] font-bold text-white shadow-none hover:bg-[#1E74C5]" onClick={confirmSubmit} disabled={createMutation.isPending || Boolean(validationError)}>
              {createMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {studentPickerOpen ? (
        <StudentPickerOverlay
          search={studentSearch}
          loading={studentsQuery.isLoading}
          items={filteredStudents}
          onSearchChange={setStudentSearch}
          onClose={() => setStudentPickerOpen(false)}
          onSelect={(student) => {
            setForm((current) => ({ ...current, siswaId: String(student.id) }));
            setSelectedStudentSnapshot(student);
            setStudentPickerOpen(false);
          }}
        />
      ) : null}

      {masterPickerOpen ? (
        <MasterPelanggaranPickerOverlay
          search={masterSearch}
          loading={masterQuery.isLoading}
          items={filteredMasters}
          onSearchChange={setMasterSearch}
          onClose={() => setMasterPickerOpen(false)}
          onSelect={(master) => {
            setForm((current) => ({ ...current, pelanggaranId: String(master.id) }));
            setSelectedMasterSnapshot(master);
            setMasterPickerOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function StudentPickerOverlay({
  search,
  loading,
  items,
  onSearchChange,
  onClose,
  onSelect,
}: {
  search: string;
  loading: boolean;
  items: StudentOption[];
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onSelect: (student: StudentOption) => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] bg-[#F8F8FC]">
      <div className="mx-auto flex h-svh max-w-[430px] flex-col">
        <header className="shrink-0 bg-white px-5 py-5">
          <div className="flex items-center gap-4">
            <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition active:scale-95">
              <ArrowLeft className="size-6" />
            </button>
            <h2 className="text-xl font-extrabold text-slate-950">Pilih Siswa</h2>
          </div>
        </header>

        <div className="shrink-0 px-5 pb-4 pt-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Cari Nama, NIS, atau Kelas..."
              className="h-11 rounded-[14px] border-0 bg-white pl-11 text-sm font-medium text-slate-800 shadow-sm placeholder:text-slate-400"
              autoFocus
            />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-5 pb-8">
          {loading ? <PickerMessage>Memuat data siswa...</PickerMessage> : null}
          {!loading && items.length === 0 ? <PickerMessage>Tidak ada siswa ditemukan.</PickerMessage> : null}
          <div className="space-y-4">
            {items.map((student) => (
              <button
                key={student.id}
                type="button"
                onClick={() => onSelect(student)}
                className="flex w-full items-center gap-4 rounded-[20px] bg-white p-4 text-left shadow-[0_3px_10px_rgba(15,23,42,0.08)] transition active:scale-[0.99]"
              >
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#E8F5FF] text-xl font-extrabold text-[#288DE5]">
                  {getInitial(student.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-base font-semibold leading-snug text-slate-900">{student.name}</p>
                  <p className="mt-1 text-xs font-medium text-slate-400">NIS: {student.nis || "-"}</p>
                </div>
                <span className="shrink-0 rounded-xl bg-[#E8F5FF] px-3 py-1.5 text-xs font-semibold text-[#288DE5]">
                  {student.kelas || "-"}
                </span>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function MasterPelanggaranPickerOverlay({
  search,
  loading,
  items,
  onSearchChange,
  onClose,
  onSelect,
}: {
  search: string;
  loading: boolean;
  items: MasterPelanggaran[];
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onSelect: (master: MasterPelanggaran) => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] bg-[#F8F8FC]">
      <div className="mx-auto flex h-svh max-w-[430px] flex-col">
        <header className="shrink-0 bg-white px-5 py-5">
          <div className="flex items-center gap-4">
            <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition active:scale-95">
              <ArrowLeft className="size-6" />
            </button>
            <h2 className="text-xl font-extrabold text-slate-950">Pilih Pelanggaran</h2>
          </div>
        </header>

        <div className="shrink-0 px-5 pb-4 pt-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Cari Pelanggaran..."
              className="h-11 rounded-[14px] border-0 bg-white pl-11 text-sm font-medium text-slate-800 shadow-sm placeholder:text-slate-400"
              autoFocus
            />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto px-5 pb-8">
          {loading ? <PickerMessage>Memuat data pelanggaran...</PickerMessage> : null}
          {!loading && items.length === 0 ? <PickerMessage>Tidak ada pelanggaran ditemukan.</PickerMessage> : null}
          <div className="space-y-4">
            {items.map((master) => (
              <button
                key={master.id}
                type="button"
                onClick={() => onSelect(master)}
                className="w-full rounded-[20px] bg-white p-5 text-left shadow-[0_3px_10px_rgba(15,23,42,0.08)] transition active:scale-[0.99]"
              >
                <p className="text-base font-semibold leading-snug text-slate-900">{master.name}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="rounded-lg bg-[#ECFDF3] px-3 py-1.5 text-xs font-semibold text-[#16A34A]">
                    {master.kategori || master.jenis || "-"}
                  </span>
                  <span className="rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                    Poin: {master.poin}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function PickerMessage({ children }: { children: string }) {
  return (
    <div className="mb-4 rounded-2xl bg-white p-5 text-center text-sm font-semibold text-slate-400 shadow-sm">
      {children}
    </div>
  );
}

function getInitial(name?: string) {
  return name?.trim().charAt(0).toUpperCase() || "S";
}
