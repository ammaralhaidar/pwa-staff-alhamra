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
import { Skeleton } from "@/components/ui/skeleton";
import { GuruQuranHeader } from "../components/guru-quran-header";
import {
  useAyatList,
  useHalaqohList,
  useNilaiList,
  useSesiList,
  useSubmitTahfidzScore,
  useSurahList,
  useTahfidzDraftDetail,
  useTahfidzHistoryDetail,
  useTahfidzHistorySessions,
  useTahfidzStudents,
} from "../../application/guru-quran-queries";
import type {
  AttendanceSession,
  Ayat,
  NilaiOption,
  Surah,
  TahfidzCategory,
  TahfidzHistoryDetail,
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
  const absenId = Number(attendanceId) || 0;
  const tahfidzId = Number(studentId) || 0;

  const [kategoriTahfidz, setKategoriTahfidz] = useState<TahfidzCategory>("ziyadah");
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedAyatAwal, setSelectedAyatAwal] = useState<Ayat | null>(null);
  const [selectedAyatAkhir, setSelectedAyatAkhir] = useState<Ayat | null>(null);
  const [lanjutSurah, setLanjutSurah] = useState(false);
  const [selectedSurahLanjutan, setSelectedSurahLanjutan] = useState<Surah | null>(null);
  const [selectedNilai, setSelectedNilai] = useState<NilaiOption | null>(null);
  const [keterangan, setKeterangan] = useState("");
  const [readonly, setReadonly] = useState(false);

  const halaqohQuery = useHalaqohList();
  const activeHalaqoh = halaqohQuery.data?.[0];
  const activeHalaqohId = routeState.session?.halaqohId || activeHalaqoh?.id;
  const sessionsQuery = useTahfidzHistorySessions(activeHalaqohId);
  const studentsQuery = useTahfidzStudents(absenId);
  const sesiQuery = useSesiList();
  const fetchedSession = sessionsQuery.data?.find((item) => item.id === absenId);
  const session = enrichSessionWithHalaqoh(fetchedSession ?? routeState.session, activeHalaqoh);
  const student = routeState.student ?? studentsQuery.data?.find((item) => item.tahfidzId === tahfidzId);
  const isDoneStudent = student?.status === "done";
  const resolvedHalaqohId = session?.halaqohId || activeHalaqoh?.id;
  const resolvedSesiId = session?.sesiId || findSesiIdByName(sesiQuery.data ?? [], session?.sesiName);
  const resolvedTanggal = session?.tanggal;

  const surahQuery = useSurahList();
  const ayatQuery = useAyatList(selectedSurah?.id);
  const ayatLanjutanQuery = useAyatList(selectedSurahLanjutan?.id);
  const nilaiQuery = useNilaiList();
  const draftDetailQuery = useTahfidzDraftDetail({
    halaqohId: resolvedHalaqohId,
    sesiId: resolvedSesiId,
    tanggal: resolvedTanggal,
    tahfidzId,
    enabled: tahfidzId > 0 && Boolean(resolvedHalaqohId && resolvedSesiId && resolvedTanggal) && !isDoneStudent && !readonly,
  });
  const historyDetailQuery = useTahfidzHistoryDetail(tahfidzId, tahfidzId > 0 && (isDoneStudent || readonly));
  const submitMutation = useSubmitTahfidzScore();

  const draftDetail = draftDetailQuery.data;
  const historyDetail = historyDetailQuery.data;
  const siswaName = student?.studentName ?? "Santri";
  const siswaNis = student?.nis ? ` (${student.nis})` : "";
  const isMasterLoading = surahQuery.isLoading || nilaiQuery.isLoading;
  const missingDraftFields = [
    !resolvedHalaqohId ? "halaqoh" : "",
    !resolvedSesiId ? "sesi" : "",
    !resolvedTanggal ? "tanggal" : "",
  ].filter(Boolean);
  const hasDraftContext = missingDraftFields.length === 0;
  const readonlyHasLanjutSurah = Boolean(
    historyDetail?.isChangeSurah &&
    historyDetail.surah2 &&
    historyDetail.surah &&
    normalizeText(historyDetail.surah2) !== normalizeText(historyDetail.surah),
  );

  useEffect(() => {
    if (import.meta.env.VITE_API_DEBUG !== "true") return;

    console.info("[guru-quran-score] list_draft context", {
      attendanceId: absenId,
      tahfidzId,
      halaqohId: resolvedHalaqohId,
      sesiId: resolvedSesiId,
      tanggal: resolvedTanggal,
      missing: missingDraftFields,
      session,
    });
  }, [absenId, missingDraftFields, resolvedHalaqohId, resolvedSesiId, resolvedTanggal, session, tahfidzId]);

  const sortedSurahOptions = useMemo(
    () => [...(surahQuery.data ?? [])].sort((a, b) => a.number - b.number),
    [surahQuery.data],
  );

  const filteredSurahOptions = useMemo(() => {
    return sortedSurahOptions;
  }, [sortedSurahOptions]);

  const filteredSurahLanjutanOptions = useMemo(() => {
    return sortedSurahOptions;
  }, [sortedSurahOptions]);

  const currentSurahId = draftDetail?.currentSurah?.id;
  const currentAyatAwalNumber = draftDetail?.currentAyatAwal?.nomorAyat;
  const selectedSurahId = selectedSurah?.id;

  const ayatAwalOptions = useMemo(() => {
    const options = ayatQuery.data ?? [];
    const currentAyat = currentAyatAwalNumber;
    const isCurrentSurah = Boolean(selectedSurahId && currentSurahId && selectedSurahId === currentSurahId);
    if (readonly || kategoriTahfidz === "murojaah" || !currentAyat || !isCurrentSurah) return options;
    return options.filter((item) => item.nomorAyat >= currentAyat);
  }, [ayatQuery.data, currentAyatAwalNumber, currentSurahId, kategoriTahfidz, readonly, selectedSurahId]);

  const ayatAkhirOptions = useMemo(() => {
    if (lanjutSurah) return ayatLanjutanQuery.data ?? [];

    const options = ayatQuery.data ?? [];
    if (!selectedAyatAwal || readonly) return options;
    return options.filter((item) => item.nomorAyat >= selectedAyatAwal.nomorAyat);
  }, [ayatLanjutanQuery.data, ayatQuery.data, lanjutSurah, readonly, selectedAyatAwal]);

  useEffect(() => {
    if (isDoneStudent) setReadonly(true);
  }, [isDoneStudent]);

  useEffect(() => {
    if (!draftDetail?.currentSurah || selectedSurah || readonly || kategoriTahfidz === "murojaah") return;

    const surah = sortedSurahOptions.find((item) =>
      item.id === draftDetail.currentSurah?.id ||
      item.name.toLowerCase() === draftDetail.currentSurah?.name.toLowerCase(),
    );

    if (surah) setSelectedSurah(surah);
  }, [draftDetail, kategoriTahfidz, readonly, selectedSurah, sortedSurahOptions]);

  useEffect(() => {
    if (!draftDetail?.currentAyatAwal || selectedAyatAwal || readonly || kategoriTahfidz === "murojaah") return;

    const ayat = (ayatQuery.data ?? []).find((item) =>
      item.id === draftDetail.currentAyatAwal?.id ||
      item.nomorAyat === draftDetail.currentAyatAwal?.nomorAyat,
    );

    if (ayat) setSelectedAyatAwal(ayat);
  }, [ayatQuery.data, draftDetail, kategoriTahfidz, readonly, selectedAyatAwal]);

  useEffect(() => {
    if (!historyDetail || !readonly) return;

    if (historyDetail.kategoriTahfidz) {
      setKategoriTahfidz(historyDetail.kategoriTahfidz);
    }

    if (!selectedSurah && historyDetail.surah) {
      const surah = findByName(sortedSurahOptions, historyDetail.surah);
      if (surah) setSelectedSurah(surah);
    }

    if (readonlyHasLanjutSurah && historyDetail.surah2 && !selectedSurahLanjutan) {
      const surah = findByName(sortedSurahOptions, historyDetail.surah2);
      if (surah) {
        setLanjutSurah(true);
        setSelectedSurahLanjutan(surah);
      }
    } else if (!readonlyHasLanjutSurah) {
      setLanjutSurah(false);
      setSelectedSurahLanjutan(null);
    }

    if (!selectedNilai && historyDetail.nilai) {
      const nilai = findByName(nilaiQuery.data ?? [], historyDetail.nilai);
      if (nilai) setSelectedNilai(nilai);
    }

    if (!keterangan && historyDetail.keterangan) {
      setKeterangan(historyDetail.keterangan);
    }
  }, [
    historyDetail,
    keterangan,
    nilaiQuery.data,
    readonly,
    readonlyHasLanjutSurah,
    selectedNilai,
    selectedSurah,
    selectedSurahLanjutan,
    sortedSurahOptions,
  ]);

  useEffect(() => {
    if (!lanjutSurah || !selectedSurah || selectedSurahLanjutan || readonly) return;

    const nextSurah = sortedSurahOptions.find((item) => item.number > selectedSurah.number);
    if (nextSurah) setSelectedSurahLanjutan(nextSurah);
  }, [lanjutSurah, readonly, selectedSurah, selectedSurahLanjutan, sortedSurahOptions]);

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
  const lastTahfidzDisplay = readonly
    ? formatHistoryTahfidz(historyDetail) || parseLastTahfidz(draftDetail?.lastTahfidz)
    : parseLastTahfidz(draftDetail?.lastTahfidz);
  const totalHafalanDisplay = readonly
    ? historyDetail?.totalHafalanSiswa || draftDetail?.totalHafalanSiswa
    : draftDetail?.totalHafalanSiswa;

  const statusMessage = useMemo(() => {
    if (!hasDraftContext) return `Data sesi belum lengkap (${missingDraftFields.join(", ")}). Surah dan ayat awal belum bisa diprefill.`;
    if (draftDetailQuery.isLoading) return "Memuat hafalan terakhir santri...";
    return "Lengkapi nilai hafalan santri hari ini.";
  }, [draftDetailQuery.isLoading, hasDraftContext, missingDraftFields]);

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
        jml_baris: 0,
        kategori_tahfidz: kategoriTahfidz,
        keterangan: keterangan.trim() || undefined,
      });

      toast.success("Penilaian berhasil disimpan");
      navigate(`/guru-quran/tahfidz/penilaian/${attendanceId}`, { state: { session } });
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

        {lastTahfidzDisplay || totalHafalanDisplay ? (
          <TahfidzTerakhirCard
            tahfidzTerakhir={lastTahfidzDisplay}
            totalHafalan={totalHafalanDisplay}
          />
        ) : (
          <div className="mt-4 rounded-2xl border border-[#B3E0FF] bg-[#F0F9FF] p-4">
            <p className="text-sm font-semibold text-[#344054]">{statusMessage}</p>
          </div>
        )}

        {isMasterLoading ? (
          <div className="mt-5 space-y-4 rounded-2xl border border-[#EAECF0] bg-white p-5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 rounded-xl" />
              <Skeleton className="h-12 rounded-xl" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : (
          <>
            <div className="mt-5 rounded-2xl border border-[#EAECF0] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <FormLabel>Kategori Setoran</FormLabel>
              <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={readonly}
                  onClick={() => {
                    if (kategoriTahfidz === "ziyadah") return;
                    setKategoriTahfidz("ziyadah");
                    setSelectedSurah(null);
                    setSelectedAyatAwal(null);
                    setSelectedAyatAkhir(null);
                    setLanjutSurah(false);
                    setSelectedSurahLanjutan(null);
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 px-3 text-xs sm:text-sm font-bold transition active:scale-[0.98] ${
                    kategoriTahfidz === "ziyadah"
                      ? "bg-[#288DE5] text-white shadow-md shadow-[#288DE5]/20 ring-2 ring-[#288DE5] ring-offset-1"
                      : "bg-[#F2F4F7] text-[#475467] hover:bg-[#E4E7EC]"
                  } ${readonly ? "opacity-90 cursor-not-allowed" : ""}`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${kategoriTahfidz === "ziyadah" ? "bg-white" : "bg-[#288DE5]"}`} />
                  Ziyadah (Tambah)
                </button>

                <button
                  type="button"
                  disabled={readonly}
                  onClick={() => {
                    if (kategoriTahfidz === "murojaah") return;
                    setKategoriTahfidz("murojaah");
                    setSelectedSurah(null);
                    setSelectedAyatAwal(null);
                    setSelectedAyatAkhir(null);
                    setLanjutSurah(false);
                    setSelectedSurahLanjutan(null);
                  }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 px-3 text-xs sm:text-sm font-bold transition active:scale-[0.98] ${
                    kategoriTahfidz === "murojaah"
                      ? "bg-[#12B76A] text-white shadow-md shadow-[#12B76A]/20 ring-2 ring-[#12B76A] ring-offset-1"
                      : "bg-[#F2F4F7] text-[#475467] hover:bg-[#E4E7EC]"
                  } ${readonly ? "opacity-90 cursor-not-allowed" : ""}`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${kategoriTahfidz === "murojaah" ? "bg-white" : "bg-[#12B76A]"}`} />
                  Murojaah (Ulang)
                </button>
              </div>
            </div>

            <div className="mt-5">
              <FormLabel>Surah</FormLabel>
              <SimpleSelect
                disabled={readonly}
                placeholder="Pilih Surah"
                value={selectedSurah?.name}
                options={filteredSurahOptions}
                getKey={(s) => s.id}
                getLabel={(s) => `${s.number}. ${s.name}`}
                onSelect={(surah) => {
                  setSelectedSurah(surah);
                  setSelectedAyatAwal(null);
                  setSelectedAyatAkhir(null);
                  setLanjutSurah(false);
                  setSelectedSurahLanjutan(null);
                }}
              />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="rounded-xl border border-[#B3E0FF] bg-[#F0F9FF] px-4 py-3 text-sm font-bold text-[#288DE5]">
                Jumlah Ayat: {selectedSurah?.jmlAyat ?? "-"}
              </div>

              <label className="flex items-center gap-3 text-sm font-semibold text-[#344054]">
                <input
                  type="checkbox"
                  checked={lanjutSurah}
                  disabled={readonly || !selectedSurah}
                  onChange={(event) => {
                    const isChecked = event.target.checked;
                    setLanjutSurah(isChecked);
                    setSelectedSurahLanjutan(null);
                    setSelectedAyatAkhir(null);
                    if (isChecked && selectedSurah) {
                      const nextSurah = sortedSurahOptions.find((item) => item.number > selectedSurah.number);
                      setSelectedSurahLanjutan(nextSurah ?? null);
                    }
                  }}
                  className="h-5 w-5 accent-[#288DE5]"
                />
                Lanjut Surah
              </label>
            </div>

            {lanjutSurah && (
              <div className="mt-4">
                <FormLabel>Surah Lanjutan</FormLabel>
                <SimpleSelect
                  disabled={readonly}
                  placeholder="Pilih Surah Lanjutan"
                  value={selectedSurahLanjutan?.name}
                  options={filteredSurahLanjutanOptions}
                  getKey={(s) => s.id}
                  getLabel={(s) => `${s.number}. ${s.name}`}
                  onSelect={(surah) => {
                    setSelectedSurahLanjutan(surah);
                    setSelectedAyatAkhir(null);
                  }}
                />
              </div>
            )}

            <div className="mt-5 space-y-4 rounded-2xl border border-[#EAECF0] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <p className="border-b border-[#F2F4F7] pb-2 text-base font-bold text-[#101828]">Penilaian Tahfidz</p>

              <div className="space-y-4">
                <div>
                  <FormLabel>Ayat Awal</FormLabel>
                  <SimpleSelect
                    disabled={readonly || !selectedSurah}
                    placeholder="Pilih ayat"
                    value={selectedAyatAwal ? String(selectedAyatAwal.nomorAyat) : undefined}
                    options={ayatAwalOptions}
                    getKey={(a) => a.id}
                    getLabel={(a) => String(a.nomorAyat)}
                    onSelect={(ayat) => {
                      setSelectedAyatAwal(ayat);
                      if (!lanjutSurah && selectedAyatAkhir && selectedAyatAkhir.nomorAyat < ayat.nomorAyat) {
                        setSelectedAyatAkhir(null);
                      }
                    }}
                  />
                </div>
                <div>
                  <FormLabel>
                    {lanjutSurah && selectedSurahLanjutan
                      ? `Ayat Akhir (${selectedSurahLanjutan.name})`
                      : "Ayat Akhir"}
                  </FormLabel>
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
            </div>
          </>
        )}
      </main>

      {!readonly && (
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-100 bg-white px-5 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitMutation.isPending || isMasterLoading}
          className="flex h-[50px] w-full items-center justify-center rounded-xl bg-[#288DE5] text-base font-bold text-white shadow-md shadow-[#288DE5]/20 transition active:scale-[0.98] disabled:opacity-60"
        >
          {submitMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Simpan Penilaian"
          )}
        </button>
      </div>
      )}
    </div>
  );
}

