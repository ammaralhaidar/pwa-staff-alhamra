import { useState } from "react";
import { KeyRound, Plus, Wallet, CreditCard } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackMusyrifStudents, fallbackWalletBalance } from "../../application/musyrif-fallback-data";
import { useChangeStudentPin, useMusyrifStudentDetail, useTopupWallet, useWalletBalance } from "../../application/musyrif-queries";
import { validatePin, validateTopup } from "../../application/musyrif-schemas";
import { MoneyActionDialog } from "../components/money-action-dialog";
import { MusyrifHeader } from "../components/musyrif-header";
import { PinDialog } from "../components/pin-dialog";
import { WalletSummaryCard } from "../components/wallet-summary-card";

const rupiah = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 text-[12px] border-b border-slate-50 last:border-0">
      <span className="text-slate-400 font-medium">{label}</span>
      <span className="text-slate-800 font-semibold text-right">{value}</span>
    </div>
  );
}

function safeValue(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "-";
  return String(value);
}

export function SantriDetailPage() {
  const navigate = useNavigate();
  const santriId = Number(useParams().santriId ?? 0);
  const [topupOpen, setTopupOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const studentQuery = useMusyrifStudentDetail(santriId);
  const balanceQuery = useWalletBalance(santriId);
  const topupMutation = useTopupWallet();
  const pinMutation = useChangeStudentPin();
  
  const fallback = studentQuery.isError && isDemoFallbackEnabled() ? fallbackMusyrifStudents.find((item) => item.id === santriId) : undefined;
  const student = studentQuery.data ?? fallback;
  const isInvalidId = !Number.isFinite(santriId) || santriId <= 0;
  const balance = student ? balanceQuery.data ?? (balanceQuery.isError && isDemoFallbackEnabled() ? fallbackWalletBalance(student.id) : undefined) : undefined;
  const detail = student?.detail;
  const academic = detail?.academic;
  const biodata = detail?.biodata;
  const address = detail?.address;
  const parents = detail?.parents;
  const finance = detail?.finance;

  const submitTopup = (amount: number) => {
    const amountError = validateTopup(amount);
    if (amountError || !student) {
      toast.error(amountError ?? "Santri tidak valid.");
      return;
    }
    topupMutation.mutate({ siswa_id: student.id, amount }, {
      onSuccess: () => {
        toast.success("Topup dompet berhasil.");
        setTopupOpen(false);
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : "Topup gagal. Periksa nominal dan saldo uang saku."),
    });
  };

  const submitPin = (pin: string) => {
    const error = validatePin(pin);
    if (error) {
      toast.error(error);
      return;
    }
    if (!student) {
      toast.error("Santri tidak valid.");
      return;
    }
    pinMutation.mutate({ siswa_id: student.id, new_pin: pin }, {
      onSuccess: () => {
        toast.success("PIN berhasil diubah.");
        setPinOpen(false);
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : "Gagal mengubah PIN."),
    });
  };

  const uangSaku = balance?.uangSaku ?? finance?.saldoUangSaku ?? student?.saldoUangSaku ?? 0;
  const dompet = balance?.dompet ?? finance?.saldoDompet ?? student?.saldoDompet ?? 0;
  const formattedUangSaku = rupiah.format(uangSaku);
  const formattedDompet = rupiah.format(dompet);

  return (
    <div className="relative mx-auto flex h-svh max-w-[430px] flex-col bg-[#EFF6FF]">
      {/* Sticky Header */}
      <div className="shrink-0 z-40">
        <MusyrifHeader
          title={student?.name ?? "Detail Santri"}
          subtitle="Informasi lengkap santri"
          onBack={() => navigate("/musyrif/santri")}
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-32">
        <section className="space-y-4 px-4 py-4">
          {isInvalidId ? <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-red-600 shadow-sm">ID santri tidak valid.</Card> : null}
          {studentQuery.isLoading ? <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-slate-500 shadow-sm">Memuat detail santri...</Card> : null}
          {studentQuery.isError && fallback ? <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-4 text-sm text-amber-700 shadow-sm">Detail contoh ditampilkan karena API belum tersedia. Action dinonaktifkan pada data fallback.</Card> : null}
          {studentQuery.isError && !fallback ? <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-red-600 shadow-sm">Gagal memuat detail santri.</Card> : null}
          {!studentQuery.isLoading && !studentQuery.isError && !student ? <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-slate-500 shadow-sm">Santri tidak ditemukan.</Card> : null}
          {student ? (
            <>
          {/* Uang Saku & Dompet grid */}
          <div className="grid grid-cols-2 gap-3">
            <WalletSummaryCard title="Uang Saku" amount={uangSaku} tone="green" />
            <WalletSummaryCard title="Dompet" amount={dompet} tone="blue" />
          </div>

          {/* Riwayat Transaksi section */}
          <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-5 shadow-sm">
            <h3 className="font-extrabold text-[15px] text-slate-800 mb-3">Riwayat Transaksi</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button asChild className="h-12 rounded-[14px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-none border-0">
                <Link to={`/musyrif/santri/${student.id}/uang-saku`}>
                  <CreditCard className="size-4" />
                  Uang Saku
                </Link>
              </Button>
              <Button asChild className="h-12 rounded-[14px] bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-none border-0">
                <Link to={`/musyrif/santri/${student.id}/dompet`}>
                  <Wallet className="size-4" />
                  Dompet Santri
                </Link>
              </Button>
            </div>
          </Card>

          {/* Uang Saku dan Dompet details */}
          <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-5 shadow-sm">
            <h3 className="font-extrabold text-[15px] text-slate-800 mb-3">Uang Saku dan Dompet</h3>
            <div className="space-y-1">
              <DetailRow label="No. VA Uang Saku" value={safeValue(finance?.noVaUangSaku ?? student.noVaUangSaku)} />
              <DetailRow label="Virtual Account" value={safeValue(finance?.virtualAccount ?? student.virtualAccount)} />
              <DetailRow label="Saldo Uang Saku" value={formattedUangSaku} />
              <DetailRow label="Saldo Dompet" value={formattedDompet} />
              <DetailRow label="PIN Dompet" value={(balance?.hasPinSet ?? finance?.hasPinSet ?? student.hasPinSet) ? "******" : "Belum diset"} />
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

          {/* Tahfidz Terakhir */}
          <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-5 shadow-sm">
            <h3 className="font-extrabold text-[15px] text-slate-800 mb-3">Tahfidz Terakhir</h3>
            <p className="text-[12px] font-semibold text-slate-700 bg-slate-50 rounded-xl p-3 border border-slate-100/50 leading-relaxed">
              {safeValue(detail?.tahfidz?.text)}
            </p>
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
              <DetailRow label="Agama" value={safeValue(biodata?.agama)} />
              <DetailRow label="Anak Ke" value={safeValue(biodata?.anakKe)} />
              <DetailRow label="Jumlah Saudara" value={safeValue(biodata?.jumlahSaudara)} />
            </div>
          </Card>

          {/* Alamat Rumah */}
          <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-5 shadow-sm">
            <h3 className="font-extrabold text-[15px] text-slate-800 mb-3">Alamat Rumah</h3>
            <div className="space-y-1">
              <DetailRow label="Alamat" value={safeValue(address?.alamat)} />
              <DetailRow label="RT/RW" value={safeValue(address?.rtRw)} />
              <DetailRow label="Kelurahan" value={safeValue(address?.kelurahan)} />
              <DetailRow label="Kecamatan" value={safeValue(address?.kecamatan)} />
              <DetailRow label="Kota" value={safeValue(address?.kota)} />
              <DetailRow label="Provinsi" value={safeValue(address?.provinsi)} />
              <DetailRow label="Kode Pos" value={safeValue(address?.kodePos)} />
            </div>
          </Card>
          <Card hasRing={false} className="rounded-[22px] border-0 bg-white p-5 shadow-sm">
            <h3 className="font-extrabold text-[15px] text-slate-800 mb-3">Orang Tua / Wali</h3>
            <div className="space-y-1">
              <DetailRow label="Ayah" value={safeValue(parents?.ayah)} />
              <DetailRow label="Ibu" value={safeValue(parents?.ibu)} />
              <DetailRow label="Wali" value={safeValue(parents?.wali ?? student.wali)} />
              <DetailRow label="Hubungan Wali" value={safeValue(parents?.hubunganWali)} />
              <DetailRow label="No. HP" value={safeValue(parents?.phone ?? student.phone)} />
            </div>
          </Card>
            </>
          ) : null}
        </section>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-100 p-4 z-50 flex gap-3 max-w-[430px] mx-auto">
        <Button className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-none border-0" disabled={!student || Boolean(fallback)} onClick={() => setTopupOpen(true)}>
          <Plus className="size-4" />
          Isi Dompet
        </Button>
        <Button variant="outline" className="flex-1 h-12 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-none" disabled={!student || Boolean(fallback)} onClick={() => setPinOpen(true)}>
          <KeyRound className="size-4" />
          Ubah PIN
        </Button>
      </div>

      <MoneyActionDialog
        open={topupOpen}
        onOpenChange={setTopupOpen}
        isLoading={topupMutation.isPending}
        studentName={student?.name}
        uangSaku={uangSaku}
        dompet={dompet}
        onSubmit={submitTopup}
      />
      <PinDialog open={pinOpen} onOpenChange={setPinOpen} isLoading={pinMutation.isPending} onSubmit={submitPin} />
    </div>
  );
}
