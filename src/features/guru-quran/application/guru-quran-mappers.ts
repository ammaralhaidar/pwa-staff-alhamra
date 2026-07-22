import type {
  AttendanceSession,
  AttendanceStatus,
  Ayat,
  CreateAttendanceResult,
  GuruQuranStudent,
  Halaqoh,
  NilaiOption,
  Sesi,
  StudentAssessmentStatus,
  Surah,
  TahfidzCategory,
  TahfidzDraftDetail,
  TahfidzHistoryDetail,
  TahfidzStudent,
  Ustadz,
} from "../domain/guru-quran-types";

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown): RawRecord {
  return isRecord(value) ? value : {};
}

function arrayFrom(value: unknown): RawRecord[] {
  if (Array.isArray(value)) return value.filter(isRecord);
  const raw = record(value);
  const candidates = [raw.data, raw.items, raw.records, raw.result];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate.filter(isRecord);
  }
  return [];
}

export function unwrapOdooData(value: unknown): unknown {
  let current = value;
  for (let i = 0; i < 4; i += 1) {
    const raw = record(current);
    if (raw.result !== undefined) {
      current = raw.result;
      continue;
    }
    if (raw.data !== undefined) {
      current = raw.data;
      continue;
    }
    return current;
  }
  return current;
}

function text(...values: unknown[]): string {
  for (const value of values) {
    if (Array.isArray(value)) {
      const fromPair = text(value[1], value[0]);
      if (fromPair) return fromPair;
    }
    if (value !== null && value !== undefined && value !== false && `${value}`.trim() !== "") {
      return `${value}`.trim();
    }
  }
  return "";
}

function numberValue(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    if (Array.isArray(value) && typeof value[0] === "number") return value[0];
  }
  return 0;
}

function dateText(value: unknown): string {
  const raw = text(value);
  return raw ? raw.split("T")[0] : "";
}

function mapNestedIdName(value: unknown) {
  const raw = record(value);
  return {
    id: numberValue(raw.id, value),
    name: text(raw.name, Array.isArray(value) ? value[1] : undefined),
  };
}

export function mapStudent(value: unknown): GuruQuranStudent {
  const raw = record(value);
  return {
    id: numberValue(raw.id, raw.siswa_id, raw.santri_id),
    name: text(raw.name, raw.siswa_name, raw.santri_name, raw.nama, "-"),
    nis: text(raw.nis) || undefined,
  };
}

export function mapUstadz(value: unknown): Ustadz {
  const raw = record(value);
  return {
    id: numberValue(raw.id, raw.ustadz_id),
    name: text(raw.name, raw.ustadz_name, "-"),
    nip: text(raw.nip) || undefined,
    jobTitle: text(raw.job_title) || undefined,
    mobilePhone: text(raw.mobile_phone) || undefined,
    workEmail: text(raw.work_email) || undefined,
    isPenanggungJawab: raw.is_penanggung_jawab === true,
  };
}

export function mapHalaqoh(value: unknown): Halaqoh {
  const raw = record(value);
  const tahunAjaran = raw.tahun_ajaran ? mapNestedIdName(raw.tahun_ajaran) : undefined;
  const penanggungJawab = raw.penanggung_jawab ? mapNestedIdName(raw.penanggung_jawab) : undefined;

  return {
    id: numberValue(raw.id, raw.halaqoh_id),
    name: text(raw.name, raw.halaqoh_name, "-"),
    tahunAjaran: tahunAjaran?.id || tahunAjaran?.name ? tahunAjaran : undefined,
    penanggungJawab: penanggungJawab?.id || penanggungJawab?.name ? penanggungJawab : undefined,
    jumlahSiswa: numberValue(raw.jumlah_siswa, raw.jumlah_santri, arrayFrom(raw.siswa).length),
    ustadz: arrayFrom(raw.ustadz).map(mapUstadz).filter((item) => item.id > 0),
    siswa: arrayFrom(raw.siswa).map(mapStudent).filter((item) => item.id > 0),
  };
}