function enrichSessionWithHalaqoh(
  session?: AttendanceSession,
  halaqoh?: { id: number; name: string },
) {
  if (!session) return undefined;
  if (!halaqoh) return session;

  return {
    ...session,
    halaqohId: session.halaqohId || halaqoh.id,
    halaqohName: session.halaqohName && session.halaqohName !== "-" ? session.halaqohName : halaqoh.name,
  };
}

function parseLastTahfidz(value?: string) {
  if (!value) return "";

  const [surahPart, ayatPart] = value.split("#").map((part) => part.trim());
  if (!surahPart && !ayatPart) return "";
  if (!ayatPart) return surahPart;

  return `${surahPart} : ${ayatPart}`;
}

function formatHistoryTahfidz(history?: TahfidzHistoryDetail | null) {
  if (!history?.surah || history.ayatAwal === undefined || history.ayatAkhir === undefined) return "";

  const surahText = history.isChangeSurah && history.surah2 && normalizeText(history.surah2) !== normalizeText(history.surah)
    ? `${history.surah} - ${history.surah2}`
    : history.surah;

  return `${surahText} : ayat ${history.ayatAwal} - ${history.ayatAkhir}`;
}

function normalizeText(value?: string) {
  return value?.toLowerCase().trim() ?? "";
}

