import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDecidePerijinan, usePerijinanDetail } from "../../application/kesantrian-queries";
import type { Perijinan } from "../../domain/kesantrian-types";
import { DecisionDialog } from "../components/decision-dialog";
import { DetailInfoCard } from "../components/detail-info-card";
import { KesantrianHeader } from "../components/kesantrian-header";
import { ManagerNoteCard } from "../components/manager-note-card";
import { StatusBadge } from "../components/status-badge";

export function PerijinanDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const initial = location.state as Perijinan | undefined;
  const izinId = Number(params.izinId ?? initial?.id ?? 0);
  const isInvalidId = !Number.isFinite(izinId) || izinId <= 0;
  const { data, isLoading, error, refetch } = usePerijinanDetail(izinId);
  const decideMutation = useDecidePerijinan();
  const detail = data && data.id > 0 ? data : initial;
  const [note, setNote] = useState("");
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null);
  const isNotFound = !isInvalidId && !isLoading && !error && !detail;

  const canDecide = useMemo(
    () => detail?.status === "check",
    [detail?.status],
  );

  async function submitDecision(decisionNote?: string) {
    if (!detail || !dialog) return;
    try {
      await decideMutation.mutateAsync({
        izinId: detail.id,
        keputusan: dialog,
        catatan: dialog === "reject" ? decisionNote : note.trim() || undefined,
      });
      toast.success(dialog === "approve" ? "Perijinan telah disetujui" : "Perijinan telah ditolak");
      setNote("");
      setDialog(null);
      navigate("/kesantrian/perijinan");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memproses perijinan");
    }
  }

  return (
    <div className="relative mx-auto flex h-svh w-screen max-w-[430px] flex-col overflow-hidden bg-[#EFF6FF]">
      {/* Sticky Header */}
      <div className="shrink-0 z-40">
        <KesantrianHeader title="Detail Perijinan" description={detail?.reference} onBack={() => navigate("/kesantrian/perijinan")} />
      </div>

      {/* Scrollable Content */}
      <div className={`flex-1 overflow-y-auto ${canDecide ? "pb-24" : "pb-6"}`}>
        <section className="w-full space-y-4 px-4 py-5">
          {isInvalidId ? (
            <StateMessage title="ID perijinan tidak valid" description="Buka ulang data dari halaman daftar perijinan." />
          ) : null}
          {isLoading && !detail ? <Skeleton className="h-96 rounded-3xl bg-white/70" /> : null}
          {error && !detail ? (
            <StateMessage title="Gagal memuat detail" description={readableError(error)} actionLabel="Coba lagi" onAction={() => refetch()} />
          ) : null}
          {error && detail ? (
            <StateMessage
              title="Detail terbaru belum bisa dimuat"
              description="Menampilkan data awal dari halaman sebelumnya. Tekan coba lagi untuk mengambil data terbaru."
              actionLabel="Coba lagi"
              onAction={() => refetch()}
            />
          ) : null}
          {isNotFound ? <StateMessage title="Perijinan tidak ditemukan" description="Data mungkin sudah berubah atau tidak tersedia." /> : null}
          {detail ? (
            <>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">No. Referensi</p>
                    <h2 className="mt-1 break-words text-2xl font-bold leading-tight text-slate-900">{detail.reference}</h2>
                  </div>
                  <StatusBadge status={detail.status} label={detail.statusLabel} />
                </div>
              </div>

              {detail.status === "reject" && detail.alasanTolak ? (
                <DetailInfoCard title="Alasan Penolakan" items={[{ label: "Catatan", value: detail.alasanTolak }]} />
              ) : null}

              <DetailInfoCard
                title="Data Santri"
                items={[
                  { label: "Siswa", value: detail.namaSantri },
                  { label: "Kelas", value: detail.kelasSantri },
                  { label: "Kamar", value: detail.kamarSantri },
                  { label: "Halaqoh", value: detail.halaqohSantri },
                  { label: "Musyrif", value: detail.musyrifName },
                ]}
              />
              <DetailInfoCard
                title="Pengajuan Izin Santri"
                items={[
                  { label: "Tanggal Izin", value: formatDate(detail.tanggalIjin) },
                  { label: "Tanggal Kembali", value: detail.tanggalKembali ? formatDate(detail.tanggalKembali) : "-" },
                  { label: "Durasi", value: detail.durasi ?? calculateDuration(detail.tanggalIjin, detail.tanggalKembali) },
                  { label: "Penjemput", value: detail.penjemput },
                  { label: "Jam Penjemputan", value: detail.jamPenjemputan },
                  { label: "Keperluan", value: detail.keperluan },
                  { label: "Catatan", value: detail.catatan },
                ]}
              />
              {(detail.waktuKeluar || detail.waktuKembali || detail.terlambatHari) ? (
                <DetailInfoCard
                  title="Realisasi Keamanan"
                  items={[
                    { label: "Waktu Keluar", value: formatDateTime(detail.waktuKeluar) },
                    { label: "Waktu Kembali", value: formatDateTime(detail.waktuKembali) },
                    { label: "Terlambat", value: `${detail.terlambatHari ?? 0} hari` },
                  ]}
                />
              ) : null}
              <ManagerNoteCard value={note} onChange={setNote} readOnly={!canDecide} />
            </>
          ) : null}
        </section>
      </div>

      {canDecide ? (
        <div className="fixed bottom-0 left-1/2 z-30 w-screen max-w-[430px] -translate-x-1/2 border-t border-slate-100 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="destructive" className="h-11 rounded-2xl" onClick={() => setDialog("reject")}>
              Tolak
            </Button>
            <Button type="button" className="h-11 rounded-2xl bg-[#288DE5]" onClick={() => setDialog("approve")}>
              Setujui
            </Button>
          </div>
        </div>
      ) : null}

      <DecisionDialog
        open={dialog === "approve"}
        title="Setujui Perijinan?"
        description="Perijinan akan disetujui dan dapat diproses oleh petugas keamanan."
        confirmLabel="Setujui"
        loading={decideMutation.isPending}
        onOpenChange={(open) => setDialog(open ? "approve" : null)}
        onConfirm={submitDecision}
      />
      <DecisionDialog
        open={dialog === "reject"}
        title="Tolak Perijinan?"
        description="Tuliskan alasan penolakan agar pengajuan bisa dipahami oleh pihak terkait."
        confirmLabel="Tolak"
        requireNote
        loading={decideMutation.isPending}
        onOpenChange={(open) => setDialog(open ? "reject" : null)}
        onConfirm={submitDecision}
      />
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

function readableError(error: unknown) {
  const message = error instanceof Error ? error.message : "Terjadi kendala saat mengambil data.";
  if (message.toLowerCase().includes("session") || message.toLowerCase().includes("unauthorized")) {
    return "Sesi kamu sudah berakhir. Silakan login kembali.";
  }
  return message;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function calculateDuration(start: string, end?: string) {
  if (!end) return "-";
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return "-";
  const days = Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  return `${days} Hari`;
}
