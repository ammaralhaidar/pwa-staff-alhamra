import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackMusyrifStudents } from "../../application/musyrif-fallback-data";
import { useMusyrifStudents } from "../../application/musyrif-queries";
import { MusyrifHeader } from "../components/musyrif-header";
import { SantriCard } from "../components/santri-card";

export function SantriListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const query = useMusyrifStudents(search);
  const isFallbackMode = query.isError && isDemoFallbackEnabled();
  const source = useMemo(
    () => query.data ?? (isFallbackMode ? fallbackMusyrifStudents : []),
    [query.data, isFallbackMode],
  );
  const items = useMemo(() => {
    const keyword = search.toLowerCase();
    return source.filter((item) => [item.name, item.nis, item.kelas, item.kamar].some((value) => value?.toLowerCase().includes(keyword)));
  }, [search, source]);

  return (
    <main className="mx-auto max-w-[430px]">
      <MusyrifHeader
        title="Cek Santri"
        subtitle="Informasi dan keuangan santri"
        onBack={() => navigate("/musyrif")}
      />

      <section className="mt-2 flex flex-col gap-4 px-4 pb-24">
        {/* Search Bar */}
        <Card className="rounded-[22px] border-0 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Search className="size-4 text-slate-400" />
            <Input
              className="border-0 shadow-none focus-visible:ring-0 text-sm h-auto p-0"
              placeholder="Cari nama santri atau no induk..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </Card>

        {query.isLoading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {query.isError ? (
              <Card hasRing={false} className="rounded-2xl border-0 bg-white p-4 text-sm leading-relaxed text-amber-700 shadow-sm">
                {isFallbackMode ? "Data contoh ditampilkan karena API belum tersedia." : "Gagal memuat data santri dari API."}
              </Card>
            ) : null}
            <div className="flex flex-col gap-4">
              {items.map((student) => <SantriCard key={student.id} student={student} />)}
              {!items.length ? (
                <Card hasRing={false} className="rounded-2xl border-0 bg-white p-5 text-center font-medium text-slate-500 shadow-sm text-sm">
                  Tidak ada data santri.
                </Card>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
