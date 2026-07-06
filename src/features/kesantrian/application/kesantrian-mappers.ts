import type {
  Pelanggaran,
  PelanggaranStatus,
  Perijinan,
  PerijinanStatus,
  StudentOption,
  TindakanOption,
} from "../domain/kesantrian-types";

type RawRecord = Record<string, unknown>;

export function unwrapOdooData(raw: unknown): unknown {
  if (!raw || raw === false) return raw;

  const root = raw as RawRecord;
  let result = root?.result ?? raw;

  if (isRecord(result) && result.result != null) {
    result = result.result;
  }

  if (isRecord(result) && result.status != null && result.status !== 200 && result.status !== 201) {
    throw new Error(String(result.message ?? "Request Odoo gagal"));
  }

  if (isRecord(result) && result.data != null) {
    return result.data;
  }

  if (isRecord(result)) {
    for (const key of ["records", "items", "list"]) {
      if (Array.isArray(result[key])) return result[key];
    }
  }

  return result;
}

export function assertOdooSuccess(raw: unknown) {
  const message = extractOdooMessage(raw);
  if (message) throw new Error(message);
}

export function extractOdooMessage(raw: unknown): string | undefined {
  if (!isRecord(raw)) return undefined;
  const result = isRecord(raw.result) ? raw.result : undefined;
  const nestedResult = result && isRecord(result.result) ? result.result : undefined;
  const candidates = [raw, result, nestedResult].filter(Boolean) as RawRecord[];

  for (const candidate of candidates) {
    if (isRecord(candidate.error)) {
      const error = candidate.error;
      const data = isRecord(error.data) ? error.data : undefined;
      return optionalString(data?.message ?? error.message);
    }
    const status = candidate.status;
    if (status != null && status !== 200 && status !== 201 && status !== "success") {
      return optionalString(candidate.message) ?? "Request Odoo gagal";
    }
  }

  return undefined;
}

export function toArray(raw: unknown): RawRecord[] {
  const data = unwrapOdooData(raw);
  if (!data || data === false) return [];
  if (Array.isArray(data)) return data as RawRecord[];
  if (isRecord(data)) {
    for (const key of ["records", "items", "list", "data"]) {
      if (Array.isArray(data[key])) return data[key] as RawRecord[];
    }
  }
  return [];
}

export function toRecord(raw: unknown): RawRecord {
  const data = unwrapOdooData(raw);
  return isRecord(data) ? data : {};
}

export function normalizePerijinanStatus(raw: unknown): PerijinanStatus {
  const value = String(raw ?? "draft").toLowerCase().trim();
  if (["check", "diperiksa", "menunggu", "menunggu persetujuan"].includes(value)) return "check";
  if (["approve", "approved", "disetujui", "izin", "ijin"].includes(value)) return "approve";
  if (["reject", "rejected", "ditolak", "tolak"].includes(value)) return "reject";
  if (["permission", "keluar", "checkout", "out", "ijin keluar", "izin keluar"].includes(value)) return "keluar";
  if (["kembali", "returned", "return"].includes(value)) return "kembali";
  if (["done", "selesai"].includes(value)) return "selesai";
  return "draft";
}

export function normalizePelanggaranStatus(raw: unknown): PelanggaranStatus {
  const value = String(raw ?? "draft").toLowerCase().trim();
  if (["proses", "process", "confirmed", "diperiksa"].includes(value)) return "proses";
  if (["validasi", "validation"].includes(value)) return "validasi";
  if (["selesai", "done"].includes(value)) return "selesai";
  if (["batal", "cancel", "cancelled", "tolak"].includes(value)) return "batal";
  return "draft";
}

export function perijinanStatusLabel(status: PerijinanStatus) {
  const labels: Record<PerijinanStatus, string> = {
    draft: "Draft",
    check: "Menunggu Persetujuan",
    approve: "Disetujui",
    reject: "Ditolak",
    keluar: "Sedang Keluar",
    kembali: "Sudah Kembali",
    selesai: "Selesai",
  };
  return labels[status];
}

export function pelanggaranStatusLabel(status: PelanggaranStatus) {
  const labels: Record<PelanggaranStatus, string> = {
    draft: "Draft",
    proses: "Proses",
    validasi: "Validasi",
    selesai: "Selesai",
    batal: "Batal",
  };
  return labels[status];
}