export function mapHalaqohList(raw: unknown): Halaqoh[] {
  return arrayFrom(unwrapOdooData(raw)).map(mapHalaqoh).filter((item) => item.id > 0);
}

export function mapSesiList(raw: unknown): Sesi[] {
  return arrayFrom(unwrapOdooData(raw)).map((item) => ({
    id: numberValue(item.id, item.sesi_id),
    name: text(item.name, item.sesi_name, "-"),
    keterangan: text(item.keterangan) || undefined,
  })).filter((item) => item.id > 0);
}

export function mapUstadzList(raw: unknown): Ustadz[] {
  return arrayFrom(unwrapOdooData(raw)).map(mapUstadz).filter((item) => item.id > 0);
}

export function mapSurahList(raw: unknown): Surah[] {
  return arrayFrom(unwrapOdooData(raw)).map((item) => ({
    id: numberValue(item.id),
    name: text(item.name, "-"),
    number: numberValue(item.number, item.nomor, item.sequence, item.id),
    jmlAyat: numberValue(item.jml_ayat, item.ayat_count, item.jumlah_ayat),
  })).filter((item) => item.id > 0);
}

export function mapAyatList(raw: unknown): Ayat[] {
  return arrayFrom(unwrapOdooData(raw)).map((item) => {
    const nomorAyat = numberValue(item.nomor_ayat, item.ayat, item.name);
    return {
      id: numberValue(item.id),
      name: nomorAyat ? `Ayat ${nomorAyat}` : text(item.name, "-"),
      nomorAyat,
      page: numberValue(item.page, item.halaman) || undefined,
    };
  }).filter((item) => item.id > 0 && item.nomorAyat > 0);
}

export function mapNilaiList(raw: unknown): NilaiOption[] {
  return arrayFrom(unwrapOdooData(raw)).map((item) => ({
    id: numberValue(item.id),
    name: text(item.name, "-"),
  })).filter((item) => item.id > 0);
}

export function mapAttendanceSession(value: unknown): AttendanceSession {
  const raw = record(value);
  const id = numberValue(raw.id, raw.absen_id);
  const halaqoh = record(raw.halaqoh);
  const sesi = record(raw.sesi);
  const ustadz = record(raw.ustadz);
  const statusText = text(raw.status, raw.state, raw.status_penilaian).toLowerCase();

  const totalCount = numberValue(raw.jumlah_siswa, raw.jumlah_santri, raw.jumlah_items, raw.jumlahItems, arrayFrom(raw.absen_lines).length);
  const doneCount = numberValue(raw.done_count, raw.doneCount, raw.jumlah_selesai);

  const status: AttendanceStatus =
    statusText === "done" || statusText === "selesai" || (totalCount > 0 && doneCount === totalCount)
      ? "done"
      : statusText === "partial" || statusText === "proses" || doneCount > 0
        ? "partial"
        : "draft";

  return {
    id,
    halaqohId: numberValue(halaqoh.id, raw.halaqoh_id),
    halaqohName: text(halaqoh.name, raw.halaqoh_name, raw.halaqoh, "-"),
    sesiId: numberValue(sesi.id, raw.sesi_id),
    sesiName: text(sesi.name, raw.sesi_name, raw.sesi, "-"),
    ustadzId: numberValue(ustadz.id, raw.ustadz_id),
    ustadzName: text(ustadz.name, raw.ustadz_name, raw.ustadz, "Ustadz"),
    tanggal: dateText(raw.tanggal ?? raw.date),
    jumlahSiswa: totalCount,
    doneCount,
    status,
    raw,
  };
}

export function mapAttendanceList(raw: unknown): AttendanceSession[] {
  return arrayFrom(unwrapOdooData(raw)).map(mapAttendanceSession).filter((item) => item.id > 0);
}

