import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackMusyrifPerijinan } from "../../application/musyrif-fallback-data";
import { useMusyrifPerijinanList } from "../../application/musyrif-queries";
import { MusyrifHeader } from "../components/musyrif-header";
import { PerijinanCard } from "../components/perijinan-card";

export function MusyrifPerijinanListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [range, setRange] = useState("all");
  const query = useMusyrifPerijinanList(status);
  const isFallbackMode = query.isError && isDemoFallbackEnabled();
  const source = useMemo(
    () => query.data ?? (isFallbackMode ? fallbackMusyrifPerijinan : []),
    [query.data, isFallbackMode],
  );

  const items = useMemo(() => {
    const keyword = search.toLowerCase();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return source.filter((item) => {
      const matchesSearch = [item.name, item.santriName, item.nis].some((value) => value?.toLowerCase().includes(keyword));
      const matchesStatus = status === "all" || item.status === status;
      const itemDate = item.tanggalIzin ? new Date(item.tanggalIzin) : null;
      const dateOnly = itemDate ? new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate()) : null;
      const diffDays = dateOnly ? Math.round((today.getTime() - dateOnly.getTime()) / 86_400_000) : 0;
      const matchesRange =
        range === "all" ||
        (range === "today" && diffDays === 0) ||
        (range === "7days" && diffDays >= 0 && diffDays <= 7) ||
        (range === "30days" && diffDays >= 0 && diffDays <= 30);
      return matchesSearch && matchesStatus && matchesRange;
    });
  }, [range, search, source, status]);

  return (
    <main className="mx-auto max-w-[430px]">
      <MusyrifHeader
        title="Periksa Ijin Santri"
        subtitle="Kelola dan periksa ijin santri"
        onBack={() => navigate("/musyrif")}
      />
      <section className="mt-2 space-y-4 px-4 pb-24">
        <Card className="rounded-[22px] border-0 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Search className="size-4 text-slate-400" />
            <Input className="border-0 shadow-none focus-visible:ring-0" placeholder="Cari nama atau no. referensi..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full rounded-2xl bg-white h-11 px-4">
              <SelectValue placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="check">Check</SelectItem>
              <SelectItem value="approve">Approve</SelectItem>
              <SelectItem value="reject">Reject</SelectItem>
              <SelectItem value="selesai">Selesai</SelectItem>
            </SelectContent>
          </Select>

          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-full rounded-2xl bg-white h-11 px-4">
              <SelectValue placeholder="Semua" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="7days">7 Hari</SelectItem>
              <SelectItem value="30days">30 Hari</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {query.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-36 rounded-[22px]" />
            <Skeleton className="h-36 rounded-[22px]" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {query.isError ? (
              <Card className="rounded-[22px] border-0 bg-white p-4 text-sm text-amber-700 shadow-sm">
                {isFallbackMode ? "API belum bisa dimuat, jadi kartu contoh ditampilkan dulu." : "API belum bisa dimuat."}
              </Card>
            ) : null}
            {items.map((item) => <PerijinanCard key={item.id} item={item} />)}
            {!items.length ? <Card className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-slate-500">Belum ada perijinan.</Card> : null}
          </div>
        )}
      </section>

      <div className="fixed bottom-24 left-0 right-0 pointer-events-none z-30">
        <div className="mx-auto max-w-[430px] w-full px-4 flex justify-end">
          <Button asChild className="pointer-events-auto size-14 rounded-full bg-[#288DE5] hover:bg-[#1E74C5] text-white shadow-lg border-0 shadow-[#288DE5]/20">
            <Link to="/musyrif/perijinan/tambah">
              <Plus className="size-6" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
