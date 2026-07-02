import { CheckCircle2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackMusyrifPerijinan } from "../../application/musyrif-fallback-data";
import { useCheckMusyrifPerijinan, useMusyrifPerijinanDetail } from "../../application/musyrif-queries";
import { MusyrifHeader } from "../components/musyrif-header";
import { MusyrifStatusBadge } from "../components/musyrif-status-badge";

export function MusyrifPerijinanDetailPage() {
  const navigate = useNavigate();
  const izinId = Number(useParams().izinId ?? 0);
  const query = useMusyrifPerijinanDetail(izinId);
  const checkMutation = useCheckMusyrifPerijinan();
  const fallback = query.isError && isDemoFallbackEnabled() ? fallbackMusyrifPerijinan.find((item) => item.id === izinId) : undefined;
  const data = query.data ?? fallback;
  const isInvalidId = !Number.isFinite(izinId) || izinId <= 0;
  const canCheck = data?.status === "draft";

  const handleCheck = () => {
    if (!data) return;
    checkMutation.mutate({ izin_id: data.id }, {
      onSuccess: () => {
        toast.success("Perijinan berhasil dicek.");
        void query.refetch();
      },
      onError: () => toast.error("Gagal check perijinan. Coba lagi nanti."),
    });
  };

  return (
    <div className="relative mx-auto flex h-svh max-w-[430px] flex-col bg-[#EFF6FF]">
      {/* Sticky Header */}
      <div className="shrink-0 z-40">
        <MusyrifHeader
          title="Detail Perizinan"
          subtitle="Detail perijinan santri"
          onBack={() => navigate("/musyrif/perijinan")}
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <section className="space-y-4 px-4 py-6">
          {isInvalidId ? (
            <Card className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-red-600 shadow-sm">ID perijinan tidak valid.</Card>
          ) : null}
          {query.isLoading ? (
            <Card className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-slate-500 shadow-sm">Memuat detail perijinan...</Card>
          ) : null}
          {query.isError && fallback ? <Card className="rounded-[22px] border-0 bg-white p-4 text-sm text-amber-700 shadow-sm">Detail contoh ditampilkan karena API belum tersedia. Action dinonaktifkan pada data fallback.</Card> : null}
          {query.isError && !fallback ? <Card className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-red-600 shadow-sm">Gagal memuat detail perijinan.</Card> : null}
          {!query.isLoading && !query.isError && !data ? <Card className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-slate-500 shadow-sm">Perijinan tidak ditemukan.</Card> : null}
          {data ? (
            <>
          <Card className="rounded-[24px] border-0 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Santri</p>
                <h2 className="text-xl font-black text-slate-900">{data.santriName}</h2>
                <p className="text-sm text-slate-500">{[data.nis, data.kelas].filter(Boolean).join(" • ")}</p>
              </div>
              <MusyrifStatusBadge status={data.status} label={data.statusLabel} />
            </div>
          </Card>

          <Card className="space-y-3 rounded-[24px] border-0 bg-white p-5 shadow-sm">
            <h3 className="font-black text-slate-900">Pengajuan Izin</h3>
            {[
              ["Tanggal", `${data.tanggalIzin || "-"} sampai ${data.tanggalKembali || "-"}`],
              ["Jam", `${data.jamKeluar || "--:--"} ${data.jamKembali ? `- ${data.jamKembali}` : ""}`],
              ["Penjemput", data.penjemput || "-"],
              ["Keperluan", data.keperluan || "-"],
              ["Catatan", data.catatan || "-"],
              ["Waktu Keluar", data.waktuKeluar || "-"],
              ["Waktu Kembali", data.waktuKembali || "-"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-400">{label}</p>
                <p className="mt-1 font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </Card>
            </>
          ) : null}
        </section>
      </div>

      {/* Sticky Bottom Button */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur z-30">
        <div className="mx-auto max-w-[430px]">
          <Button className="h-12 w-full rounded-2xl" disabled={!canCheck || checkMutation.isPending || Boolean(fallback)} onClick={handleCheck}>
            <CheckCircle2 className="mr-2 size-5" />
            {canCheck ? "Ijin Diperiksa" : "Tidak Ada Aksi"}
          </Button>
        </div>
      </div>
    </div>
  );
}