export function mapTahfidzStudents(raw: unknown): TahfidzStudent[] {
  return arrayFrom(unwrapOdooData(raw))
    .map((item) => {
      const status = text(item.status, item.statusPenilaian).toLowerCase();
      const normalizedStatus: StudentAssessmentStatus = status === "done" ? "done" : status === "pending" ? "pending" : "draft";
      const kategoriRaw = text(item.kategori_tahfidz, item.kategoriTahfidz).toLowerCase();
      const kategoriTahfidz: TahfidzCategory = kategoriRaw === "murojaah" ? "murojaah" : "ziyadah";
      return {
        tahfidzId: numberValue(item.tahfidz_id, item.id),
        studentId: numberValue(item.siswa_id, item.student_id, item.santri_id, item.santriId),
        studentName: text(item.siswa_name, item.student_name, item.santri_name, item.nama, item.name, "Santri"),
        nis: text(item.nis) || undefined,
        kelas: text(item.kelas) || undefined,
        status: normalizedStatus,
        summaryHafalan: text(item.summary_hafalan, item.hafalan, item.last_tahfidz) || undefined,
        kategoriTahfidz,
        raw: item,
      };
    })
    .filter((item) => item.tahfidzId > 0)
    .sort((a, b) => a.studentName.localeCompare(b.studentName, "id", { sensitivity: "base" }));
}

export function mapTahfidzDraftDetail(rawValue: unknown, tahfidzId: number): TahfidzDraftDetail | null {
  const rows = arrayFrom(unwrapOdooData(rawValue));
  const source = rows.find((item) => numberValue(item.id, item.tahfidz_id) === tahfidzId);
  if (!source) return null;

  const currentSurah = record(source.current_surah);
  const currentAyatAwal = record(source.current_ayat_awal);
  const kategoriRaw = text(source.kategori_tahfidz, source.kategoriTahfidz).toLowerCase();

  return {
    tahfidzId,
    lastTahfidz: text(source.last_tahfidz) || undefined,
    totalHafalanSiswa: text(source.total_hafalan_siswa) || undefined,
    kategoriTahfidz: kategoriRaw === "murojaah" ? "murojaah" : "ziyadah",
    currentSurah: currentSurah.id || currentSurah.name ? {
      id: numberValue(currentSurah.id),
      name: text(currentSurah.name, "-"),
      number: numberValue(currentSurah.number) || undefined,
    } : undefined,
    currentAyatAwal: currentAyatAwal.id || currentAyatAwal.nomor_ayat ? {
      id: numberValue(currentAyatAwal.id),
      nomorAyat: numberValue(currentAyatAwal.nomor_ayat),
      page: numberValue(currentAyatAwal.page) || undefined,
    } : undefined,
    raw: source,
  };
}

export function mapTahfidzHistoryDetail(rawValue: unknown, tahfidzId: number): TahfidzHistoryDetail | null {
  const source = record(unwrapOdooData(rawValue));
  if (Object.keys(source).length === 0) return null;
  const kategoriRaw = text(source.kategori_tahfidz, source.kategoriTahfidz).toLowerCase();

  return {
    tahfidzId,
    totalHafalanSiswa: text(source.total_hafalan_siswa) || undefined,
    surah: text(source.surah) || undefined,
    surah2: text(source.surah2, source.surah_2) || undefined,
    ayatAwal: numberValue(source.ayat_awal) || undefined,
    ayatAkhir: numberValue(source.ayat_akhir) || undefined,
    halaman: text(source.halaman) || undefined,
    nilai: text(source.nilai) || undefined,
    jmlBaris: numberValue(source.jml_baris) || undefined,
    keterangan: text(source.keterangan) || undefined,
    isChangeSurah: source.is_change_surah === true,
    kategoriTahfidz: kategoriRaw === "murojaah" ? "murojaah" : "ziyadah",
    raw: source,
  };
}

export function mapCreateAttendanceResult(rawValue: unknown): CreateAttendanceResult {
  const source = record(unwrapOdooData(rawValue));
  const data = record(source.data);
  return {
    id: numberValue(data.id, source.id, source.absen_id),
    data: Object.keys(data).length ? data : source,
  };
}
