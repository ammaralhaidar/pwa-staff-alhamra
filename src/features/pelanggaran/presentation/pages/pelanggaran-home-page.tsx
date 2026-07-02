import { useMemo, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackPelanggaranList } from "../../application/pelanggaran-fallback-data";
import { usePelanggaranList } from "../../application/pelanggaran-queries";
import type { Pelanggaran, PelanggaranAccessType, PelanggaranFilter } from "../../domain/pelanggaran-types";
import { PelanggaranCard } from "../components/pelanggaran-card";
import { PelanggaranFilterBar } from "../components/pelanggaran-filter-bar";
import { PelanggaranHeader } from "../components/pelanggaran-header";

const LIST_LIMIT = 50;

function searchableText(value: unknown) {
  return String(value ?? "").toLowerCase();
}

function withinRange(item: Pelanggaran, timeRange: PelanggaranFilter["timeRange"]) {
  if (timeRange === "all") return true;
  const date = new Date(item.tgl || item.tanggal);
  if (Number.isNaN(date.getTime())) return true;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((start.getTime() - itemDate.getTime()) / 86_400_000);
  if (timeRange === "today") return diff === 0;
  if (timeRange === "7days") return diff >= 0 && diff <= 7;
  return diff >= 0 && diff <= 30;
}

export function PelanggaranHomePage({ accessType }: { accessType: PelanggaranAccessType }) {
  const [filter, setFilter] = useState<PelanggaranFilter>({ search: "", timeRange: "today", status: "all" });
  const query = usePelanggaranList({
    state: filter.status,
    limit: LIST_LIMIT,
    offset: 0,
  });
  const isFallbackMode = query.isError && isDemoFallbackEnabled();
  const source = useMemo(() => (isFallbackMode ? fallbackPelanggaranList : query.data ?? []), [isFallbackMode, query.data]);
  const basePath = accessType === "pendidik" ? "/pelanggaran/pendidik" : "/pelanggaran";
  const title = accessType === "pendidik" ? "Pelanggaran Pendidik" : "Beranda Pelanggaran";

  const items = useMemo(() => {
    const keyword = filter.search.trim().toLowerCase();
    return source.filter((item) => {
      const matchesSearch = !keyword || [item.namaSantri, item.reference, item.noReferensi, item.namaPelanggaran].some((value) => searchableText(value).includes(keyword));
      const matchesStatus = filter.status === "all" || item.status === filter.status;
      return matchesSearch && matchesStatus && withinRange(item, filter.timeRange);
    });
  }, [filter, source]);

  const emptyMessage = useMemo(() => {
    if (filter.search.trim()) return "Data tidak ditemukan untuk pencarian ini.";
    if (filter.status !== "all" || filter.timeRange !== "all") return "Tidak ada data sesuai filter yang dipilih.";
    return "Belum ada data pelanggaran.";
  }, [filter.search, filter.status, filter.timeRange]);

  return (
    <main className="mx-auto max-w-[430px]">
      <PelanggaranHeader title={title} />
      <section className="space-y-4 px-4 py-5 pb-24">
        <PelanggaranFilterBar filter={filter} onChange={setFilter} />
        {query.isLoading ? (
          <div className="space-y-3"><Skeleton className="h-40 rounded-[22px]" /><Skeleton className="h-40 rounded-[22px]" /></div>
        ) : (
          <div className="space-y-3">
            {query.isError ? (
              <Card className="space-y-3 rounded-[22px] border-0 bg-white p-4 text-sm text-amber-700 shadow-sm">
                <p>
                  {isFallbackMode
                    ? "Gagal memuat data pelanggaran dari API. Data contoh ditampilkan agar tampilan tetap bisa dicek."
                    : "Gagal memuat data pelanggaran dari API."}
                </p>
                <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => query.refetch()}>
                  <RefreshCw className="mr-2 size-4" />
                  Coba lagi
                </Button>
              </Card>
            ) : null}
            {items.map((item) => <PelanggaranCard key={item.id} item={item} accessType={accessType} />)}
            {!items.length ? <Card className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-slate-500">{emptyMessage}</Card> : null}
          </div>
        )}
      </section>
      <div className="fixed bottom-24 left-0 right-0 pointer-events-none z-30">
        <div className="mx-auto max-w-[430px] w-full px-4 flex justify-end">
          <Button asChild className="pointer-events-auto size-14 rounded-full bg-[#288DE5] hover:bg-[#1E74C5] text-white shadow-lg border-0 shadow-[#288DE5]/20">
            <Link to={`${basePath}/tambah`}>
              <Plus className="size-6" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
