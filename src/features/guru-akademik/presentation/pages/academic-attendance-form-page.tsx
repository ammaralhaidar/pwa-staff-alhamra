import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorState } from "@/components/feedback/error-state";
import { getOdooErrorMessage } from "@/lib/helpers/odoo-response";
import { useAcademicAttendanceMasterData, useAcademicStudentsByClass, useCreateAcademicAttendance } from "../../application/guru-akademik-queries";
import type { AcademicAttendanceStatus } from "../../domain/guru-akademik-types";
import { GuruAkademikHeader } from "../components/guru-akademik-header";

const statuses: AcademicAttendanceStatus[] = ["Hadir", "Izin", "Sakit", "Alpa"];

function localToday() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function AcademicAttendanceFormPage() {
  const navigate = useNavigate();
  const masterQuery = useAcademicAttendanceMasterData();
  const create = useCreateAcademicAttendance();
  const [date, setDate] = useState(localToday);
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [lessonPeriodId, setLessonPeriodId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [statusesByStudent, setStatusesByStudent] = useState<Record<number, AcademicAttendanceStatus>>({});
  const [notesByStudent, setNotesByStudent] = useState<Record<number, string>>({});
  const [theme, setTheme] = useState("");
  const [material, setMaterial] = useState("");
  const studentsQuery = useAcademicStudentsByClass(classId ? Number(classId) : undefined);
  const students = studentsQuery.data?.students ?? [];

  function selectClass(value: string) {
    setClassId(value);
    setStatusesByStudent({});
    setNotesByStudent({});
  }

  function submit() {
    if (!date || !classId || !lessonPeriodId || !subjectId) {
      toast.error("Tanggal, kelas, jam pelajaran, dan mata pelajaran wajib dipilih.");
      return;
    }
    if (masterQuery.data?.isManager && !teacherId) {
      toast.error("Pilih guru pengajar terlebih dahulu.");
      return;
    }
    if (!students.length) {
      toast.error("Daftar siswa belum tersedia untuk kelas ini.");
      return;
    }
    if (!material.trim()) {
      toast.error("Materi wajib diisi sebelum absensi disimpan.");
      return;
    }

    create.mutate({
      date,
      classId: Number(classId),
      lessonPeriodId: Number(lessonPeriodId),
      subjectId: Number(subjectId),
      material: material.trim(),
      theme: theme.trim() || undefined,
      teacherId: masterQuery.data?.isManager ? Number(teacherId) : undefined,
      lines: students.map((student) => ({
        studentId: student.id,
        attendance: statusesByStudent[student.id] ?? student.defaultAttendance,
        note: notesByStudent[student.id]?.trim() || "",
      })),
    }, {
      onSuccess: (result) => {
        toast.success(result.message || "Absensi berhasil disimpan.");
        navigate("/guru-akademik/absensi", { replace: true });
      },
      onError: (error) => toast.error(getOdooErrorMessage(error, "Gagal menyimpan absensi.")),
    });
  }

  return (
    <div className="mx-auto min-h-svh max-w-[430px] bg-[#EFF6FF]">
      <GuruAkademikHeader title="Absensi Siswa" subtitle="Kelola Absensi Siswa" onBack={() => navigate("/guru-akademik/absensi")} />
      {masterQuery.isLoading ? <div className="flex min-h-48 items-center justify-center"><Loader2 className="size-7 animate-spin text-[#288DE5]" aria-label="Memuat data form" /></div> : null}
      {masterQuery.isError ? <div className="px-4 py-5"><ErrorState message={getOdooErrorMessage(masterQuery.error, "Master data absensi gagal dimuat.")} onRetry={() => void masterQuery.refetch()} /></div> : null}
      {masterQuery.data ? (
        <>
          <section className="px-4 pt-5">
            <Card className="relative space-y-5 overflow-visible rounded-[22px] border-0 p-4 shadow-sm">
              <Field label="Tanggal"><Input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="h-12" /></Field>
              <InlineSearchSelectField id="class" label="Kelas" value={classId} onValueChange={selectClass} placeholder="Pilih kelas" options={masterQuery.data.classes.map((item) => ({ value: String(item.id), label: item.name }))} open={openPicker === "class"} onOpenChange={(open) => setOpenPicker(open ? "class" : null)} />
              <InlineSearchSelectField id="lesson" label="Jam Pelajaran" value={lessonPeriodId} onValueChange={setLessonPeriodId} placeholder="Pilih jam" options={masterQuery.data.lessonPeriods.map((item) => ({ value: String(item.id), label: item.name }))} open={openPicker === "lesson"} onOpenChange={(open) => setOpenPicker(open ? "lesson" : null)} />
              <InlineSearchSelectField id="subject" label="Mata Pelajaran" value={subjectId} onValueChange={setSubjectId} placeholder="Pilih mata pelajaran" options={masterQuery.data.subjects.map((item) => ({ value: String(item.id), label: item.name }))} open={openPicker === "subject"} onOpenChange={(open) => setOpenPicker(open ? "subject" : null)} />
              {masterQuery.data.isManager ? (
                <InlineSearchSelectField id="teacher" label="Guru Pengajar *" value={teacherId} onValueChange={setTeacherId} placeholder="Pilih guru" options={masterQuery.data.teachers.map((item) => ({ value: String(item.id), label: item.nip ? `${item.name} (${item.nip})` : item.name }))} open={openPicker === "teacher"} onOpenChange={(open) => setOpenPicker(open ? "teacher" : null)} />
              ) : (
                <Field label="Guru Pengajar"><Input value={masterQuery.data.currentTeacher?.name || "Guru login tidak terdeteksi"} readOnly className="h-12 bg-slate-50 text-slate-600" /></Field>
              )}
            </Card>
          </section>
          <Tabs defaultValue="attendance" className="px-4 py-5 pb-24">
            <TabsList className="grid h-12 w-full grid-cols-2 rounded-full bg-slate-100 p-1">
              <TabsTrigger value="attendance" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Absensi Siswa</TabsTrigger>
              <TabsTrigger value="material" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">Materi</TabsTrigger>
            </TabsList>
            <TabsContent value="attendance" className="pt-5">
              <Card className="rounded-[22px] border-0 p-4 shadow-sm">
                <h2 className="mb-3 text-[15px] font-bold text-black">Daftar Siswa</h2>
                {studentsQuery.isFetching ? <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin text-[#288DE5]" aria-label="Memuat siswa" /></div> : null}
                {studentsQuery.isError ? <ErrorState message={getOdooErrorMessage(studentsQuery.error, "Daftar siswa gagal dimuat.")} onRetry={() => void studentsQuery.refetch()} /> : null}
                {!classId ? <p className="py-10 text-center text-sm leading-6 text-slate-400">Pilih kelas terlebih dahulu untuk menampilkan daftar siswa.</p> : null}
                {classId && !studentsQuery.isFetching && !studentsQuery.isError && !students.length ? <p className="py-10 text-center text-sm text-slate-400">Tidak ada siswa aktif pada kelas ini.</p> : null}
                {students.length ? <div className="space-y-3">{students.map((student) => {
                  const attendance = statusesByStudent[student.id] ?? student.defaultAttendance;
                  return <div key={student.id} className="space-y-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0"><div className="flex items-center gap-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{student.name}</p><p className="text-xs text-slate-400">NIS: {student.nis || "-"}</p></div><Select value={attendance} onValueChange={(value) => setStatusesByStudent((current) => ({ ...current, [student.id]: value as AcademicAttendanceStatus }))}><SelectTrigger className="h-9 w-24"><SelectValue /></SelectTrigger><SelectContent>{statuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>{attendance !== "Hadir" ? <Input value={notesByStudent[student.id] ?? ""} onChange={(event) => setNotesByStudent((current) => ({ ...current, [student.id]: event.target.value }))} placeholder="Keterangan (opsional)" className="h-9 text-xs" /> : null}</div>;
                })}</div> : null}
              </Card>
            </TabsContent>
            <TabsContent value="material" className="pt-5">
              <Card className="space-y-4 rounded-[22px] border-0 p-4 shadow-sm">
                <Field label="Tema"><Input value={theme} onChange={(event) => setTheme(event.target.value)} placeholder="Masukkan tema pembelajaran (opsional)" /></Field>
                <Field label="Materi *"><Textarea value={material} onChange={(event) => setMaterial(event.target.value)} placeholder="Masukkan materi pembelajaran" className="min-h-28" /></Field>
              </Card>
            </TabsContent>
          </Tabs>
          <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 p-3"><div className="mx-auto max-w-[430px]"><Button type="button" onClick={submit} disabled={create.isPending || studentsQuery.isFetching} className="h-12 w-full rounded-2xl bg-[#288DE5] font-bold">{create.isPending ? "Menyimpan..." : "Simpan Absensi"}</Button></div></div>
        </>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="text-xs font-bold text-slate-500">{label}</span>{children}</label>;
}

function InlineSearchSelectField({ id, label, value, onValueChange, placeholder, options, open, onOpenChange }: { id: string; label: string; value: string; onValueChange: (value: string) => void; placeholder: string; options: Array<{ value: string; label: string }>; open: boolean; onOpenChange: (open: boolean) => void }) {
  const [search, setSearch] = useState("");
  const selected = options.find((option) => option.value === value);
  const filteredOptions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return keyword ? options.filter((option) => option.label.toLowerCase().includes(keyword)) : options;
  }, [options, search]);
  const selectOption = (nextValue: string) => {
    onValueChange(nextValue);
    setSearch("");
    onOpenChange(false);
  };

  return <div className="relative space-y-2"><span className="block text-xs font-bold text-slate-500">{label}</span><button id={id} type="button" onClick={() => onOpenChange(!open)} className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left text-sm text-slate-700"><span className={`min-w-0 flex-1 truncate ${selected ? "font-medium" : "text-slate-400"}`}>{selected?.label || placeholder}</span><ChevronDown className={`size-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} /></button>{open ? <div className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-30 overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-xl"><div className="flex h-10 items-center gap-2 rounded-xl bg-slate-50 px-3"><Search className="size-4 shrink-0 text-slate-400" /><Input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Cari ${label.toLowerCase()}...`} className="h-full border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0" /></div><div className="mt-2 max-h-48 overflow-y-auto"><div className="space-y-1">{filteredOptions.map((option) => <button key={option.value} type="button" onClick={() => selectOption(option.value)} className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 hover:bg-blue-50"><span className="min-w-0 flex-1 break-words">{option.label}</span>{option.value === value ? <Check className="size-4 shrink-0 text-[#288DE5]" /> : null}</button>)}{!filteredOptions.length ? <p className="px-3 py-6 text-center text-sm text-slate-400">Data tidak ditemukan.</p> : null}</div></div></div> : null}</div>;
}
