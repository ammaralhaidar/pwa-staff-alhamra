import { apiEndpoints } from "@/lib/api/api-constants";
import { postOdoo } from "@/lib/api/odoo-server";
import type {
  CancelPelanggaranPayload,
  CreatePerijinanPayload,
  DecidePelanggaranPayload,
  Pelanggaran,
  PelanggaranListParams,
  Perijinan,
  PerijinanDecisionPayload,
  PerijinanListParams,
  ProcessPelanggaranPayload,
  StudentSearchParams,
  StudentOption,
  TindakanOption,
} from "../domain/kesantrian-types";
import {
  assertOdooSuccess,
  mapPelanggaran,
  mapPelanggaranList,
  mapPerijinan,
  mapPerijinanList,
  mapStudentOptions,
  mapTindakanList,
  toRecord,
} from "../application/kesantrian-mappers";

function compactPayload(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

function normalizeSearchParams(params?: string | StudentSearchParams) {
  if (typeof params === "string") return { search: params };
  return params ?? {};
}

export async function fetchPerijinanList(params?: PerijinanListParams): Promise<Perijinan[]> {
  const res = await postOdoo<unknown>(apiEndpoints.kesantrian.managerPerizinanList, compactPayload({
    state: params?.state && params.state !== "all" ? params.state : undefined,
    limit: params?.limit,
    offset: params?.offset,
    // TODO: confirm backend support before sending search/date filters.
  }));
  assertOdooSuccess(res);
  return mapPerijinanList(res);
}

export async function fetchPerijinanDetail(izinId: number): Promise<Perijinan> {
  const res = await postOdoo<unknown>(apiEndpoints.kesantrian.managerPerizinanDetail, {
    izin_id: izinId,
  });
  assertOdooSuccess(res);
  return mapPerijinan(toRecord(res));
}

export async function decidePerijinan(payload: PerijinanDecisionPayload): Promise<void> {
  const response = await postOdoo(apiEndpoints.kesantrian.managerPerizinanDecide, compactPayload({
    izin_id: payload.izinId,
    keputusan: payload.keputusan === "approve" ? "Approved" : "Rejected",
    catatan: payload.catatan,
  }));
  assertOdooSuccess(response);
}

export async function createPerijinan(payload: CreatePerijinanPayload): Promise<void> {
  const response = await postOdoo(apiEndpoints.musyrif.perizinanCreate, compactPayload({
    siswa_id: payload.santriId,
    tgl_ijin: payload.tanggalIjin,
    tgl_kembali: payload.tanggalKembali,
    keperluan: payload.keperluan,
    penjemput: payload.penjemput,
    jam_penjemputan: payload.jamPenjemputan,
    catatan: payload.catatan,
  }));
  assertOdooSuccess(response);
}

export async function fetchPelanggaranList(params?: PelanggaranListParams): Promise<Pelanggaran[]> {
  const res = await postOdoo<unknown>(apiEndpoints.pelanggaran.list, compactPayload({
    siswa_id: params?.siswaId ?? params?.santriId,
    state: params?.state && params.state !== "all" ? params.state : undefined,
    limit: params?.limit,
    offset: params?.offset,
    // TODO: confirm backend support before sending search/date filters.
  }));
  assertOdooSuccess(res);
  return mapPelanggaranList(res);
}

export async function fetchPelanggaranDetail(pelanggaranId: number): Promise<Pelanggaran> {
  const res = await postOdoo<unknown>(apiEndpoints.pelanggaran.detail, {
    pelanggaran_id: pelanggaranId,
  });
  assertOdooSuccess(res);
  return mapPelanggaran(toRecord(res));
}

export async function fetchTindakanOptions(): Promise<TindakanOption[]> {
  const res = await postOdoo<unknown>(apiEndpoints.pelanggaran.masterTindakan, {});
  assertOdooSuccess(res);
  return mapTindakanList(res);
}

export async function processPelanggaran(payload: ProcessPelanggaranPayload): Promise<void> {
  const response = await postOdoo(apiEndpoints.pelanggaran.process, {
    pelanggaran_id: payload.pelanggaranId,
    tindakan_id: payload.tindakanId,
    deskripsi_tindakan: payload.deskripsiTindakan ?? "",
  });
  assertOdooSuccess(response);
}

export async function decidePelanggaran(payload: DecidePelanggaranPayload): Promise<void> {
  const response = await postOdoo(apiEndpoints.pelanggaran.decide, {
    pelanggaran_id: payload.pelanggaranId,
    keputusan: payload.keputusan,
    catatan: payload.catatanManager ?? "",
  });
  assertOdooSuccess(response);
}

export async function cancelPelanggaran(payload: CancelPelanggaranPayload): Promise<void> {
  const response = await postOdoo(apiEndpoints.pelanggaran.cancel, compactPayload({
    pelanggaran_id: payload.pelanggaranId,
    alasan: payload.alasan,
  }));
  assertOdooSuccess(response);
}

export async function searchPelanggaranStudents(params?: string | StudentSearchParams): Promise<StudentOption[]> {
  const res = await postOdoo<unknown>(apiEndpoints.pelanggaran.siswaSearch, compactPayload(normalizeSearchParams(params)));
  assertOdooSuccess(res);
  return mapStudentOptions(res);
}
