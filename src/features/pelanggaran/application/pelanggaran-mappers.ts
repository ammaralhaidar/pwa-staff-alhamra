import type {
  MasterPelanggaran,
  Pelanggaran,
  PelanggaranApiError,
  PelanggaranStatus,
  StudentOption,
  TindakanOption,
} from "../domain/pelanggaran-types";

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown): RawRecord {
  return isRecord(value) ? value : {};
}

function text(...values: unknown[]): string {
  for (const value of values) {
    if (value === null || value === undefined || value === false) continue;
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function numberValue(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return 0;
}

function dateText(...values: unknown[]): string {
  const value = text(...values);
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return value.includes("T") ? parsed.toISOString().slice(0, 10) : value.slice(0, 10);
}

function relationLabel(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return text(value[1], value[0]);
  if (isRecord(value)) return text(value.name, value.nama, value.display_name, value.label);
  return "";
}

function relationId(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && Number.isFinite(Number(value))) return Number(value);
  if (Array.isArray(value)) return numberValue(value[0]) || undefined;
  if (isRecord(value)) return numberValue(value.id, value.value) || undefined;
  return undefined;
}

function nested(source: RawRecord, keys: string[]): RawRecord {
  for (const key of keys) {
    if (isRecord(source[key])) return source[key] as RawRecord;
  }
  return {};
}

function unwrapResult(value: unknown): unknown {
  let current = value;
  for (let i = 0; i < 4; i += 1) {
    if (!isRecord(current)) return current;
    if (Array.isArray(current.data)) return current.data;
    if (current.data === false || current.data === null) return [];
    if (current.result !== undefined) {
      current = current.result;
      continue;
    }
    if (current.data !== undefined) {
      current = current.data;
      continue;
    }
    if (current.records !== undefined) {
      current = current.records;
      continue;
    }
    if (current.items !== undefined) {
      current = current.items;
      continue;
    }
    if (current.list !== undefined) {
      current = current.list;
      continue;
    }
    return current;
  }
  return current;
}

function arrayFrom(value: unknown): unknown[] {
  const unwrapped = unwrapResult(value);
  if (Array.isArray(unwrapped)) return unwrapped;
  if (!isRecord(unwrapped)) return [];
  for (const candidate of [unwrapped.data, unwrapped.records, unwrapped.items, unwrapped.list, unwrapped.result]) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

export function unwrapOdooData(value: unknown): unknown {
  return unwrapResult(value);
}

export function mapOdooError(value: unknown): PelanggaranApiError | null {
  const root = record(value);
  const result = record(root.result);
  const nestedResult = record(result.result);
  const data = record(result.data);
  const candidates = [
    root.error,
    result.error,
    nestedResult.error,
    data.error,
    root,
    result,
    nestedResult,
    data,
  ];

  for (const candidate of candidates) {
    const raw = record(candidate);
    const message = text(raw.message, raw.error, record(raw.data).message);
    const status = numberValue(raw.status, raw.code);
    if (message || (status && status !== 200 && status !== 201)) {
      const lowerMessage = message.toLowerCase();
      const isUnauthorized = [401, 403].includes(status) || lowerMessage.includes("unauthorized") || lowerMessage.includes("session") || lowerMessage.includes("access denied");
      return {
        message: isUnauthorized ? "Sesi kamu sudah berakhir. Silakan login kembali." : message || "Request pelanggaran gagal",
        status: status || undefined,
        raw: candidate,
      };
    }
  }

  return null;
}

export function assertOdooSuccess(value: unknown) {
  const error = mapOdooError(value);
  if (error?.status && error.status !== 200 && error.status !== 201) {
    throw new Error(error.message);
  }
}

export function normalizePelanggaranStatus(value: unknown): PelanggaranStatus {
  const status = text(value).toLowerCase();
  if (["diperiksa", "proses", "process", "confirmed", "confirm"].includes(status)) return "proses";
  if (["validasi", "validated", "validate", "validation"].includes(status)) return "validasi";
  if (["selesai", "done", "finish", "finished", "approved"].includes(status)) return "selesai";
  if (["batal", "cancel", "cancelled", "canceled", "reject", "rejected"].includes(status)) return "batal";
  return "draft";
}

export function mapPelanggaran(item: unknown): Pelanggaran {
  const raw = record(unwrapOdooData(item));
  const siswa = nested(raw, ["siswa", "santri", "student", "siswa_detail", "santri_detail"]);
  const master = nested(raw, ["masterPelanggaran", "master_pelanggaran", "info_pelanggaran", "pelanggaran_detail", "jenis_pelanggaran"]);
  const tindakan = nested(raw, ["info_tindakan", "tindakan_detail", "tindakan"]);
  const keputusan = nested(raw, ["keputusan", "decision", "info_keputusan"]);
  const id = numberValue(raw.id, raw.pelanggaran_id);
  const reference = text(raw.name, raw.no_referensi, raw.noReferensi, raw.reference, raw.ref, `PG-${id}`);
  const tanggal = dateText(raw.tgl, raw.tanggal, raw.date);
  const status = normalizePelanggaranStatus(raw.state ?? raw.status ?? raw.state_label ?? raw.status_label);
  const catatan = text(raw.catatan, raw.deskripsi, raw.deskripsi_pelanggaran, master.deskripsi_pelanggaran, master.deskripsi);

  return {
    id,
    noReferensi: reference,
    reference,
    santriId: numberValue(raw.santriId, raw.santri_id, raw.siswa_id, relationId(raw.santri_id), relationId(raw.siswa_id), siswa.id),
    namaSantri: text(
      raw.siswa_name,
      raw.nama_siswa,
      raw.namaSantri,
      raw.nama_santri,
      raw.name_siswa,
      siswa.name,
      siswa.nama,
      relationLabel(raw.siswa_id),
      relationLabel(raw.santri_id),
      "Santri",
    ),
    kelasSantri: text(raw.kelas, raw.kelas_santri, raw.kelasSantri, raw.class_name, siswa.kelas, siswa.class_name),
    tgl: tanggal,
    tanggal,
    masterPelanggaranId: numberValue(
      raw.masterPelanggaranId,
      raw.master_pelanggaran_id,
      raw.pelanggaran_id,
      relationId(raw.pelanggaran_id),
      relationId(raw.master_pelanggaran_id),
      master.id,
    ),
    namaPelanggaran: text(
      raw.pelanggaran,
      raw.nama_pelanggaran,
      raw.namaPelanggaran,
      master.nama,
      master.name,
      relationLabel(raw.pelanggaran_id),
      "Pelanggaran",
    ),
    jenisPelanggaran: text(raw.jenis, raw.jenis_pelanggaran, raw.jenisPelanggaran, master.jenis, master.jenis_pelanggaran),
    kategori: text(raw.kategori, master.kategori),
    poin: numberValue(raw.poin_potensi, raw.poin, raw.points, master.poin),
    tindakan: text(raw.tindakan, raw.tindakan_nama, tindakan.tindakan_nama, tindakan.name, tindakan.tindakan, relationLabel(raw.tindakan_id)),
    catatan,
    deskripsi: catatan,
    status,
    statusLabel: text(raw.state_label, raw.status_label, raw.state, raw.status, status),
    pelaporName: text(raw.pelapor_name, raw.pelapor, relationLabel(raw.pelapor_id), relationLabel(raw.create_uid)),
    detail: raw,
    infoTindakan: {
      tindakanId: numberValue(tindakan.tindakan_id, tindakan.id, relationId(raw.tindakan_id)) || undefined,
      tindakanNama: text(tindakan.tindakan_nama, tindakan.name, tindakan.tindakan, raw.tindakan),
      deskripsiTindakan: text(tindakan.deskripsi_tindakan, raw.deskripsi_tindakan),
    },
    keputusan: {
      userDisetujui: text(keputusan.user_disetujui, keputusan.userDisetujui, keputusan.user, relationLabel(keputusan.user_id)),
      catatanKaAsrama: text(keputusan.catatan_ka_asrama, keputusan.catatanKaAsrama, keputusan.catatan, raw.catatan_manager),
    },
  };
}

export function mapPelanggaranList(value: unknown): Pelanggaran[] {
  return arrayFrom(value).map(mapPelanggaran).filter((item) => item.id > 0);
}

export function mapStudentOptions(value: unknown): StudentOption[] {
  return arrayFrom(value).map((item) => {
    const raw = record(item);
    return {
      id: numberValue(raw.id, raw.siswa_id, raw.santri_id),
      name: text(raw.name, raw.nama, raw.siswa_name, raw.nama_siswa, raw.nama_santri, "Santri"),
      nis: text(raw.nis, raw.no_induk),
      kelas: text(raw.kelas, raw.class_name, raw.kelas_santri),
      kamar: text(raw.kamar, raw.asrama),
      halaqoh: text(raw.halaqoh),
    };
  }).filter((item) => item.id > 0);
}

export function mapMasterPelanggaran(value: unknown): MasterPelanggaran[] {
  return arrayFrom(value).map((item) => {
    const raw = record(item);
    return {
      id: numberValue(raw.id, raw.pelanggaran_id),
      name: text(raw.name, raw.nama, raw.nama_pelanggaran, "Pelanggaran"),
      jenis: text(raw.jenis, raw.jenis_pelanggaran),
      kategori: text(raw.kategori),
      poin: numberValue(raw.poin, raw.poin_potensi, raw.points),
      deskripsi: text(raw.deskripsi, raw.description, raw.deskripsi_pelanggaran),
    };
  }).filter((item) => item.id > 0);
}

export function mapTindakanOptions(value: unknown): TindakanOption[] {
  return arrayFrom(value).map((item) => {
    const raw = record(item);
    return {
      id: numberValue(raw.id, raw.tindakan_id),
      name: text(raw.name, raw.nama, raw.tindakan, "Tindakan"),
    };
  }).filter((item) => item.id > 0);
}

export function mapCreateId(value: unknown): number {
  const raw = record(unwrapOdooData(value));
  const data = record(raw.data);
  return numberValue(data.id, raw.id, raw.pelanggaran_id);
}
