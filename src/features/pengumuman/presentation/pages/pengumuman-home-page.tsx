import { useMemo, useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveStoredRoleFlags } from "@/lib/storage";
import { usePengumumanList } from "../../application/pengumuman-queries";
import type { PengumumanFilter } from "../../domain/pengumuman-types";
import { PengumumanCard } from "../components/pengumuman-card";
import { PengumumanHeader } from "../components/pengumuman-header";

export function PengumumanHomePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<PengumumanFilter>({
    search: "",
    kategori: "semua",
    state: "all",
  });

  const query = usePengumumanList({ kategori: filter.kategori, state: filter.state });
  const userRoles = useMemo(() => resolveStoredRoleFlags(), []);
  const canCreate = Boolean(
    userRoles?.can_manage_pengumuman ||
      userRoles?.is_pengumuman_staff ||
      userRoles?.is_pengumuman_manager ||
      userRoles?.is_manajer_kesantrian
  );

  const filteredItems = useMemo(() => {
    if (!query.data) return [];
    const keyword = filter.search.trim().toLowerCase();

    return query.data.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        (item.preview && item.preview.toLowerCase().includes(keyword));
      return matchesSearch;
    });
  }, [query.data, filter.search]);

  return (
    <main className="mx-auto w-full max-w-[430px] min-h-svh bg-[#f8fbff] text-slate-900 pb-24 font-sans overflow-x-hidden">
      <PengumumanHeader
        title="Pengumuman"
        subtitle="Kelola Artikel & Pengumuman"
        onBack={() => navigate("/roles")}
        showRoleButton={true}
      />

      <section className="w-full flex flex-col gap-3.5 px-4 py-4">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari judul pengumuman..."
            value={filter.search}
            onChange={(e) => setFilter((prev) => ({ ...prev, search: e.target.value }))}
            className="w-full pl-9.5 bg-white border-slate-200 shadow-sm rounded-xl text-sm"
          />
        </div>

        {/* State Filter Tabs (Semua / Published / Draft) */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-200/60 rounded-xl text-xs font-semibold">
          {[
            { id: "all", label: "Semua" },
            { id: "published", label: "Dipublikasikan" },
            { id: "draft", label: "Draf" },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setFilter((prev) => ({ ...prev, state: st.id }))}
              className={`py-1.5 rounded-lg text-center transition ${
                filter.state === st.id ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full">
          {[
            { id: "semua", label: "Semua Kategori" },
            { id: "kesantrian", label: "Kesantrian" },
            { id: "akademik", label: "Akademik" },
            { id: "keuangan", label: "Keuangan" },
            { id: "umum", label: "Umum" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter((prev) => ({ ...prev, kategori: tab.id }))}
              className={`shrink-0 rounded-full px-3.5 py-1 text-[11px] font-semibold transition ${
                filter.kategori === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content List */}
        {query.isLoading ? (
          <div className="space-y-3 w-full">
            {[1, 2, 3].map((n) => (
              <Skeleton key={n} className="h-28 w-full rounded-2xl bg-slate-200/70" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="w-full rounded-2xl border border-red-200 bg-red-50/80 p-5 text-center shadow-sm">
            <p className="text-sm text-red-700 font-semibold">Gagal memuat pengumuman.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => query.refetch()}
              className="mt-3 border-red-200 text-red-700 hover:bg-red-100 rounded-xl"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Coba Lagi
            </Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="w-full rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
            <p className="text-sm font-bold text-slate-800">Belum ada pengumuman</p>
            <p className="mt-1 text-xs text-slate-500">Tidak ada pengumuman yang sesuai dengan kriteria filter.</p>
          </div>
        ) : (
          <div className="space-y-3 w-full">
            {filteredItems.map((item) => (
              <PengumumanCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* Floating Action Button (FAB) + Buat Pengumuman */}
      {canCreate && (
        <div className="fixed bottom-24 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
          <div className="w-full max-w-[430px] flex justify-end px-4">
            <Link to="/pengumuman/buat" className="pointer-events-auto">
              <Button className="h-12 px-5 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl flex items-center gap-2 font-semibold">
                <Plus className="h-5 w-5 stroke-[2.5]" />
                Buat Artikel
              </Button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
