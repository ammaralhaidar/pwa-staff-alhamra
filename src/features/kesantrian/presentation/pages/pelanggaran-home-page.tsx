import { useMemo, useState } from "react";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fallbackPelanggaranList } from "../../application/kesantrian-fallback-data";
import { usePelanggaranList } from "../../application/kesantrian-queries";
import type { TimeRangeFilter } from "../../domain/kesantrian-types";
import { KesantrianFilterBar } from "../components/kesantrian-filter-bar";
import { KesantrianHeader } from "../components/kesantrian-header";
import { PelanggaranCard } from "../components/pelanggaran-card";

const statusOptions = [
  { value: "all", label: "Semua" },
  { value: "draft", label: "Draft" },
  { value: "proses", label: "Proses" },
  { value: "validasi", label: "Validasi" },
  { value: "selesai", label: "Selesai" },
  { value: "batal", label: "Batal" },
];

export function PelanggaranHomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>("today");
  const [status, setStatus] = useState("all");
  const { data = [], isLoading, error, refetch } = usePelanggaranList({ state: status });
  const isUsingFallback = Boolean(error) && isDemoFallbackEnabled();
  const displayData = isUsingFallback ? fallbackPelanggaranList : data;

  const filteredData = useMemo(
    () =>
      displayData.filter((item) => {
        if (status !== "all" && item.status !== status) return false;
        if (!matchesTimeRange(item.tanggal, timeRange)) return false;
        const query = search.toLowerCase().trim();
        if (!query) return true;
        return (
          item.namaSantri.toLowerCase().includes(query) ||
          item.reference.toLowerCase().includes(query) ||
          item.namaPelanggaran.toLowerCase().includes(query)
        );
      }),
    [displayData, search, status, timeRange],
  );

  return (
    <main>
      <KesantrianHeader title="Pelanggaran Kesantrian" />
      <section className="mx-auto max-w-md space-y-4 px-4 py-5 pb-24">
        <KesantrianFilterBar
          search={search}
          onSearchChange={setSearch}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          status={status}
          onStatusChange={setStatus}
          statusOptions={statusOptions}
        />
        {isLoading ? <ListSkeleton /> : null}
        {error ? (
          <StateMessage
            title="API pelanggaran belum bisa dimuat"
            description="Menampilkan data contoh agar tampilan tetap bisa dicek. Data ini bukan data asli."
            actionLabel="Coba lagi"
            onAction={() => refetch()}
          />
        ) : null}
        {!isLoading && !error && filteredData.length === 0 ? (
          <StateMessage title={search || status !== "all" || timeRange !== "all" ? "Pelanggaran tidak ditemukan" : "Belum ada pelanggaran"} />
        ) : null}
        <div className="space-y-3">
          {filteredData.map((item) => (
            <PelanggaranCard
              key={item.id}
              item={item}
              onClick={() => navigate(`/kesantrian/pelanggaran/${item.id}`, { state: item })}
            />
          ))}
        </div>
      </section>
      <div className="fixed bottom-24 left-0 right-0 pointer-events-none z-30">
        <div className="mx-auto max-w-[430px] w-full px-4 flex justify-end">
          <Button
            type="button"
            onClick={() => {
              navigate("/kesantrian/pelanggaran/tambah");
            }}
            className="pointer-events-auto h-14 w-14 rounded-full bg-[#288DE5] p-0 shadow-[0_4px_14px_rgba(40,141,229,0.45)] text-white hover:bg-[#1F7CD4] flex items-center justify-center"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </main>
  );
}


function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <Skeleton key={item} className="h-36 rounded-3xl bg-white/70" />
      ))}
    </div>
  );
}

function StateMessage({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      {actionLabel ? (
        <Button type="button" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function matchesTimeRange(value: string, range: TimeRangeFilter) {
  if (range === "all") return true;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return true;
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = start.getTime() - new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  if (range === "today") return days === 0;
  if (range === "7days") return days >= 0 && days <= 7;
  return days >= 0 && days <= 30;
}