export function mapPerijinan(raw: RawRecord): Perijinan {
  const isDetail = isRecord(raw.siswa) || isRecord(raw.detail) || isRecord(raw.penjemputan);
  const siswa = (isRecord(raw.siswa) ? raw.siswa : {}) as RawRecord;
  const detail = (isRecord(raw.detail) ? raw.detail : {}) as RawRecord;
  const penjemputan = (isRecord(raw.penjemputan) ? raw.penjemputan : {}) as RawRecord;
  const realisasi = (isRecord(raw.realisasi) ? raw.realisasi : {}) as RawRecord;
  const status = normalizePerijinanStatus(raw.state ?? raw.status ?? raw.state_label ?? raw.status_label);
  const tanggalIjin = dateOnly(
    isDetail
      ? detail.tgl_ijin ?? detail.tanggal_ijin ?? detail.tanggal_izin
      : raw.tgl_ijin ?? raw.tanggal_ijin ?? raw.tanggal_izin ?? raw.tanggalIjin,
  );
  const id = numberOrZero(raw.id);
  const reference = stringOr(raw.name ?? raw.no_referensi ?? raw.noReferensi ?? raw.reference, generateReference("KI", id, tanggalIjin));
  const waktuKeluar = dateTimeOrUndefined(isDetail ? realisasi.waktu_keluar : raw.waktu_keluar);
  const waktuKembali = dateTimeOrUndefined(isDetail ? realisasi.waktu_kembali : raw.waktu_kembali);
  const terlambatHari = numberOrUndefined(isDetail ? realisasi.terlambat ?? realisasi.terlambat_hari : raw.terlambat_hari);

  return {
    id,
    santriId: numberOrZero(isDetail ? siswa.id : raw.siswa_id ?? raw.santri_id ?? raw.santriId),
    noReferensi: optionalString(raw.no_referensi ?? raw.noReferensi ?? raw.reference ?? raw.name),
    reference,
    tanggalIjin,
    tanggalKembali: dateOnlyOrUndefined(isDetail ? detail.tgl_kembali ?? detail.tanggal_kembali : raw.tgl_kembali ?? raw.tanggal_kembali),
    keperluan: stringOr(isDetail ? detail.keperluan : raw.keperluan, "-"),
    penjemput: stringOr(isDetail ? penjemputan.penjemput : raw.penjemput, "-"),
    jamPenjemputan: stringOr(isDetail ? penjemputan.jam_penjemputan : raw.jam_penjemputan ?? raw.jamPenjemputan, "-"),
    catatan: optionalString(isDetail ? detail.catatan : raw.catatan),
    status,
    statusLabel: perijinanStatusLabel(status),
    durasi: optionalString(isDetail ? detail.durasi : raw.durasi),
    namaSantri: stringOr(isDetail ? siswa.name : raw.siswa_name ?? raw.nama_siswa ?? raw.nama_santri ?? recordValue(raw.santri, "nama"), "Santri"),
    kelasSantri: optionalString(isDetail ? siswa.kelas : raw.siswa_class ?? raw.kelas_santri ?? raw.kelas),
    kamarSantri: optionalString(isDetail ? siswa.kamar : raw.siswa_room ?? raw.kamar),
    halaqohSantri: optionalString(isDetail ? siswa.halaqoh : raw.siswa_halaqoh ?? raw.halaqoh),
    musyrifName: optionalString(isDetail ? siswa.musyrif : raw.musyrif_name),
    waktuKeluar,
    waktuKembali,
    terlambatHari,
    alasanTolak: optionalString(raw.alasan_tolak ?? raw.alasanTolak ?? detail.alasan_tolak),
    managerNote: optionalString(raw.manager_note ?? raw.catatan_manager ?? detail.catatan_manager),
    realisasiKeamanan: {
      waktuKeluar,
      waktuKembali,
      terlambatHari,
    },
  };
}

export function mapPerijinanList(raw: unknown): Perijinan[] {
  return toArray(raw).map(mapPerijinan).sort((a, b) => b.id - a.id);
}

