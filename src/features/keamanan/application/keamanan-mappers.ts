import type {
  KeamananActionType,
  KeamananDashboard,
  KeamananManualSearch,
  KeamananPermission,
  KeamananPermissionStatus,
  KeamananScanResult,
  KeamananSummary,
} from "../domain/keamanan-types";

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown): RawRecord {
  return isRecord(value) ? value : {};
}

function text(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
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

function arrayFrom(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];
  const candidates = [value.permissions, value.perizinan, value.perijinan, value.data, value.result, value.list, value.records, value.items, value.results];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (isRecord(candidate)) {
      const nested = arrayFrom(candidate);
      if (nested.length) return nested;
    }
  }
  return [];
}

export function unwrapOdooData(value: unknown): unknown {
  let current = value;
  for (let index = 0; index < 5; index += 1) {
    if (!isRecord(current)) return current;
    if (current.result !== undefined) {
      current = current.result;
      continue;
    }
    if (current.data !== undefined) {
      current = current.data;
      continue;
    }
    return current;
  }
  return current;
}

export function extractOdooMessage(value: unknown): string {
  const root = record(value);
  const result = record(root.result);
  const data = record(result.data ?? root.data);
  return text(root.message, result.message, data.message, root.error, result.error, data.error);
}

export function assertOdooSuccess(value: unknown) {
  const root = record(value);
  const result = record(root.result);
  const status = text(root.status, result.status).toLowerCase();
  const hasError = Boolean(root.error || result.error || status === "error" || status === "failed" || status === "fail");
  if (hasError) {
    throw new Error(extractOdooMessage(value) || "Request Keamanan gagal diproses.");
  }
}

function normalizeAction(value: unknown, permission: KeamananPermission): KeamananActionType {
  const action = text(value).toLowerCase();
  const state = `${permission.state} ${permission.stateLabel}`.toLowerCase();
  if (action.includes("checkin") || action.includes("kembali") || state.includes("permission") || state.includes("keluar")) return "checkin";
  return "checkout";
}

function normalizeStatus(stateValue: string, labelValue: string): KeamananPermissionStatus {
  const marker = `${stateValue} ${labelValue}`.toLowerCase();
  if (marker.includes("approved") || marker.includes("approve") || marker.includes("disetujui")) return "approved";
  if (marker.includes("permission") || marker.includes("ijin_keluar") || marker.includes("izin_keluar") || marker.includes("keluar")) return "outside";
  if (marker.includes("return") || marker.includes("kembali") || marker.includes("selesai")) return "returned";
  if (marker.includes("reject") || marker.includes("tolak")) return "rejected";
  if (marker.includes("cancel") || marker.includes("batal")) return "cancelled";
  return "unknown";
}

