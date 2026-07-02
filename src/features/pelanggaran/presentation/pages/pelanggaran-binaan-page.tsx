import { RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackPelanggaranList } from "../../application/pelanggaran-fallback-data";
import { usePelanggaranList } from "../../application/pelanggaran-queries";
import { PelanggaranCard } from "../components/pelanggaran-card";
import { PelanggaranHeader } from "../components/pelanggaran-header";

export function PelanggaranBinaanPage() {
  const query = usePelanggaranList({ state: "validasi", isMySantri: true });
  const isFallbackMode = query.isError && isDemoFallbackEnabled();
  const items = isFallbackMode ? fallbackPelanggaranList.filter((item) => item.status === "validasi") : query.data ?? [];

  return (
    <main className="mx-auto max-w-[430px]">
      <PelanggaranHeader title="Approval Binaan" />
      <section className="space-y-3 px-4 py-6">
        {query.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-40 rounded-[22px]" />
            <Skeleton className="h-40 rounded-[22px]" />
          </div>
        ) : null}
        {query.isError ? (
          <Card className="space-y-3 rounded-[22px] border-0 bg-white p-4 text-sm text-amber-700 shadow-sm">
            <p>{isFallbackMode ? "Gagal memuat data binaan dari API. Data contoh ditampilkan agar tampilan tetap bisa dicek." : "Gagal memuat data binaan dari API."}</p>
            <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => query.refetch()}>
              <RefreshCw className="mr-2 size-4" />
              Coba lagi
            </Button>
          </Card>
        ) : null}
        {items.map((item) => <PelanggaranCard key={item.id} item={item} accessType="biasa" />)}
        {!query.isLoading && !items.length ? <Card className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-slate-500">Tidak ada data binaan/validasi.</Card> : null}
      </section>
    </main>
  );
}