export function mapPelanggaran(raw: RawRecord): Pelanggaran {
  const infoPelanggaran = (isRecord(raw.info_pelanggaran) ? raw.info_pelanggaran : {}) as RawRecord;
  const infoTindakan = (isRecord(raw.info_tindakan) ? raw.info_tindakan : {}) as RawRecord;
  const keputusan = (isRecord(raw.keputusan) ? raw.keputusan : {}) as RawRecord;
  const status = normalizePelanggaranStatus(raw.state ?? raw.status ?? raw.state_label ?? raw.status_label);
  const tanggal = dateOnly(raw.tgl ?? raw.tanggal);
  const id = numberOrZero(raw.id);
  const reference = stringOr(raw.name ?? raw.no_referensi ?? raw.noReferensi ?? raw.reference, generateReference("PL", id, tanggal));

  return {
    id,
    noReferensi: optionalString(raw.no_referensi ?? raw.noReferensi ?? raw.reference ?? raw.name),
    reference,
    santriId: numberOrZero(raw.siswa_id ?? raw.santriId ?? recordValue(raw.siswa, "id")),
    namaSantri: stringOr(raw.siswa_name ?? raw.namaSantri ?? recordValue(raw.siswa, "name") ?? recordValue(raw.santri, "nama"), "Santri"),
    kelasSantri: optionalString(raw.kelas ?? recordValue(raw.siswa, "kelas") ?? recordValue(raw.santri, "kelas")),
    tgl: optionalString(raw.tgl),
    tanggal,
    masterPelanggaranId: numberOrZero(raw.pelanggaran_id ?? raw.masterPelanggaranId),
    namaPelanggaran: stringOr(raw.pelanggaran ?? infoPelanggaran.nama ?? recordValue(raw.masterPelanggaran, "nama"), "-"),
    jenisPelanggaran: optionalString(raw.jenis_pelanggaran ?? infoPelanggaran.jenis),
    kategori: optionalString(raw.kategori ?? infoPelanggaran.kategori),
    poin: numberOrZero(raw.poin_potensi ?? raw.poin ?? infoPelanggaran.poin),
    tindakan: optionalString(raw.tindakan ?? infoTindakan.tindakan_nama),
    deskripsi: optionalString(raw.deskripsi ?? infoPelanggaran.deskripsi ?? infoPelanggaran.deskripsi_pelanggaran),
    catatan: optionalString(raw.catatan ?? infoPelanggaran.catatan),
    status,
    statusLabel: pelanggaranStatusLabel(status),
    pelaporName: optionalString(recordValue(raw.pelapor, "name") ?? raw.pelapor),
    detail: raw,
    infoTindakan: {
      tindakanId: numberOrUndefined(infoTindakan.tindakan_id),
      tindakanNama: optionalString(infoTindakan.tindakan_nama),
      deskripsiTindakan: optionalString(infoTindakan.deskripsi_tindakan),
      diperiksaOleh: optionalString(infoTindakan.diperiksa_oleh),
    },
    keputusan: {
      userDisetujui: optionalString(keputusan.user_disetujui),
      catatanKaAsrama: optionalString(keputusan.catatan_ka_asrama),
    },
  };
}

export function mapPelanggaranList(raw: unknown): Pelanggaran[] {
  return toArray(raw).map(mapPelanggaran).sort((a, b) => b.id - a.id);
}

export function mapTindakanList(raw: unknown): TindakanOption[] {
  return toArray(raw).map((item) => ({
    id: numberOrZero(item.id),
    name: stringOr(item.name ?? item.nama, "-"),
  }));
}

export function mapStudentOptions(raw: unknown): StudentOption[] {
  return toArray(raw).map((item) => ({
    id: numberOrZero(item.id ?? item.siswa_id),
    name: stringOr(item.name ?? item.siswa_name ?? item.nama, "Santri"),
    kelas: optionalString(item.kelas ?? item.class_name),
    kamar: optionalString(item.kamar ?? item.room),
    halaqoh: optionalString(item.halaqoh),
  }));
}

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordValue(value: unknown, key: string) {
  return isRecord(value) ? value[key] : undefined;
}

function stringOr(value: unknown, fallback: string) {
  if (value === null || value === undefined || value === false || value === "") return fallback;
  return String(value);
}

function optionalString(value: unknown) {
  if (value === null || value === undefined || value === false || value === "") return undefined;
  return String(value);
}

function numberOrZero(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseInt(value, 10) || 0;
  return 0;
}

function numberOrUndefined(value: unknown) {
  if (value === null || value === undefined || value === false || value === "") return undefined;
  return numberOrZero(value);
}

function dateOnly(value: unknown) {
  const raw = optionalString(value);
  if (!raw) return new Date().toISOString().slice(0, 10);
  return raw.split("T")[0].split(" ")[0];
}

function dateOnlyOrUndefined(value: unknown) {
  const raw = optionalString(value);
  return raw ? dateOnly(raw) : undefined;
}

function dateTimeOrUndefined(value: unknown) {
  return optionalString(value);
}

function generateReference(prefix: string, id: number, date: string) {
  const parsed = new Date(date);
  const yy = Number.isNaN(parsed.getTime()) ? "00" : String(parsed.getFullYear()).slice(-2);
  const mm = Number.isNaN(parsed.getTime()) ? "00" : String(parsed.getMonth() + 1).padStart(2, "0");
  return `${prefix}/${yy}.${mm}/${String(id).padStart(4, "0")}`;
}
