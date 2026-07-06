import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackPerijinanList } from "../../application/kesantrian-fallback-data";
import { usePerijinanList } from "../../application/kesantrian-queries";
import type { TimeRangeFilter } from "../../domain/kesantrian-types";
import { KesantrianFilterBar } from "../components/kesantrian-filter-bar";
import { KesantrianHeader } from "../components/kesantrian-header";
import { PerijinanCard } from "../components/perijinan-card";

const statusOptions = [
  { value: "all", label: "Semua" },
  { value: "draft", label: "Draft" },
  { value: "check", label: "Menunggu" },
  { value: "approve", label: "Disetujui" },
  { value: "reject", label: "Ditolak" },
  { value: "keluar", label: "Keluar" },
  { value: "kembali", label: "Kembali" },
  { value: "selesai", label: "Selesai" },
];

export function PerijinanHomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>("today");
  const [status, setStatus] = useState("all");
  const { data = [], isLoading, error, refetch } = usePerijinanList({ state: status });
  const isUsingFallback = Boolean(error) && isDemoFallbackEnabled();
  const displayData = isUsingFallback ? fallbackPerijinanList : data;

  const filteredData = useMemo(
    () =>
      displayData.filter((item) => {
        if (status !== "all" && item.status !== status) return false;
        if (!matchesTimeRange(item.tanggalIjin, timeRange)) return false;

        const query = search.toLowerCase().trim();
        if (!query) return true;
        return (
          item.namaSantri.toLowerCase().includes(query) ||
          item.reference.toLowerCase().includes(query)
        );
      }),
    [displayData, search, status, timeRange],
  );

  return (
    <main>
      <KesantrianHeader title="Perijinan Kesantrian" />
      <section className="mx-auto max-w-md space-y-4 px-4 py-5">
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
            title="API perijinan belum bisa dimuat"
            description={isUsingFallback ? "Menampilkan data contoh agar tampilan tetap bisa dicek. Data ini bukan data asli." : "Silakan coba lagi atau periksa koneksi API."}
            actionLabel="Coba lagi"
            onAction={() => refetch()}
          />
        ) : null}
        {!isLoading && !error && filteredData.length === 0 ? (
          <StateMessage title={search || status !== "all" || timeRange !== "all" ? "Perijinan tidak ditemukan" : "Belum ada perijinan"} />
        ) : null}
        <div className="space-y-3">
          {filteredData.map((item) => (
            <PerijinanCard
              key={item.id}
              item={item}
              onClick={() => navigate(`/kesantrian/perijinan/${item.id}`, { state: item })}
            />
          ))}
        </div>
      </section>
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
