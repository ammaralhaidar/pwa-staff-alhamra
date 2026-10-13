import { useState } from "react";
import { KeyRound, Plus } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DetailPageSkeleton } from "@/components/feedback/page-skeletons";
import { KesantrianHeader } from "../components/kesantrian-header";
import { MoneyActionDialog } from "@/features/musyrif/presentation/components/money-action-dialog";
import { PinDialog } from "@/features/musyrif/presentation/components/pin-dialog";
import { WalletSummaryCard } from "@/features/musyrif/presentation/components/wallet-summary-card";
import {
  useChangeKesantrianPin,
  useKesantrianStudentDetail,
  useTopupKesantrianWallet,
} from "../../application/kesantrian-queries";
import { useWalletBalance } from "@/features/musyrif/application/musyrif-queries";

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-[12px] border-b border-slate-50 last:border-0">
      <span className="shrink-0 text-slate-400 font-medium">{label}</span>
      <span className="min-w-0 break-words text-slate-800 font-semibold text-right">{value}</span>
    </div>
  );
}

function safeValue(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "-";
  return String(value);
}

export function KesantrianSantriDetailPage() {
  const navigate = useNavigate();
  const santriId = Number(useParams().santriId ?? 0);
  const [topupOpen, setTopupOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);

  const studentQuery = useKesantrianStudentDetail(santriId);
  const balanceQuery = useWalletBalance(santriId);
  const topupMutation = useTopupKesantrianWallet();
  const pinMutation = useChangeKesantrianPin();

  const isInvalidId = !Number.isFinite(santriId) || santriId <= 0;
  const student = studentQuery.data;
  const balance = student ? balanceQuery.data : undefined;
  const detail = student?.detail;
  const academic = detail?.academic;
  const biodata = detail?.biodata;
  const address = detail?.address;
  const parents = detail?.parents;
  const finance = detail?.finance;

  const submitTopup = (amount: number) => {
    if (!student) return;
    topupMutation.mutate(
      { siswa_id: student.id, amount },
      {
        onSuccess: () => {
          toast.success("Top-up dompet berhasil.");
          setTopupOpen(false);
          void studentQuery.refetch();
          void balanceQuery.refetch();
        },
        onError: (error) =>
          toast.error(
            error instanceof Error
              ? error.message
              : "Top-up gagal. Periksa nominal dan saldo uang saku.",
          ),
      },
    );
  };

  const submitPin = (pin: string) => {
    if (!student) return;
    pinMutation.mutate(
      { siswa_id: student.id, new_pin: pin },
      {
        onSuccess: () => {
          toast.success("PIN berhasil diubah.");
          setPinOpen(false);
          void studentQuery.refetch();
        },
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Gagal mengubah PIN."),
      },
    );
  };

  const uangSaku = balance?.uangSaku ?? finance?.saldoUangSaku ?? student?.saldoUangSaku ?? 0;
  const dompet = balance?.dompet ?? finance?.saldoDompet ?? student?.saldoDompet ?? 0;
  const formattedUangSaku = rupiah.format(uangSaku);
  const formattedDompet = rupiah.format(dompet);

  return (
    <div className="relative mx-auto flex h-svh w-full max-w-[430px] flex-col overflow-x-hidden bg-[#EFF6FF]">
      {/* Sticky Header */}
      <div className="shrink-0 z-40">
        <KesantrianHeader
          title={student?.name ?? "Detail Santri"}
          onBack={() => navigate("/kesantrian/santri")}
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <section className="w-full space-y-4 px-4 py-4">
          {isInvalidId ? (
            <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-red-600 shadow-sm">
              ID santri tidak valid.
            </Card>
          ) : null}
          {studentQuery.isLoading ? <DetailPageSkeleton /> : null}
          {studentQuery.isError ? (
            <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-red-600 shadow-sm">
              Gagal memuat detail santri.
            </Card>
          ) : null}

          {student && (
            <>
              {/* Uang Saku & Dompet grid */}
              <div className="grid grid-cols-2 gap-3">
                <WalletSummaryCard title="Uang Saku" amount={uangSaku} tone="green" />
                <WalletSummaryCard title="Dompet" amount={dompet} tone="blue" />
              </div>

              {/* Uang Saku dan Dompet details */}
              <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-5 shadow-sm">
                <h3 className="font-extrabold text-[15px] text-slate-800 mb-3">Uang Saku dan Dompet</h3>
                <div className="space-y-1">
                  <DetailRow label="No. VA Uang Saku" value={safeValue(finance?.noVaUangSaku ?? student.noVaUangSaku)} />
                  <DetailRow label="Virtual Account" value={safeValue(finance?.virtualAccount ?? student.virtualAccount)} />
                  <DetailRow label="Saldo Uang Saku" value={formattedUangSaku} />
                  <DetailRow label="Saldo Dompet" value={formattedDompet} />
                  <DetailRow
                    label="PIN Dompet"
                    value={balance?.hasPinSet ?? finance?.hasPinSet ?? student.hasPinSet ? "******" : "Belum diset"}
                  />
                </div>
              </Card>

              {/* Data Akademik */}
              <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-5 shadow-sm">
                <h3 className="font-extrabold text-[15px] text-slate-800 mb-3">Data Akademik</h3>
                <div className="space-y-1">
                  <DetailRow label="No. Induk Siswa" value={student.nis || "-"} />
                  <DetailRow label="NISN" value={safeValue(academic?.nisn)} />
                  <DetailRow label="Tahun Ajaran" value={safeValue(academic?.tahunAjaran)} />
                  <DetailRow label="Jenjang" value={safeValue(academic?.jenjang)} />
                  <DetailRow label="Kelas" value={safeValue(academic?.kelas ?? student.kelas)} />
                  <DetailRow label="Kamar" value={safeValue(academic?.kamar ?? student.kamar)} />
                  <DetailRow label="Halaqoh" value={safeValue(academic?.halaqoh)} />
                  <DetailRow label="Musyrif" value={safeValue(academic?.musyrif)} />
                </div>
              </Card>

              {/* Data Siswa */}
              <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-5 shadow-sm">
                <h3 className="font-extrabold text-[15px] text-slate-800 mb-3">Data Siswa</h3>
                <div className="space-y-1">
                  <DetailRow label="Nama Lengkap" value={student.name} />
                  <DetailRow label="Nama Panggilan" value={safeValue(biodata?.namaPanggilan)} />
                  <DetailRow label="Tempat Lahir" value={safeValue(biodata?.tempatLahir)} />
                  <DetailRow label="Tanggal Lahir" value={safeValue(biodata?.tanggalLahir)} />
                  <DetailRow label="Jenis Kelamin" value={safeValue(biodata?.jenisKelamin)} />
                  <DetailRow label="Golongan Darah" value={safeValue(biodata?.golonganDarah)} />
                </div>
              </Card>

              {/* Alamat Rumah */}
              {address && (
                <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-5 shadow-sm">
                  <h3 className="font-extrabold text-[15px] text-slate-800 mb-3">Alamat Rumah</h3>
                  <div className="space-y-1">
                    <DetailRow label="Alamat" value={safeValue(address.alamat)} />
                    <DetailRow label="RT/RW" value={safeValue(address.rtRw)} />
                    <DetailRow label="Kelurahan" value={safeValue(address.kelurahan)} />
                    <DetailRow label="Kecamatan" value={safeValue(address.kecamatan)} />
                    <DetailRow label="Kota" value={safeValue(address.kota)} />
                    <DetailRow label="Provinsi" value={safeValue(address.provinsi)} />
                    <DetailRow label="Kode Pos" value={safeValue(address.kodePos)} />
                  </div>
                </Card>
              )}

              {/* Data Orang Tua */}
              {parents && (
                <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-5 shadow-sm">
                  <h3 className="font-extrabold text-[15px] text-slate-800 mb-3">Data Orang Tua / Wali</h3>
                  <div className="space-y-1">
                    <DetailRow label="Ayah" value={safeValue(parents.ayah)} />
                    <DetailRow label="Ibu" value={safeValue(parents.ibu)} />
                    <DetailRow label="Wali" value={safeValue(parents.wali ?? student.wali)} />
                    <DetailRow label="Hubungan Wali" value={safeValue(parents.hubunganWali)} />
                    <DetailRow label="No. HP" value={safeValue(parents.phone ?? student.phone)} />
                  </div>
                </Card>
              )}
            </>
          )}
        </section>
      </div>

      {/* Floating Action Buttons */}
      {student && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] p-4 bg-gradient-to-t from-white via-white/95 to-transparent z-40">
          <div className="flex gap-3">
            <Button
              onClick={() => setTopupOpen(true)}
              className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
            >
              <Plus className="size-4 mr-1.5" />
              Isi Saldo
            </Button>
            <Button
              variant="outline"
              onClick={() => setPinOpen(true)}
              className="flex-1 h-12 rounded-xl border-slate-200 bg-white hover:bg-slate-50 font-bold text-slate-700 shadow-xs"
            >
              <KeyRound className="size-4 mr-1.5 text-slate-500" />
              Ganti PIN
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <MoneyActionDialog
        open={topupOpen}
        onOpenChange={setTopupOpen}
        isLoading={topupMutation.isPending}
        studentName={student?.name ?? "-"}
        uangSaku={uangSaku}
        dompet={dompet}
        onSubmit={submitTopup}
      />

      <PinDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        isLoading={pinMutation.isPending}
        onSubmit={submitPin}
      />
    </div>
  );
}