export function mapPermission(value: unknown): KeamananPermission {
  const raw = record(value);
  const nested = record(raw.data ?? raw.detail ?? raw.permission ?? raw.perijinan);
  const source = Object.keys(nested).length ? nested : raw;
  const siswa = record(source.siswa ?? source.santri ?? source.student);
  const detail = record(source.detail ?? source.info_perizinan ?? source.info_perijinan ?? source.perizinan);
  const penjemputan = record(source.penjemputan ?? source.info_penjemputan);
  const realisasi = record(source.realisasi ?? source.info_realisasi);
  const permissionId = numberValue(source.permission_id, source.permissionId, source.perijinan_id, source.izin_id, source.id);
  const perijinanId = numberValue(source.perijinan_id, source.permission_id, source.izin_id, source.permissionId, source.id);
  const studentName = text(siswa.name, siswa.nama, source.student_name, source.nama_siswa, source.nama_santri, source.siswa_name, "Santri");
  const studentNis = text(siswa.nis, siswa.no_induk, siswa.barcode, source.student_nis, source.nis, source.no_induk, source.barcode);
  const className = text(siswa.kelas, siswa.class_name, siswa.ruang_kelas, source.class_name, source.kelas, source.ruang_kelas);
  const state = text(source.state, source.status);
  const stateLabel = text(source.state_label, source.status_label, source.status, source.state);
  const reason = text(detail.keperluan, detail.reason, source.reason, source.keperluan, source.keterangan, source.description);
  const dateStart = text(detail.tgl_ijin, detail.tgl_izin, detail.tanggal_ijin, detail.tanggal_izin, source.date_start, source.tgl_ijin, source.tgl_izin, source.tanggal_ijin, source.tanggal_izin);
  const dateReturn = text(detail.tgl_kembali, detail.tanggal_kembali, source.date_return, source.tgl_kembali, source.tanggal_kembali);
  const lamaIzin = text(detail.durasi, detail.lama_ijin, detail.lama_izin, source.lama_ijin, source.lama_izin, source.duration, source.durasi);
  const note = text(detail.catatan, detail.note, source.note, source.catatan);
  return {
    id: numberValue(source.id, permissionId),
    permissionId,
    perijinanId,
    reference: text(source.name, source.reference, source.nomor, source.no_referensi),
    studentName,
    studentNis,
    nis: studentNis,
    className,
    kelas: className,
    kamar: text(siswa.kamar, source.kamar),
    halaqoh: text(siswa.halaqoh, siswa.halaqoh_name, source.halaqoh),
    musyrif: text(siswa.musyrif, siswa.musyrif_name, source.musyrif),
    state,
    stateLabel,
    status: normalizeStatus(state, stateLabel),
    statusLabel: stateLabel,
    reason,
    keperluan: reason,
    dateStart,
    tglIjin: dateStart,
    dateReturn,
    tglKembali: dateReturn,
    lamaIzin,
    duration: lamaIzin,
    durasi: lamaIzin,
    penjemput: text(penjemputan.penjemput, penjemputan.nama_penjemput, source.penjemput),
    jamPenjemputan: text(penjemputan.jam_penjemputan, penjemputan.jam, source.jam_penjemputan),
    waktuKeluar: text(realisasi.waktu_keluar, source.waktu_keluar),
    waktuKembali: text(realisasi.waktu_kembali, source.waktu_kembali),
    terlambatHari: numberValue(realisasi.terlambat_hari, realisasi.late_days, source.terlambat_hari, source.late_days, source.terlambat),
    note,
    catatan: note,
    avatarUrl: text(source.avatar_url),
    raw: source,
  };
}

function mapSummary(value: unknown): KeamananSummary {
  const raw = record(value);
  const summary = record(raw.summary ?? raw["Jumlah Perijinan"]);
  return {
    totalPerijinan: numberValue(summary.total, summary.total_perijinan, raw.total, raw.total_perijinan),
    disetujui: numberValue(summary.Disetujui, summary.approved, summary.disetujui, raw.disetujui, raw.approved),
    ijinKeluar: numberValue(summary["Ijin Keluar"], summary.ijin_keluar, summary.izin_keluar, summary.outside, raw.ijinKeluar),
  };
}

export function mapDashboard(value: unknown): KeamananDashboard {
  const data = record(unwrapOdooData(value));
  return {
    summary: mapSummary(data),
    permissions: arrayFrom(data.permissions ?? data).map(mapPermission).filter((item) => item.permissionId > 0),
  };
}

export function mapScanResult(value: unknown): KeamananScanResult {
  const data = record(unwrapOdooData(value));
  const nested = record(data.result ?? data.data);
  const source = Object.keys(nested).length ? nested : data;
  const permission = mapPermission(source.permission ?? source.perijinan ?? source.data ?? source.detail ?? source);
  return {
    actionType: normalizeAction(source.action_type, permission),
    permission,
    message: text(source.message),
  };
}

export function mapManualSearch(value: unknown): KeamananManualSearch {
  const data = record(unwrapOdooData(value));
  const matchType = text(data.match_type).toLowerCase();
  if (matchType === "multiple") {
    return {
      matchType: "multiple",
      list: arrayFrom(data.list ?? data.results ?? data).map(mapScanResult).filter((item) => item.permission.permissionId > 0),
    };
  }
  if (matchType === "single") {
    const result = mapScanResult(data.detail ?? data);
    return { matchType: "single", result, list: [] };
  }
  const result = mapScanResult(data);
  if (result.permission.permissionId > 0) return { matchType: "single", result, list: [] };
  return { matchType: "none", list: [] };
}

export function isCheckoutPermission(permission: KeamananPermission) {
  const marker = `${permission.state} ${permission.stateLabel}`.toLowerCase();
  return permission.status === "approved" || marker.includes("approved") || marker.includes("approve") || marker.includes("disetujui");
}

export function isOutsidePermission(permission: KeamananPermission) {
  const marker = `${permission.state} ${permission.stateLabel}`.toLowerCase();
  return permission.status === "outside" || marker.includes("permission") || marker.includes("ijin_keluar") || marker.includes("izin_keluar") || marker.includes("keluar");
}

export function getPerijinanId(permission: KeamananPermission) {
  return permission.perijinanId || permission.permissionId || permission.id;
}
