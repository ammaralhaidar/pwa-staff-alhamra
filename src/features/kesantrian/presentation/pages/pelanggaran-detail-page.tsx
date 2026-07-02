import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCancelPelanggaran,
  useDecidePelanggaran,
  usePelanggaranDetail,
  useProcessPelanggaran,
  useTindakanOptions,
} from "../../application/kesantrian-queries";
import type { Pelanggaran, PelanggaranDecision } from "../../domain/kesantrian-types";
import { DecisionDialog } from "../components/decision-dialog";
import { DetailInfoCard } from "../components/detail-info-card";
import { KesantrianHeader } from "../components/kesantrian-header";
import { ManagerNoteCard } from "../components/manager-note-card";
import { StatusBadge } from "../components/status-badge";
import { TindakanPicker } from "../components/tindakan-picker";

export function PelanggaranDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const initial = location.state as Pelanggaran | undefined;
  const pelanggaranId = Number(params.pelanggaranId ?? initial?.id ?? 0);
  const isInvalidId = !Number.isFinite(pelanggaranId) || pelanggaranId <= 0;
  const { data, isLoading, error, refetch } = usePelanggaranDetail(pelanggaranId);
  const {
    data: tindakanOptions = [],
    isLoading: isLoadingTindakan,
    error: tindakanError,
    refetch: refetchTindakan,
  } = useTindakanOptions();
  const processMutation = useProcessPelanggaran();
  const decideMutation = useDecidePelanggaran();
  const cancelMutation = useCancelPelanggaran();
  const detail = data && data.id > 0 ? data : initial;
  const [tindakanIdDraft, setTindakanIdDraft] = useState<number | undefined>();
  const [deskripsiTindakanDraft, setDeskripsiTindakanDraft] = useState<string | undefined>();
  const [managerNoteDraft, setManagerNoteDraft] = useState<string | undefined>();
  const [dialog, setDialog] = useState<PelanggaranDecision | "cancel" | null>(null);
  const isNotFound = !isInvalidId && !isLoading && !error && !detail;
  const tindakanId = tindakanIdDraft ?? detail?.infoTindakan?.tindakanId;
  const deskripsiTindakan = deskripsiTindakanDraft ?? detail?.infoTindakan?.deskripsiTindakan ?? "";
  const managerNote = managerNoteDraft ?? detail?.keputusan?.catatanKaAsrama ?? "";

  async function submitProcess() {
    if (!detail) return;
    if (!tindakanId || !deskripsiTindakan.trim()) {
      toast.error("Pilih tindakan dan isi deskripsi tindakan");
      return;
    }
    try {
      await processMutation.mutateAsync({
        pelanggaranId: detail.id,
        tindakanId,
        deskripsiTindakan,
      });
      toast.success("Pelanggaran berhasil divalidasi");
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memproses pelanggaran");
    }
  }

  async function submitDecision(note?: string) {
    if (!detail || !dialog) return;
    if (dialog === "cancel") return;
    try {
      await decideMutation.mutateAsync({
        pelanggaranId: detail.id,
        keputusan: dialog,
        catatanManager: dialog === "tolak" ? note : managerNote.trim() || undefined,
      });
      toast.success(getDecisionSuccessMessage(dialog));
      setDialog(null);
      navigate("/kesantrian/pelanggaran");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memproses keputusan");
    }
  }

  async function submitCancel(note?: string) {
    if (!detail) return;
    try {
      await cancelMutation.mutateAsync({
        pelanggaranId: detail.id,
        alasan: note,
      });
      toast.success("Pelanggaran berhasil dibatalkan");
      setDialog(null);
      navigate("/kesantrian/pelanggaran");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membatalkan pelanggaran");
    }
  }

  return (
    <div className="relative mx-auto flex h-svh max-w-[430px] flex-col bg-[#EFF6FF]">
      {/* Sticky Header */}
      <div className="shrink-0 z-40">
        <KesantrianHeader title="Detail Pelanggaran" description={detail?.reference} onBack={() => navigate("/kesantrian/pelanggaran")} />
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto pb-24">
        <section className="mx-auto max-w-md space-y-4 px-4 py-5">
          {isInvalidId ? (
            <StateMessage title="ID pelanggaran tidak valid" description="Buka ulang data dari halaman daftar pelanggaran." />
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
          {isNotFound ? <StateMessage title="Pelanggaran tidak ditemukan" description="Data mungkin sudah berubah atau tidak tersedia." /> : null}
          {detail ? (
            <>
              <div className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm">
                <div>
                  <p className="text-xs text-slate-400">{detail.reference}</p>
                  <h2 className="text-lg font-bold text-slate-900">{detail.namaSantri}</h2>
                </div>
                <StatusBadge status={detail.status} label={detail.statusLabel} />
              </div>

              <DetailInfoCard
                title="Data Santri"
                items={[
                  { label: "Siswa", value: detail.namaSantri },
                  { label: "Kelas", value: detail.kelasSantri },
                  { label: "Pelapor", value: detail.pelaporName },
                  { label: "Tanggal", value: formatDate(detail.tanggal) },
                ]}
              />
              <DetailInfoCard
                title="Data Pelanggaran"
                items={[
                  { label: "Pelanggaran", value: detail.namaPelanggaran },
                  { label: "Jenis", value: detail.jenisPelanggaran },
                  { label: "Kategori", value: detail.kategori },
                  { label: "Poin", value: detail.poin },
                  { label: "Deskripsi", value: detail.deskripsi },
                ]}
              />

              <section className="space-y-4 rounded-3xl bg-white p-4 shadow-sm">
                <h3 className="font-semibold text-slate-900">Tindakan / Hukuman</h3>
                {isLoadingTindakan ? <p className="text-sm text-slate-500">Memuat pilihan tindakan...</p> : null}
                {tindakanError ? (
                  <div className="rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
                    <p>Gagal memuat master tindakan.</p>
                    <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => refetchTindakan()}>
                      Coba lagi
                    </Button>
                  </div>
                ) : null}
                {!isLoadingTindakan && !tindakanError && tindakanOptions.length === 0 ? (
                  <p className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-700">Master tindakan belum tersedia.</p>
                ) : null}
                <TindakanPicker value={tindakanId} options={tindakanOptions} onChange={setTindakanIdDraft} disabled={detail.status === "selesai" || detail.status === "batal" || isLoadingTindakan || Boolean(tindakanError)} />
                <Textarea
                  value={deskripsiTindakan}
                  onChange={(event) => setDeskripsiTindakanDraft(event.target.value)}
                  placeholder="Deskripsi tindakan"
                  disabled={detail.status === "selesai" || detail.status === "batal"}
                  className="min-h-24 rounded-2xl border-blue-100"
                />
              </section>

              <ManagerNoteCard value={managerNote} onChange={setManagerNoteDraft} readOnly={detail.status !== "validasi"} title="Mengetahui / Disetujui" />
            </>
          ) : null}
        </section>
      </div>

      {detail && (detail.status === "proses" || detail.status === "draft") ? (
        <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur z-30">
          <div className="mx-auto max-w-md grid grid-cols-2 gap-3">
            <Button type="button" variant="destructive" className="h-11 rounded-2xl" disabled={cancelMutation.isPending} onClick={() => setDialog("cancel")}>
              {cancelMutation.isPending ? "Membatalkan..." : "Batal"}
            </Button>
            <Button type="button" className="h-11 rounded-2xl bg-[#288DE5]" disabled={processMutation.isPending || isLoadingTindakan || Boolean(tindakanError)} onClick={submitProcess}>
              {processMutation.isPending ? "Memproses..." : "Validasi Pelanggaran"}
            </Button>
          </div>
        </div>
      ) : null}

      {detail && detail.status === "validasi" ? (
        <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur z-30">
          <div className="mx-auto max-w-md grid grid-cols-3 gap-2">
            <Button type="button" variant="destructive" className="h-11 rounded-2xl text-xs px-1.5 truncate" onClick={() => setDialog("tolak")}>
              Tolak
            </Button>
            <Button type="button" variant="outline" className="h-11 rounded-2xl bg-white text-xs px-1.5 truncate border-slate-200" onClick={() => setDialog("no_poin")}>
              Tanpa Poin
            </Button>
            <Button type="button" className="h-11 rounded-2xl bg-[#288DE5] text-xs px-1.5 truncate" onClick={() => setDialog("poin")}>
              Dengan Poin
            </Button>
          </div>
        </div>
      ) : null}

      <DecisionDialog
        open={dialog === "poin"}
        title="Selesai Dengan Poin?"
        confirmLabel="Selesaikan"
        loading={decideMutation.isPending}
        onOpenChange={(open) => setDialog(open ? "poin" : null)}
        onConfirm={submitDecision}
      />
      <DecisionDialog
        open={dialog === "no_poin"}
        title="Selesai Tanpa Poin?"
        confirmLabel="Selesaikan"
        loading={decideMutation.isPending}
        onOpenChange={(open) => setDialog(open ? "no_poin" : null)}
        onConfirm={submitDecision}
      />
      <DecisionDialog
        open={dialog === "tolak"}
        title="Tolak Pelanggaran?"
        confirmLabel="Tolak"
        requireNote
        loading={decideMutation.isPending}
        onOpenChange={(open) => setDialog(open ? "tolak" : null)}
        onConfirm={submitDecision}
      />
      <DecisionDialog
        open={dialog === "cancel"}
        title="Batalkan Pelanggaran?"
        description="Tuliskan alasan pembatalan agar riwayat keputusan tetap jelas."
        confirmLabel="Batalkan"
        requireNote
        loading={cancelMutation.isPending}
        onOpenChange={(open) => setDialog(open ? "cancel" : null)}
        onConfirm={submitCancel}
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

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function getDecisionSuccessMessage(decision: PelanggaranDecision) {
  if (decision === "poin") return "Pelanggaran selesai dengan pengurangan poin";
  if (decision === "no_poin") return "Pelanggaran selesai tanpa pengurangan poin";
  return "Laporan pelanggaran telah ditolak";
}
