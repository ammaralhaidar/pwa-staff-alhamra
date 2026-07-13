import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorState } from "@/components/feedback/error-state";
import { PageLoadingState } from "@/components/feedback/page-loading-state";
import { getOdooErrorMessage } from "@/lib/helpers/odoo-response";
import { GuruAkademikHeader } from "../components/guru-akademik-header";
import {
  useAcademicAttendanceDetail,
  useDeleteAcademicAttendance,
  useFinalizeAcademicAttendance,
  useReopenAcademicAttendance,
  useUpdateAcademicAttendance,
} from "../../application/guru-akademik-queries";
import type { AcademicAttendanceStatus } from "../../domain/guru-akademik-types";

const statuses: AcademicAttendanceStatus[] = ["Hadir", "Izin", "Sakit", "Alpa"];

export function AcademicAttendanceDetailPage() {
  const navigate = useNavigate();
  const { attendanceId } = useParams();
  const parsedId = Number(attendanceId);
  const query = useAcademicAttendanceDetail(Number.isFinite(parsedId) && parsedId > 0 ? parsedId : undefined);
  const update = useUpdateAcademicAttendance();
  const finalize = useFinalizeAcademicAttendance();
  const reopen = useReopenAcademicAttendance();
  const remove = useDeleteAcademicAttendance();
  const [isEditing, setIsEditing] = useState(false);
  const [material, setMaterial] = useState("");
  const [theme, setTheme] = useState("");
  const [statusesByLine, setStatusesByLine] = useState<Record<number, AcademicAttendanceStatus>>({});
  const [notesByLine, setNotesByLine] = useState<Record<number, string>>({});
  const item = query.data;

  function startEditing() {
    if (!item) return;
    setMaterial(item.material.content);
    setTheme(item.material.theme ?? "");
    setStatusesByLine(Object.fromEntries(item.items.flatMap((line) => line.id ? [[line.id, line.status]] : [])));
    setNotesByLine(Object.fromEntries(item.items.flatMap((line) => line.id ? [[line.id, line.note ?? ""]] : [])));
    setIsEditing(true);
  }

  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    return <main className="mx-auto min-h-svh max-w-[430px] bg-[#EFF6FF]"><GuruAkademikHeader title="Detail Absensi" onBack={() => navigate("/guru-akademik/absensi")} /><div className="p-4"><ErrorState title="ID absensi tidak valid" message="Kembali ke daftar absensi dan pilih data yang tersedia." /></div></main>;
  }
  if (query.isLoading) return <PageLoadingState label="Memuat detail absensi..." />;
  if (query.isError) return <main className="mx-auto min-h-svh max-w-[430px] bg-[#EFF6FF]"><GuruAkademikHeader title="Detail Absensi" onBack={() => navigate("/guru-akademik/absensi")} /><div className="p-4"><ErrorState message={getOdooErrorMessage(query.error, "Detail absensi gagal dimuat.")} onRetry={() => void query.refetch()} /></div></main>;
  if (!item) return null;

  const recap = item.recap ?? {
    present: item.items.filter((line) => line.status === "Hadir").length,
    permitted: item.items.filter((line) => line.status === "Izin").length,
    sick: item.items.filter((line) => line.status === "Sakit").length,
    absent: item.items.filter((line) => line.status === "Alpa").length,
    total: item.items.length,
  };
  const isPending = update.isPending || finalize.isPending || reopen.isPending || remove.isPending;

  function saveChanges() {
    if (!item) return;
    if (!material.trim()) {
      toast.error("Materi wajib diisi.");
      return;
    }
    const editableLines = item.items.flatMap((line) => line.id ? [{ id: line.id, attendance: statusesByLine[line.id] ?? line.status, note: notesByLine[line.id]?.trim() ?? line.note ?? "" }] : []);
    update.mutate({ attendanceId: parsedId, material: material.trim(), theme: theme.trim() || undefined, lines: editableLines }, {
      onSuccess: (result) => {
        toast.success(result.message || "Absensi berhasil diperbarui.");
        setIsEditing(false);
      },
      onError: (error) => toast.error(getOdooErrorMessage(error, "Gagal memperbarui absensi.")),
    });
  }

  function finalizeItem() {
    if (!window.confirm("Finalisasi absensi ini? Data akan dikunci.")) return;
    finalize.mutate(parsedId, {
      onSuccess: (result) => toast.success(result.message),
      onError: (error) => toast.error(getOdooErrorMessage(error, "Gagal memfinalisasi absensi.")),
    });
  }

  function reopenItem() {
    reopen.mutate(parsedId, {
      onSuccess: (result) => toast.success(result.message),
      onError: (error) => toast.error(getOdooErrorMessage(error, "Gagal mengembalikan absensi ke draft.")),
    });
  }

  function deleteItem() {
    if (!window.confirm("Hapus absensi ini? Tindakan ini tidak dapat dibatalkan.")) return;
    remove.mutate(parsedId, {
      onSuccess: (result) => {
        toast.success(result.message);
        navigate("/guru-akademik/absensi", { replace: true });
      },
      onError: (error) => toast.error(getOdooErrorMessage(error, "Gagal menghapus absensi.")),
    });
  }

  const title = item.subjectName !== "-" ? item.subjectName : item.name || "Absensi Siswa";
  return (
    <main className="mx-auto min-h-svh max-w-[430px] bg-[#EFF6FF]">
      <GuruAkademikHeader title="Detail Absensi" subtitle={item.state === "done" ? "Absensi selesai" : "Absensi draft"} onBack={() => navigate("/guru-akademik/absensi")} />
      <section className="space-y-4 px-4 py-5 pb-32">
        <Card className="rounded-[22px] border-0 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3"><h2 className="text-[16px] font-bold">{title}</h2><span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${item.state === "done" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>{item.state === "done" ? "Selesai" : "Draft"}</span></div>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Tanggal" value={[item.day, item.date].filter(Boolean).join(", ") || "-"} />
            <Row label="Kelas" value={item.className} />
            <Row label="Jam Pelajaran" value={item.lessonPeriod > 0 ? `Jam ke-${item.lessonPeriod}` : "-"} />
            <Row label="Guru" value={item.teacherName} />
            <Row label="Pertemuan" value={item.meetingNumber > 0 ? `Ke-${item.meetingNumber}` : "-"} />
          </dl>
        </Card>
        <Card className="rounded-[22px] border-0 p-4 shadow-sm">
          <h2 className="text-[15px] font-bold">Materi</h2>
          {isEditing ? <div className="mt-3 space-y-3"><Field label="Tema"><Input value={theme} onChange={(event) => setTheme(event.target.value)} placeholder="Tema (opsional)" /></Field><Field label="Materi *"><Textarea value={material} onChange={(event) => setMaterial(event.target.value)} className="min-h-28" /></Field></div> : <><p className="mt-3 text-sm font-semibold">{item.material.content || "-"}</p>{item.material.theme ? <p className="mt-1 text-xs text-slate-500">Tema: {item.material.theme}</p> : null}</>}
        </Card>
        <Card className="rounded-[22px] border-0 p-4 shadow-sm">
          <h2 className="text-[15px] font-bold">Rekap Kehadiran</h2>
          <p className="mt-3 text-sm text-slate-600">Hadir {recap.present} • Izin {recap.permitted} • Sakit {recap.sick} • Alpa {recap.absent}</p>
          <div className="mt-4 space-y-3">{item.items.map((student) => {
            const lineId = student.id;
            const attendance = lineId ? statusesByLine[lineId] ?? student.status : student.status;
            return <div key={lineId ?? student.studentId} className="space-y-2 border-t border-slate-100 pt-3"><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{student.studentName}</p><p className="text-xs text-slate-400">{student.nis ? `NIS: ${student.nis}` : ""}</p></div>{isEditing && lineId ? <Select value={attendance} onValueChange={(value) => setStatusesByLine((current) => ({ ...current, [lineId]: value as AcademicAttendanceStatus }))}><SelectTrigger className="h-9 w-24"><SelectValue /></SelectTrigger><SelectContent>{statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select> : <span className="text-xs font-bold text-slate-600">{student.status}</span>}</div>{isEditing && lineId && attendance !== "Hadir" ? <Input value={notesByLine[lineId] ?? ""} onChange={(event) => setNotesByLine((current) => ({ ...current, [lineId]: event.target.value }))} placeholder="Keterangan (opsional)" className="h-9 text-xs" /> : !isEditing && student.note ? <p className="text-xs text-slate-500">{student.note}</p> : null}</div>;
          })}</div>
        </Card>
      </section>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 p-3"><div className="mx-auto flex max-w-[430px] gap-2">
        {isEditing ? <><Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isPending} className="h-11 flex-1 rounded-xl">Batal</Button><Button type="button" onClick={saveChanges} disabled={isPending} className="h-11 flex-[2] rounded-xl bg-[#288DE5]">Simpan Perubahan</Button></> : item.state === "draft" ? <><Button type="button" variant="outline" onClick={deleteItem} disabled={isPending} className="h-11 flex-1 rounded-xl border-red-200 text-red-600">Hapus</Button><Button type="button" variant="outline" onClick={startEditing} disabled={isPending} className="h-11 flex-1 rounded-xl">Edit</Button><Button type="button" onClick={finalizeItem} disabled={isPending} className="h-11 flex-[1.4] rounded-xl bg-[#288DE5]">Finalisasi</Button></> : <Button type="button" onClick={reopenItem} disabled={isPending} className="h-11 w-full rounded-xl bg-[#288DE5]">Kembalikan ke Draft</Button>}
      </div></div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4"><dt className="text-slate-400">{label}</dt><dd className="text-right font-semibold text-slate-700">{value || "-"}</dd></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5"><span className="text-xs font-bold text-slate-500">{label}</span>{children}</label>;
}
