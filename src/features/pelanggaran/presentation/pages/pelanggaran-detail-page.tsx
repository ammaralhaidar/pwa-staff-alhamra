import { useMemo, useState } from "react";
import { ChevronLeft, Copy, X, Check, Gavel, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackPelanggaranList, fallbackTindakanOptions } from "../../application/pelanggaran-fallback-data";
import { useCancelPelanggaran, useDecidePelanggaran, usePelanggaranDetail, useProcessPelanggaran, useTindakanOptions } from "../../application/pelanggaran-queries";
import { validateProcessPelanggaran } from "../../application/pelanggaran-schemas";
import type { PelanggaranAccessType } from "../../domain/pelanggaran-types";
import { ActionDialog } from "../components/action-dialog";
import { appAssets } from "@/shared/assets/app-assets";

function safeText(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function PelanggaranDetailPage({ accessType, isBinaan = false }: { accessType: PelanggaranAccessType; isBinaan?: boolean }) {
  const navigate = useNavigate();
  const rawPelanggaranId = useParams().pelanggaranId;
  const pelanggaranId = Number(rawPelanggaranId ?? 0);
  const isInvalidId = !Number.isFinite(pelanggaranId) || pelanggaranId <= 0;
  const basePath = accessType === "kesantrian" ? "/kesantrian/pelanggaran" : accessType === "pendidik" ? "/pelanggaran/pendidik" : "/pelanggaran";
  const query = usePelanggaranDetail(pelanggaranId);
  const tindakanQuery = useTindakanOptions();
  const cancelMutation = useCancelPelanggaran();
  const processMutation = useProcessPelanggaran();
  const decideMutation = useDecidePelanggaran();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState<"poin" | "no_poin" | "tolak" | null>(null);

  // Form states (handled directly in the page as per screen mockup)
  const [tindakanId, setTindakanId] = useState<number | null>(null);
  const [deskripsiTindakan, setDeskripsiTindakan] = useState("");

  const fallbackDetail = useMemo(() => fallbackPelanggaranList.find((item) => item.id === pelanggaranId) ?? fallbackPelanggaranList[0], [pelanggaranId]);
  const apiDetail = query.data?.id ? query.data : undefined;
  const isFallbackMode = query.isError && isDemoFallbackEnabled();
  const isTindakanFallbackMode = tindakanQuery.isError && isDemoFallbackEnabled();
  const data = isFallbackMode ? fallbackDetail : apiDetail;
  const tindakanOptions = isTindakanFallbackMode ? fallbackTindakanOptions : tindakanQuery.data ?? [];
  const isNotFound = !isInvalidId && query.isSuccess && !apiDetail;

  const canCancel = Boolean(data && (data.status === "draft" || data.status === "proses" || (data.status === "validasi" && isBinaan)));
  const canProcess = Boolean(data && (accessType === "pendidik" || accessType === "kesantrian") && data.status === "proses");
  const canDecide = Boolean(data && ((accessType === "kesantrian" && data.status === "validasi") || (accessType === "biasa" && isBinaan && data.status === "validasi")));

  const handleBack = () => {
    navigate(isBinaan ? "/pelanggaran/binaan" : basePath);
  };

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.reference);
    toast.success("Nomor referensi berhasil disalin.");
  };

  const handleCancel = (alasan?: string) => {
    if (!data || cancelMutation.isPending) return;
    cancelMutation.mutate({ pelanggaranId: data.id, alasan }, {
      onSuccess: () => {
        toast.success("Pelanggaran berhasil dibatalkan.");
        setCancelOpen(false);
        query.refetch();
      },
      onError: (error) => toast.error(getErrorMessage(error, "Gagal membatalkan pelanggaran.")),
    });
  };

  const handleProcessSubmit = () => {
    if (!data || processMutation.isPending) return;
    if (!tindakanId) {
      toast.error("Silakan pilih tindakan terlebih dahulu.");
      return;
    }
    const payload = { pelanggaranId: data.id, tindakanId, deskripsiTindakan };
    const error = validateProcessPelanggaran(payload);
    if (error) {
      toast.error(error);
      return;
    }
    processMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Pelanggaran berhasil divalidasi.");
        setTindakanId(null);
        setDeskripsiTindakan("");
        query.refetch();
      },
      onError: (error) => toast.error(getErrorMessage(error, "Gagal memvalidasi pelanggaran.")),
    });
  };

  const handleDecision = (catatanManager?: string) => {
    if (!data || !decisionOpen || decideMutation.isPending) return;
    decideMutation.mutate({ pelanggaranId: data.id, keputusan: decisionOpen, catatanManager }, {
      onSuccess: () => {
        toast.success("Keputusan berhasil disimpan.");
        setDecisionOpen(null);
        query.refetch();
      },
      onError: (error) => toast.error(getErrorMessage(error, "Gagal menyimpan keputusan.")),
    });
  };

  // Dynamic status badge color for the header
  const getHeaderBadgeClass = (status: string) => {
    switch (status) {
      case "proses":
        return "bg-[#F3E8FF] text-[#9333EA]";
      case "selesai":
        return "bg-[#DCFCE7] text-[#16A34A]";
      case "validasi":
        return "bg-amber-100 text-amber-700";
      case "batal":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  function renderStateCard(title: string, description: string, retry?: boolean) {
    return (
      <div className="relative mx-auto flex h-svh max-w-[430px] flex-col bg-[#EFF6FF]">
        <header className="relative overflow-hidden rounded-b-[28px] px-5 pb-8 pt-6 text-white min-h-[170px] shrink-0 z-40">
          <img src={appAssets.dashboardHeader} alt="" className="pointer-events-none absolute inset-x-0 w-full h-[160%] -top-[30%] select-none object-cover object-center" />
          <div className="relative z-10">
            <button type="button" onClick={handleBack} className="flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white">
              <ChevronLeft className="size-5" />
              Kembali
            </button>
            <h1 className="mt-5 text-2xl font-extrabold tracking-wide leading-tight">Detail Pelanggaran</h1>
          </div>
        </header>
        <section className="space-y-4 px-5 py-6">
          <Card className="rounded-[20px] border-0 bg-white p-6 text-center shadow-sm">
            <p className="font-bold text-slate-800">{title}</p>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
            {retry ? (
              <Button type="button" className="mt-4 rounded-full" variant="outline" onClick={() => query.refetch()}>
                <RefreshCw className="mr-2 size-4" />
                Coba lagi
              </Button>
            ) : null}
          </Card>
        </section>
      </div>
    );
  }

  if (isInvalidId) {
    return renderStateCard("ID pelanggaran tidak valid", "Data detail tidak bisa dimuat karena parameter route tidak sesuai.");
  }

  if (query.isLoading) {
    return (
      <div className="relative mx-auto flex h-svh max-w-[430px] flex-col bg-[#EFF6FF]">
        <header className="relative overflow-hidden rounded-b-[28px] px-5 pb-8 pt-6 text-white min-h-[170px] shrink-0 z-40">
          <img src={appAssets.dashboardHeader} alt="" className="pointer-events-none absolute inset-x-0 w-full h-[160%] -top-[30%] select-none object-cover object-center" />
          <div className="relative z-10">
            <button type="button" onClick={handleBack} className="flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white">
              <ChevronLeft className="size-5" />
              Kembali
            </button>
            <h1 className="mt-5 text-2xl font-extrabold tracking-wide leading-tight">Memuat Detail</h1>
          </div>
        </header>
        <section className="space-y-4 px-5 py-6">
          <Skeleton className="h-24 rounded-[20px]" />
          <Skeleton className="h-40 rounded-[20px]" />
          <Skeleton className="h-40 rounded-[20px]" />
        </section>
      </div>
    );
  }

  if (isNotFound || !data) {
    return renderStateCard("Detail tidak ditemukan", "API tidak mengembalikan data untuk ID pelanggaran ini.", true);
  }

  return (
    <div className="relative mx-auto flex h-svh max-w-[430px] flex-col bg-[#EFF6FF]">
      {/* Header */}
      <header className="relative overflow-hidden rounded-b-[28px] px-5 pb-8 pt-6 text-white min-h-[170px] shrink-0 z-40">
        {/* Background Image */}
        <img
          src={appAssets.dashboardHeader}
          alt=""
          className="pointer-events-none absolute inset-x-0 w-full h-[160%] -top-[30%] select-none object-cover object-center"
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white"
            >
              <ChevronLeft className="size-5" />
              Kembali
            </button>
            
            <button
              type="button"
              onClick={handleCopy}
              className="p-1 text-white/90 hover:text-white transition-colors"
              aria-label="Salin referensi"
            >
              <Copy className="size-5" />
            </button>
          </div>

          {/* Reference Title & Status Badge */}
          <div className="mt-5">
            <h1 className="text-2xl font-extrabold tracking-wide leading-tight">{data.reference}</h1>
            <div className="mt-2.5">
              <span className={`inline-block rounded-full px-4 py-1 text-xs font-bold capitalize ${getHeaderBadgeClass(data.status)}`}>
                {data.statusLabel || data.status}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Content Section */}
        <section className="mt-6 space-y-4 px-5">
          {query.isError ? (
            <Card className="space-y-3 rounded-[20px] border-0 bg-white p-4 text-sm text-amber-700 shadow-sm">
              <p>{isFallbackMode ? "Gagal memuat detail dari API. Data contoh ditampilkan agar tampilan tetap bisa dicek." : "Gagal memuat detail dari API."}</p>
              <Button type="button" size="sm" variant="outline" className="rounded-full" onClick={() => query.refetch()}>
                <RefreshCw className="mr-2 size-4" />
                Coba lagi
              </Button>
            </Card>
          ) : null}

          {/* Card: Pelapor */}
          <Card className="rounded-[20px] border-0 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-semibold text-slate-400">Pelapor :</p>
            <p className="mt-1.5 text-sm font-bold text-slate-800">{safeText(data.pelaporName)}</p>
          </Card>

          {/* Card: Data Santri */}
          <Card className="rounded-[20px] border-0 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Data Santri</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400">Tanggal Pelanggaran</p>
                <p className="mt-1.5 text-sm font-bold text-slate-800">{safeText(data.tgl || data.tanggal)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Siswa</p>
                <p className="mt-1.5 text-sm font-bold text-slate-800">{safeText(data.namaSantri)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Kelas</p>
                <p className="mt-1.5 text-sm font-bold text-slate-800">{safeText(data.kelasSantri)}</p>
              </div>
            </div>
          </Card>

          {/* Card: Data Pelanggaran */}
          <Card className="rounded-[20px] border-0 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Data Pelanggaran</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-400">Nama Pelanggaran</p>
                <p className="mt-1.5 text-sm font-bold text-slate-800">{safeText(data.namaPelanggaran)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Kategori</p>
                <p className="mt-1.5 text-sm font-bold text-slate-800">{safeText(data.kategori)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Poin</p>
                <p className="mt-1.5 text-sm font-bold text-red-600">{safeText(data.poin, "0")}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400">Deskripsi Pelanggaran</p>
                <p className="mt-1.5 text-sm font-bold text-slate-800">{safeText(data.catatan || data.deskripsi)}</p>
              </div>
            </div>
          </Card>

          {/* Card: Tindakan / Hukuman */}
          <Card className="rounded-[20px] border-0 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Tindakan / Hukuman</h3>
            
            {canProcess ? (
              <div className="space-y-4">
                {tindakanQuery.isError ? <p className="text-xs font-semibold text-amber-600">{isTindakanFallbackMode ? "Gagal memuat master tindakan dari API. Data contoh ditampilkan." : "Gagal memuat master tindakan dari API."}</p> : null}
                {!tindakanQuery.isError && tindakanQuery.isLoading ? <p className="text-xs font-semibold text-slate-400">Memuat master tindakan...</p> : null}
                {!tindakanQuery.isError && !tindakanQuery.isLoading && tindakanOptions.length === 0 ? <p className="text-xs font-semibold text-slate-400">Belum ada master tindakan tersedia.</p> : null}
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-1.5">Tindakan</p>
                  <div className="relative">
                    <select
                      value={tindakanId ?? ""}
                      onChange={(e) => setTindakanId(Number(e.target.value))}
                      disabled={processMutation.isPending || tindakanQuery.isLoading || tindakanOptions.length === 0}
                      className="w-full h-12 rounded-[12px] border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">-</option>
                      {tindakanOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Gavel className="size-4" />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-1.5">Deskripsi Tindakan</p>
                  <textarea
                    value={deskripsiTindakan}
                    onChange={(e) => setDeskripsiTindakan(e.target.value)}
                    disabled={processMutation.isPending}
                    placeholder="Tuliskan deskripsi tindakan"
                    className="w-full min-h-[100px] rounded-[12px] border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Tindakan</p>
                  <p className="mt-1.5 text-sm font-bold text-slate-800">
                    {safeText(data.infoTindakan?.tindakanNama || data.tindakan)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">Deskripsi Tindakan</p>
                  <p className="mt-1.5 text-sm font-bold text-slate-800">
                    {safeText(data.infoTindakan?.deskripsiTindakan)}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Card: Mengetahui / Disetujui */}
          {(data.status === "validasi" || data.status === "selesai") && (
            <Card className="rounded-[20px] border-0 bg-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)] space-y-4">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">Mengetahui / Disetujui</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Disetujui Oleh</p>
                  <p className="mt-1.5 text-sm font-bold text-slate-800">{safeText(data.keputusan?.userDisetujui)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">Catatan</p>
                  <p className="mt-1.5 text-sm font-bold text-slate-800">{safeText(data.keputusan?.catatanKaAsrama)}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Decision actions for manager (status: validasi) */}
          {canDecide && (
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Button className="h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold" onClick={() => setDecisionOpen("tolak")} disabled={decideMutation.isPending}>Tolak</Button>
              <Button className="h-12 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold" onClick={() => setDecisionOpen("no_poin")} disabled={decideMutation.isPending}>No Poin</Button>
              <Button className="h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={() => setDecisionOpen("poin")} disabled={decideMutation.isPending}>+ Poin</Button>
            </div>
          )}
        </section>
      </div>

      {/* Sticky Bottom Actions */}
      {canProcess ? (
        <div className="sticky bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-5 py-4 shadow-[0_-8px_20px_rgba(0,0,0,0.04)] z-50">
          <div className="flex gap-3">
            <Button
              type="button"
              className="flex-1 h-12 rounded-[16px] bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-bold flex items-center justify-center gap-2 border-0 shadow-none"
              onClick={() => setCancelOpen(true)}
              disabled={cancelMutation.isPending || processMutation.isPending}
            >
              <X className="size-4" /> Batal
            </Button>
            <Button
              type="button"
              className="flex-1 h-12 rounded-[16px] bg-[#10B981] hover:bg-[#059669] text-white text-sm font-bold flex items-center justify-center gap-2 border-0 shadow-none"
              onClick={handleProcessSubmit}
              disabled={processMutation.isPending || !tindakanId || tindakanOptions.length === 0}
            >
              <Check className="size-4" /> {processMutation.isPending ? "Memproses..." : "Validasi"}
            </Button>
          </div>
        </div>
      ) : canCancel ? (
        <div className="sticky bottom-0 left-0 right-0 border-t border-slate-100 bg-white px-5 py-4 shadow-[0_-8px_20px_rgba(0,0,0,0.04)] z-50">
          <Button
            type="button"
            className="w-full h-12 rounded-[16px] bg-[#DC2626] hover:bg-[#B91C1C] text-white text-sm font-bold flex items-center justify-center gap-2 border-0 shadow-none"
            onClick={() => setCancelOpen(true)}
            disabled={cancelMutation.isPending}
          >
            <X className="size-4" /> Batal
          </Button>
        </div>
      ) : null}

      {/* Dialogs */}
      <ActionDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Batal Pelanggaran"
        description="Tuliskan alasan pembatalan jika diperlukan, lalu konfirmasi untuk membatalkan pelanggaran."
        confirmLabel="Batalkan"
        loading={cancelMutation.isPending}
        onConfirm={handleCancel}
      />
      
      <ActionDialog
        open={Boolean(decisionOpen)}
        onOpenChange={(open) => !open && setDecisionOpen(null)}
        title="Konfirmasi Keputusan"
        description={decisionOpen === "tolak" ? "Catatan wajib diisi untuk keputusan tolak." : "Tuliskan catatan keputusan jika diperlukan."}
        confirmLabel="Simpan"
        requireNote={decisionOpen === "tolak"}
        loading={decideMutation.isPending}
        onConfirm={handleDecision}
      />
    </div>
  );
}