function findByName<T extends { name: string }>(items: T[], value: string) {
  const normalized = normalizeText(value);
  return items.find((item) => normalizeText(item.name) === normalized);
}

function findSesiIdByName(items: Array<{ id: number; name: string }>, sesiName?: string) {
  const normalizedName = sesiName?.toLowerCase().trim();
  if (!normalizedName || normalizedName === "-") return undefined;

  return items.find((item) => item.name.toLowerCase().trim() === normalizedName)?.id;
}

function FormLabel({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-sm font-medium text-[#344054]">{children}</p>;
}

function TahfidzTerakhirCard({
  tahfidzTerakhir,
  totalHafalan,
}: {
  tahfidzTerakhir?: string;
  totalHafalan?: string;
}) {
  return (
    <div className="mt-4 rounded-2xl border border-[#B3E0FF] bg-[#F0F9FF] p-4 shadow-[0_2px_8px_rgba(40,141,229,0.08)]">
      {totalHafalan && (
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-bold text-[#288DE5]">
            <BookOpen className="h-4 w-4" />
            <span>Total Hafalan</span>
          </div>
          <p className="text-base font-semibold leading-relaxed text-[#101828]">{totalHafalan}</p>
        </div>
      )}

      {tahfidzTerakhir && (
        <div className={totalHafalan ? "mt-4" : ""}>
          <div className="mb-1 flex items-center gap-2 text-sm font-bold text-[#288DE5]">
            <BookOpen className="h-4 w-4" />
            <span>Tahfidz Terakhir</span>
          </div>
          <p className="text-base font-semibold leading-relaxed text-[#101828]">{tahfidzTerakhir}</p>
        </div>
      )}
    </div>
  );
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
  const [search, setSearch] = useState("");
  const filteredOptions = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return options;

    return options.filter((item) => getLabel(item).toLowerCase().includes(keyword));
  }, [getLabel, options, search]);

  function closeDropdown() {
    setOpen(false);
    setSearch("");
  }

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
            onClick={closeDropdown}
          />
          <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
            <div className="border-b border-[#F2F4F7] p-2">
              <input
                type="text"
                value={search}
                autoFocus
                placeholder="Ketik untuk mencari..."
                onChange={(event) => setSearch(event.target.value)}
                onClick={(event) => event.stopPropagation()}
                className="w-full rounded-lg border border-[#EAECF0] bg-[#FAFAFA] px-3 py-2 text-sm font-medium outline-none transition focus:border-[#288DE5]"
              />
            </div>
            <ul className="max-h-52 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <li className="px-4 py-3 text-sm font-medium text-gray-400">
                  Tidak ada pilihan
                </li>
              ) : (
                filteredOptions.map((opt) => (
                  <li key={getKey(opt)}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(opt);
                        closeDropdown();
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition hover:bg-gray-50 ${
                        getLabel(opt) === value ? "font-semibold text-[#288DE5]" : "text-gray-700"
                      }`}
                    >
                      {getLabel(opt)}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
