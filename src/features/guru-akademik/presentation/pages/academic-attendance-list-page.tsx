import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageLoadingState } from "@/components/feedback/page-loading-state";
import { getOdooErrorMessage } from "@/lib/helpers/odoo-response";
import { GuruAkademikHeader } from "../components/guru-akademik-header";
import { AcademicAttendanceCard } from "../components/academic-attendance-card";
import { useAcademicAttendanceList, useAcademicAttendanceMasterData } from "../../application/guru-akademik-queries";
import type { AcademicAttendanceState } from "../../domain/guru-akademik-types";

const PAGE_SIZE = 20;

export function AcademicAttendanceListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [state, setState] = useState<AcademicAttendanceState | "semua">("semua");
  const [classId, setClassId] = useState("semua");
  const [subjectId, setSubjectId] = useState("semua");
  const [page, setPage] = useState(1);
  const masterQuery = useAcademicAttendanceMasterData();
  const params = useMemo(() => ({
    page,
    limit: PAGE_SIZE,
    status: state,
    classId: classId === "semua" ? undefined : Number(classId),
    subjectId: subjectId === "semua" ? undefined : Number(subjectId),
  }), [classId, page, state, subjectId]);
  const query = useAcademicAttendanceList(params);
  const items = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return query.data?.records ?? [];
    return (query.data?.records ?? []).filter((item) => `${item.name ?? ""} ${item.subjectName} ${item.className} ${item.teacherName}`.toLowerCase().includes(keyword));
  }, [query.data?.records, search]);
  const pagination = query.data?.pagination;

  function changeFilter(update: () => void) {
    setPage(1);
    update();
  }

  return (
    <main className="mx-auto min-h-svh max-w-[430px] bg-[#EFF6FF]">
      <GuruAkademikHeader title="Absensi Siswa" subtitle="Kelola kehadiran siswa" onBack={() => navigate("/guru-akademik")} />
      <section className="space-y-4 px-4 py-5 pb-24">
        <div className="flex h-12 items-center gap-2 rounded-2xl bg-white px-4 shadow-sm">
          <Search className="size-4 text-slate-400" />
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari mapel, kelas, atau guru..." className="h-auto border-0 p-0 shadow-none focus-visible:ring-0" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Filter value={state} onChange={(value) => changeFilter(() => setState(value as AcademicAttendanceState | "semua"))} options={[["semua", "Semua"], ["draft", "Draft"], ["done", "Selesai"]]} />
          <Filter value={classId} onChange={(value) => changeFilter(() => setClassId(value))} options={[["semua", "Kelas"], ...(masterQuery.data?.classes ?? []).map((item) => [String(item.id), item.name])]} />
          <Filter value={subjectId} onChange={(value) => changeFilter(() => setSubjectId(value))} options={[["semua", "Mapel"], ...(masterQuery.data?.subjects ?? []).map((item) => [String(item.id), item.name])]} />
        </div>
        {query.isLoading ? <PageLoadingState label="Memuat riwayat absensi..." /> : null}
        {query.isError ? <ErrorState message={getOdooErrorMessage(query.error, "Riwayat absensi gagal dimuat.")} onRetry={() => void query.refetch()} /> : null}
        {!query.isLoading && !query.isError && items.length ? <div className="space-y-3">{items.map((item) => <AcademicAttendanceCard key={item.id} item={item} />)}</div> : null}
        {!query.isLoading && !query.isError && !items.length ? <EmptyState title="Belum ada data absensi" description={search ? "Tidak ada data yang cocok dengan pencarian." : "Tekan tombol tambah untuk membuat absensi siswa."} /> : null}
        {pagination && pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1 || query.isFetching} onClick={() => setPage((current) => current - 1)}><ChevronLeft className="size-4" />Sebelumnya</Button>
            <span className="text-xs font-semibold text-slate-500">{pagination.page} / {pagination.totalPages}</span>
            <Button type="button" variant="outline" size="sm" disabled={page >= pagination.totalPages || query.isFetching} onClick={() => setPage((current) => current + 1)}>Berikutnya<ChevronRight className="size-4" /></Button>
          </div>
        ) : null}
      </section>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30">
        <div className="mx-auto flex max-w-[430px] justify-end px-4"><Button asChild className="pointer-events-auto size-14 rounded-full bg-[#288DE5] shadow-lg"><Link to="/guru-akademik/absensi/tambah" aria-label="Tambah absensi"><Plus className="size-6" /></Link></Button></div>
      </div>
    </main>
  );
}

function Filter({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[][] }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger className="h-9 w-full bg-white text-xs"><SelectValue /></SelectTrigger><SelectContent>{options.map(([id, label]) => <SelectItem key={id} value={id}>{label}</SelectItem>)}</SelectContent></Select>;
}
