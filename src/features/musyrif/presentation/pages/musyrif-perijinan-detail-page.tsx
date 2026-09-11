import { CheckCircle2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DetailPageSkeleton } from "@/components/feedback/page-skeletons";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackMusyrifPerijinan } from "../../application/musyrif-fallback-data";
import { useCheckMusyrifPerijinan, useMusyrifPerijinanDetail } from "../../application/musyrif-queries";
import { MusyrifHeader } from "../components/musyrif-header";
import { MusyrifStatusBadge } from "../components/musyrif-status-badge";

function formatDateDisplay(value?: string) {
  if (!value || value === "-") return "-";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-[1fr_1.25fr] gap-4 py-2 text-[15px]">
      <span className="font-medium text-slate-400">{label}</span>
      <span className="font-semibold leading-snug text-slate-800">{value || "-"}</span>
    </div>
  );
}

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
    checkMutation.mutate(
      { izin_id: data.id },
      {
        onSuccess: () => {
          toast.success("Perijinan berhasil dicek.");
          void query.refetch();
        },
        onError: () => toast.error("Gagal check perijinan. Coba lagi nanti."),
      },
    );
  };

  return (
    <div className="relative mx-auto flex h-svh max-w-[430px] flex-col bg-[#EFF6FF]">
      <div className="z-40 shrink-0">
        <MusyrifHeader
          title={data?.name ?? "Detail Perizinan"}
          subtitle={data?.statusLabel ?? "Detail perijinan santri"}
          onBack={() => navigate("/musyrif/perijinan")}
        />
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <section className="space-y-4 px-4 py-6">
          {isInvalidId ? (
            <Card className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-red-600 shadow-sm">
              ID perijinan tidak valid.
            </Card>
          ) : null}
          {query.isLoading ? <DetailPageSkeleton /> : null}
          {query.isError && fallback ? (
            <Card className="rounded-[22px] border-0 bg-white p-4 text-sm text-amber-700 shadow-sm">
              Detail contoh ditampilkan karena API belum tersedia. Action dinonaktifkan pada data fallback.
            </Card>
          ) : null}
          {query.isError && !fallback ? (
            <Card className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-red-600 shadow-sm">
              Gagal memuat detail perijinan.
            </Card>
          ) : null}
          {!query.isLoading && !query.isError && !data ? (
            <Card className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-slate-500 shadow-sm">
              Perijinan tidak ditemukan.
            </Card>
          ) : null}

          {data ? (
            <>
              <div className="flex justify-start">
                <MusyrifStatusBadge status={data.status} label={data.statusLabel} />
              </div>

              <Card className="space-y-4 rounded-[24px] border-0 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-black text-slate-900">Data Santri</h3>
                <div>
                  <DetailRow label="Nama" value={data.santriName} />
                  <DetailRow label="Kelas" value={data.kelas} />
                  <DetailRow label="Kamar" value={data.kamar} />
                </div>
              </Card>

              <Card className="space-y-4 rounded-[24px] border-0 bg-white p-6 shadow-sm">
                <h3 className="text-xl font-black text-slate-900">Detail Pengajuan</h3>
                <div>
                  <DetailRow label="Tanggal Ijin" value={formatDateDisplay(data.tanggalIzin)} />
                  <DetailRow label="Tanggal Kembali" value={formatDateDisplay(data.tanggalKembali)} />
                  <DetailRow label="Lama" value={data.durasi} />
                  <DetailRow label="Keperluan" value={data.keperluan} />
                  <DetailRow label="Penjemput" value={data.penjemput} />
                  <DetailRow label="Jam Penjemputan" value={data.jamKeluar} />
                  <DetailRow label="Catatan" value={data.catatan} />
                </div>
              </Card>
            </>
          ) : null}
        </section>
      </div>

      {canCheck && !fallback ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mx-auto max-w-[430px]">
            <Button
              className="h-12 w-full rounded-2xl bg-blue-600 font-bold text-white hover:bg-blue-700"
              disabled={checkMutation.isPending}
              onClick={handleCheck}
            >
              <CheckCircle2 className="mr-2 size-5" />
              Ijin Diperiksa
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
