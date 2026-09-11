import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageLoadingState } from "@/components/feedback/page-loading-state";
import { GuruAkademikHeader } from "../components/guru-akademik-header";
import { AcademicAssessmentCard } from "../components/academic-assessment-card";
import { useAcademicAssessments } from "../../application/guru-akademik-queries";

export function AcademicAssessmentListPage() {
  const navigate = useNavigate(); const [search, setSearch] = useState(""); const query = useAcademicAssessments();
  const items = useMemo(() => (query.data ?? []).filter((item) => `${item.subjectName} ${item.className}`.toLowerCase().includes(search.toLowerCase())), [query.data, search]);
  return <main className="mx-auto min-h-svh max-w-[430px]"><GuruAkademikHeader title="Penilaian Akhir Guru" subtitle="Kelola penilaian akhir siswa" onBack={() => navigate("/guru-akademik")} /><section className="space-y-4 px-4 py-5 pb-24"><div className="flex h-12 items-center gap-2 rounded-2xl bg-white px-4 shadow-sm"><Search className="size-4 text-slate-400" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari mapel atau kelas..." className="h-auto border-0 p-0 shadow-none focus-visible:ring-0" /></div>{query.isLoading ? <PageLoadingState /> : items.length ? <div className="space-y-3">{items.map((item) => <AcademicAssessmentCard key={item.id} item={item} />)}</div> : <div className="rounded-2xl bg-white p-8 text-center text-sm font-medium text-slate-500">Belum ada data penilaian.</div>}</section><div className="fixed bottom-6 left-0 right-0 z-30 pointer-events-none"><div className="mx-auto flex max-w-[430px] justify-end px-4"><Button asChild className="pointer-events-auto size-14 rounded-full bg-[#288DE5] shadow-lg"><Link to="/guru-akademik/penilaian/tambah"><Plus className="size-6" /></Link></Button></div></div></main>;
}
