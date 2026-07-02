import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackTahfidz } from "../../application/musyrif-fallback-data";
import { useTahfidzMusyrifList } from "../../application/musyrif-queries";
import { MusyrifHeader } from "../components/musyrif-header";
import { TahfidzCard } from "../components/tahfidz-card";

export function TahfidzListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const query = useTahfidzMusyrifList();
  const isFallbackMode = query.isError && isDemoFallbackEnabled();
  const source = useMemo(
    () => query.data ?? (isFallbackMode ? fallbackTahfidz : []),
    [query.data, isFallbackMode],
  );

  const items = useMemo(() => {
    const keyword = search.toLowerCase();
    return source.filter((item) => {
      return (
        item.surahName?.toLowerCase().includes(keyword) ||
        item.tanggal?.toLowerCase().includes(keyword)
      );
    });
  }, [search, source]);

  return (
    <main className="mx-auto max-w-[430px]">
      <MusyrifHeader
        title="Tahfidz Musyrif"
        subtitle="Setoran hafalan pribadi"
        onBack={() => navigate("/musyrif/data")}
      />
      
      <section className="mt-2 flex flex-col gap-4 px-4 pb-24">
        {/* Search Bar */}
        <Card className="rounded-[22px] border-0 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Search className="size-4 text-slate-400" />
            <Input 
              className="border-0 shadow-none focus-visible:ring-0" 
              placeholder="Cari surah..." 
              value={search} 
              onChange={(event) => setSearch(event.target.value)} 
            />
          </div>
        </Card>

        {query.isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-40 rounded-[22px]" />
            <Skeleton className="h-40 rounded-[22px]" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {query.isError ? (
              <Card className="rounded-[22px] border-0 bg-white p-4 text-sm text-amber-700 shadow-sm">
                {isFallbackMode ? "Data contoh ditampilkan karena API belum tersedia." : "Gagal memuat data tahfidz dari API."}
              </Card>
            ) : null}
            {items.map((item) => <TahfidzCard key={item.id} item={item} />)}
            {!items.length ? (
              <Card className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-slate-500">
                Belum ada data setoran tahfidz.
              </Card>
            ) : null}
          </div>
        )}
      </section>

      <div className="fixed bottom-24 left-0 right-0 pointer-events-none z-30">
        <div className="mx-auto max-w-[430px] w-full px-4 flex justify-end">
          <Button asChild className="pointer-events-auto size-14 rounded-full bg-[#288DE5] hover:bg-[#1E74C5] text-white shadow-lg border-0 shadow-[#288DE5]/20">
            <Link to="/musyrif/data/tahfidz/tambah">
              <Plus className="size-6" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
