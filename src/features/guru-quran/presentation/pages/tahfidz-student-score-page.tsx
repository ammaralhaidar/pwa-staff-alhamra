/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState, type ElementType, type ReactNode } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  Clock,
  GraduationCap,
  Hash,
  Loader2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { GuruQuranHeader } from "../components/guru-quran-header";
import {
  useAyatList,
  useNilaiList,
  useSubmitTahfidzScore,
  useSurahList,
  useTahfidzDraftDetail,
  useTahfidzHistoryDetail,
} from "../../application/guru-quran-queries";
import type {
  AttendanceSession,
  Ayat,
  NilaiOption,
  Surah,
  TahfidzStudent,
} from "../../domain/guru-quran-types";

type ScoreRouteState = {
  session?: AttendanceSession;
  student?: TahfidzStudent;
};

export function TahfidzStudentScorePage() {
  const navigate = useNavigate();
  const { attendanceId, studentId } = useParams();
  const location = useLocation();
  const routeState = (location.state ?? {}) as ScoreRouteState;
  const session = routeState.session;
  const student = routeState.student;
  const tahfidzId = Number(studentId) || 0;

  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedAyatAwal, setSelectedAyatAwal] = useState<Ayat | null>(null);
  const [selectedAyatAkhir, setSelectedAyatAkhir] = useState<Ayat | null>(null);
  const [lanjutSurah, setLanjutSurah] = useState(false);
  const [selectedSurahLanjutan, setSelectedSurahLanjutan] = useState<Surah | null>(null);
  const [jumlahBaris, setJumlahBaris] = useState("");
  const [selectedNilai, setSelectedNilai] = useState<NilaiOption | null>(null);
  const [keterangan, setKeterangan] = useState("");
  const [readonly, setReadonly] = useState(student?.status === "done");

  const surahQuery = useSurahList();
  const ayatQuery = useAyatList(selectedSurah?.id);
  const ayatLanjutanQuery = useAyatList(selectedSurahLanjutan?.id);
  const nilaiQuery = useNilaiList();
  const draftDetailQuery = useTahfidzDraftDetail({
    halaqohId: session?.halaqohId,
    sesiId: session?.sesiId,
    tanggal: session?.tanggal,
    tahfidzId,
  });
  const historyDetailQuery = useTahfidzHistoryDetail(tahfidzId, tahfidzId > 0);
  const submitMutation = useSubmitTahfidzScore();

  const draftDetail = draftDetailQuery.data;
  const historyDetail = historyDetailQuery.data;
  const ayatAkhirOptions = lanjutSurah ? (ayatLanjutanQuery.data ?? []) : (ayatQuery.data ?? []);
  const siswaName = student?.studentName ?? "Santri";
  const siswaNis = student?.nis ? ` (${student.nis})` : "";
  const isMasterLoading = surahQuery.isLoading || nilaiQuery.isLoading;
  const hasDraftContext = Boolean(session?.halaqohId && session?.sesiId && session?.tanggal);

  useEffect(() => {
    if (!draftDetail?.currentSurah || selectedSurah || readonly) return;

    const surah = (surahQuery.data ?? []).find((item) =>
      item.id === draftDetail.currentSurah?.id ||
      item.name.toLowerCase() === draftDetail.currentSurah?.name.toLowerCase(),
    );

    if (surah) setSelectedSurah(surah);
  }, [draftDetail, readonly, selectedSurah, surahQuery.data]);

  useEffect(() => {
    if (!draftDetail?.currentAyatAwal || selectedAyatAwal || readonly) return;

    const ayat = (ayatQuery.data ?? []).find((item) =>
      item.id === draftDetail.currentAyatAwal?.id ||
      item.nomorAyat === draftDetail.currentAyatAwal?.nomorAyat,
    );

    if (ayat) setSelectedAyatAwal(ayat);
  }, [ayatQuery.data, draftDetail, readonly, selectedAyatAwal]);

  useEffect(() => {
    if (!historyDetail || !readonly) return;

    if (!selectedSurah && historyDetail.surah) {
      const surah = findByName(surahQuery.data ?? [], historyDetail.surah);
      if (surah) setSelectedSurah(surah);
    }

    if (historyDetail.surah2 && !selectedSurahLanjutan) {
      const surah = findByName(surahQuery.data ?? [], historyDetail.surah2);
      if (surah) {
        setLanjutSurah(true);
        setSelectedSurahLanjutan(surah);
      }
    }

    if (!selectedNilai && historyDetail.nilai) {
      const nilai = findByName(nilaiQuery.data ?? [], historyDetail.nilai);
      if (nilai) setSelectedNilai(nilai);
    }

    if (!jumlahBaris && historyDetail.jmlBaris !== undefined) {
      setJumlahBaris(String(historyDetail.jmlBaris));
    }

    if (!keterangan && historyDetail.keterangan) {
      setKeterangan(historyDetail.keterangan);
    }
  }, [
    historyDetail,
    jumlahBaris,
    keterangan,
    nilaiQuery.data,
    readonly,
    selectedNilai,
    selectedSurah,
    selectedSurahLanjutan,
    surahQuery.data,
  ]);

  useEffect(() => {
    if (!historyDetail || !readonly) return;

    if (!selectedAyatAwal && historyDetail.ayatAwal !== undefined) {
      const ayat = (ayatQuery.data ?? []).find((item) => item.nomorAyat === historyDetail.ayatAwal);
      if (ayat) setSelectedAyatAwal(ayat);
    }

    if (!selectedAyatAkhir && historyDetail.ayatAkhir !== undefined) {
      const options = lanjutSurah ? (ayatLanjutanQuery.data ?? []) : (ayatQuery.data ?? []);
      const ayat = options.find((item) => item.nomorAyat === historyDetail.ayatAkhir);
      if (ayat) setSelectedAyatAkhir(ayat);
    }
  }, [
    ayatLanjutanQuery.data,
    ayatQuery.data,
    historyDetail,
    lanjutSurah,
    readonly,
    selectedAyatAkhir,
    selectedAyatAwal,
  ]);

  const halamanAwal = selectedAyatAwal?.page ? String(selectedAyatAwal.page) : "";
  const halamanAkhir = selectedAyatAkhir?.page ? String(selectedAyatAkhir.page) : "";

  const statusMessage = useMemo(() => {
    if (readonly) return "Data penilaian sudah selesai dan ditampilkan dalam mode baca.";
    if (!hasDraftContext) return "Data sesi tidak lengkap dari navigasi. Kamu masih bisa input nilai, tetapi hafalan terakhir tidak bisa diprefill.";
    if (draftDetailQuery.isLoading) return "Memuat hafalan terakhir santri...";
    if (draftDetail?.lastTahfidz) return `Hafalan terakhir: ${draftDetail.lastTahfidz}`;
    return "Lengkapi nilai hafalan santri hari ini.";
  }, [draftDetail?.lastTahfidz, draftDetailQuery.isLoading, hasDraftContext, readonly]);

  useEffect(() => {
    if (historyDetail && !readonly) setReadonly(true);
  }, [historyDetail, readonly]);

  async function handleSubmit() {
    if (readonly) {
      navigate(`/guru-quran/tahfidz/penilaian/${attendanceId}`, { state: { session } });
      return;
    }

    if (!selectedSurah || !selectedAyatAwal || !selectedAyatAkhir || !selectedNilai) {
      toast.error("Harap lengkapi surah, ayat, dan nilai.");
      return;
    }

    if (lanjutSurah && !selectedSurahLanjutan) {
      toast.error("Pilih surah lanjutan terlebih dahulu.");
      return;
    }

    try {
      await submitMutation.mutateAsync({
        tahfidz_id: tahfidzId,
        surah_id: selectedSurah.id,
        surah2_id: lanjutSurah ? selectedSurahLanjutan?.id : undefined,
        is_change_surah: lanjutSurah,
        ayat_awal: selectedAyatAwal.id,
        ayat_akhir: selectedAyatAkhir.id,
        nilai_id: selectedNilai.id,
        jml_baris: Number(jumlahBaris) || 0,
        keterangan: keterangan.trim() || undefined,
      });

      toast.success("Penilaian berhasil disimpan");
      setReadonly(true);
      historyDetailQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan penilaian");
    }
  }

  return (
    <div className="relative mx-auto flex h-svh max-w-[430px] flex-col bg-[#EFF6FF]">
      <div className="z-40 shrink-0">
        <GuruQuranHeader title="Input Nilai Santri" onBack={() => navigate(-1)} />
      </div>

      <main className="flex-1 overflow-y-auto px-5 pb-28 pt-5">
        <div className="rounded-2xl bg-[#288DE5] p-5 shadow-md shadow-[#288DE5]/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">No Referensi</p>
          <p className="mt-1 text-lg font-extrabold text-white">
            TQ/{session?.tanggal?.replace(/-/g, "/") ?? "draft"}/{tahfidzId}
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-[#EAECF0] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <p className="mb-4 text-base font-bold text-[#101828]">Detail Informasi Santri</p>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={CalendarDays} label="Tanggal" value={session?.tanggal ?? "-"} />
            <InfoItem icon={User} label="Ustadz" value={session?.ustadzName ?? "-"} />
            <InfoItem icon={GraduationCap} label="Santri" value={`${siswaName}${siswaNis}`} />
            <InfoItem icon={BookOpen} label="Halaqoh" value={session?.halaqohName ?? "-"} />
            <InfoItem icon={Clock} label="Sesi" value={session?.sesiName ?? "-"} />
            <InfoItem icon={Hash} label="Jumlah Ayat" value={selectedSurah ? String(selectedSurah.jmlAyat) : "-"} />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[#B3E0FF] bg-[#F0F9FF] p-4">
          <p className="text-sm font-semibold text-[#344054]">{statusMessage}</p>
        </div>

        <div className="mt-5 space-y-4 rounded-2xl border border-[#EAECF0] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <p className="border-b border-[#F2F4F7] pb-2 text-base font-bold text-[#101828]">Penilaian Tahfidz</p>

          {isMasterLoading ? (
            <div className="flex items-center justify-center py-10 text-sm font-semibold text-[#667085]">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memuat master penilaian...
            </div>
          ) : (
            <>
              <div>
                <FormLabel>Surah</FormLabel>
                <SimpleSelect
                  disabled={readonly}
                  placeholder="Pilih Surah"
                  value={selectedSurah?.name}
                  options={surahQuery.data ?? []}
                  getKey={(s) => s.id}
                  getLabel={(s) => `${s.number}. ${s.name}`}
                  onSelect={(surah) => {
                    setSelectedSurah(surah);
                    setSelectedAyatAwal(null);
                    setSelectedAyatAkhir(null);
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel>Ayat Awal</FormLabel>
                  <SimpleSelect
                    disabled={readonly || !selectedSurah}
                    placeholder="Pilih ayat"
                    value={selectedAyatAwal ? String(selectedAyatAwal.nomorAyat) : undefined}
                    options={ayatQuery.data ?? []}
                    getKey={(a) => a.id}
                    getLabel={(a) => String(a.nomorAyat)}
                    onSelect={setSelectedAyatAwal}
                  />
                </div>
                <div>
                  <FormLabel>Ayat Akhir</FormLabel>
                  <SimpleSelect
                    disabled={readonly || !selectedSurah}
                    placeholder="Pilih ayat"
                    value={selectedAyatAkhir ? String(selectedAyatAkhir.nomorAyat) : undefined}
                    options={ayatAkhirOptions}
                    getKey={(a) => a.id}
                    getLabel={(a) => String(a.nomorAyat)}
                    onSelect={setSelectedAyatAkhir}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-[#EAECF0] bg-[#FAFAFA] px-4 py-3 text-sm font-semibold text-[#344054]">
                <input
                  type="checkbox"
                  checked={lanjutSurah}
                  disabled={readonly}
                  onChange={(event) => {
                    setLanjutSurah(event.target.checked);
                    setSelectedSurahLanjutan(null);
                    setSelectedAyatAkhir(null);
                  }}
                  className="h-4 w-4 accent-[#288DE5]"
                />
                Lanjut ke surah berikutnya
              </label>

              {lanjutSurah && (
                <div>
                  <FormLabel>Surah Lanjutan</FormLabel>
                  <SimpleSelect
                    disabled={readonly}
                    placeholder="Pilih Surah Lanjutan"
                    value={selectedSurahLanjutan?.name}
                    options={surahQuery.data ?? []}
                    getKey={(s) => s.id}
                    getLabel={(s) => `${s.number}. ${s.name}`}
                    onSelect={(surah) => {
                      setSelectedSurahLanjutan(surah);
                      setSelectedAyatAkhir(null);
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <ReadonlyInput label="Halaman Awal" value={halamanAwal || "-"} />
                <ReadonlyInput label="Halaman Akhir" value={halamanAkhir || "-"} />
              </div>

              <div>
                <FormLabel>Kategori Penilaian</FormLabel>
                <SimpleSelect
                  disabled={readonly}
                  placeholder="Pilih Nilai"
                  value={selectedNilai?.name}
                  options={nilaiQuery.data ?? []}
                  getKey={(n) => n.id}
                  getLabel={(n) => n.name}
                  onSelect={setSelectedNilai}
                />
              </div>

              <div>
                <FormLabel>Jumlah Baris</FormLabel>
                <input
                  type="number"
                  min={0}
                  value={jumlahBaris}
                  disabled={readonly}
                  onChange={(e) => setJumlahBaris(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-[#EAECF0] bg-[#FAFAFA] px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#288DE5] disabled:bg-[#F2F4F7] disabled:text-gray-500"
                />
              </div>

              <div>
                <FormLabel>Keterangan / Catatan</FormLabel>
                <textarea
                  value={keterangan}
                  disabled={readonly}
                  onChange={(e) => setKeterangan(e.target.value)}
                  rows={3}
                  placeholder="Tambahkan catatan perkembangan hafalan..."
                  className="w-full resize-none rounded-xl border border-[#EAECF0] bg-[#FAFAFA] px-4 py-3 text-sm font-medium outline-none transition focus:border-[#288DE5] disabled:bg-[#F2F4F7] disabled:text-gray-500"
                />
              </div>
            </>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-100 bg-white px-5 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitMutation.isPending || isMasterLoading}
          className="flex h-[50px] w-full items-center justify-center rounded-xl bg-[#288DE5] text-base font-bold text-white shadow-md shadow-[#288DE5]/20 transition active:scale-[0.98] disabled:opacity-60"
        >
          {submitMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : readonly ? (
            "Kembali ke Penilaian"
          ) : (
            "Simpan Penilaian"
          )}
        </button>
      </div>
    </div>
  );
}

function findByName<T extends { name: string }>(items: T[], value: string) {
  const normalized = value.toLowerCase().trim();
  return items.find((item) => item.name.toLowerCase().trim() === normalized);
}

function FormLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-sm font-medium text-[#344054]">{children}</p>;
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#667085]" />
      <div className="min-w-0">
        <p className="text-[11px] text-[#667085]">{label}</p>
        <p className="truncate text-sm font-medium text-[#101828]">{value ?? "-"}</p>
      </div>
    </div>
  );
}

function ReadonlyInput({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <FormLabel>{label}</FormLabel>
      <input
        type="text"
        value={value}
        readOnly
        className="w-full rounded-xl border border-[#EAECF0] bg-[#F2F4F7] px-4 py-3 text-sm font-bold text-gray-500"
      />
    </div>
  );
}

function SimpleSelect<T>({
  placeholder,
  value,
  options,
  getKey,
  getLabel,
  onSelect,
  disabled = false,
}: {
  placeholder: string;
  value?: string;
  options: T[];
  getKey: (item: T) => string | number;
  getLabel: (item: T) => string;
  onSelect: (item: T) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between rounded-xl border border-[#EAECF0] bg-white px-4 py-3 text-left text-sm transition disabled:bg-[#F2F4F7] disabled:text-gray-500"
      >
        <span className={value ? "text-black" : "text-gray-400"}>
          {value ?? placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !disabled && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Tutup pilihan"
            onClick={() => setOpen(false)}
          />
          <ul className="absolute left-0 top-full z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
            {options.map((opt) => (
              <li key={getKey(opt)}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(opt);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
                    getLabel(opt) === value ? "font-semibold text-[#288DE5]" : "text-gray-700"
                  }`}
                >
                  {getLabel(opt)}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
