import { apiEndpoints } from "@/lib/api/api-constants";
import { postOdoo } from "@/lib/api/odoo-server";
import {
  assertOdooSuccess,
  mapCreateId,
  mapMasterPelanggaran,
  mapPelanggaran,
  mapPelanggaranList,
  mapStudentOptions,
  mapTindakanOptions,
  unwrapOdooData,
} from "../application/pelanggaran-mappers";
import type {
  CancelPelanggaranPayload,
  CreatePelanggaranPayload,
  DecidePelanggaranPayload,
  MasterJenisParams,
  MasterPelanggaran,
  Pelanggaran,
  PelanggaranListParams,
  ProcessPelanggaranPayload,
  SearchSiswaParams,
  StudentOption,
  TindakanOption,
} from "../domain/pelanggaran-types";

function compactPayload(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

function normalizeSearchParams(params?: string | SearchSiswaParams | MasterJenisParams) {
  if (typeof params === "string") return { search: params };
  return params ?? {};
}

export async function fetchPelanggaranList(params?: PelanggaranListParams): Promise<Pelanggaran[]> {
  const response = await postOdoo(apiEndpoints.pelanggaran.list, {
    ...compactPayload({
      siswa_id: params?.siswaId,
      state: params?.state && params.state !== "all" ? params.state : undefined,
      limit: params?.limit,
      offset: params?.offset,
      is_my_santri: params?.isMySantri,
    }),
  });
  assertOdooSuccess(response);
  return mapPelanggaranList(response);
}

export async function fetchPelanggaranDetail(pelanggaranId: number): Promise<Pelanggaran> {
  const response = await postOdoo(apiEndpoints.pelanggaran.detail, { pelanggaran_id: pelanggaranId });
  assertOdooSuccess(response);
  return mapPelanggaran(unwrapOdooData(response));
}

export async function searchPelanggaranStudents(params?: string | SearchSiswaParams): Promise<StudentOption[]> {
  const response = await postOdoo(apiEndpoints.pelanggaran.siswaSearch, compactPayload(normalizeSearchParams(params)));
  assertOdooSuccess(response);
  return mapStudentOptions(response);
}

export async function fetchMasterPelanggaran(params?: string | MasterJenisParams): Promise<MasterPelanggaran[]> {
  const response = await postOdoo(apiEndpoints.pelanggaran.masterJenis, compactPayload(normalizeSearchParams(params)));
  assertOdooSuccess(response);
  return mapMasterPelanggaran(response);
}

export async function fetchTindakanOptions(): Promise<TindakanOption[]> {
  const response = await postOdoo(apiEndpoints.pelanggaran.masterTindakan, {});
  assertOdooSuccess(response);
  return mapTindakanOptions(response);
}

export async function createPelanggaran(payload: CreatePelanggaranPayload): Promise<number> {
  const response = await postOdoo(apiEndpoints.pelanggaran.create, compactPayload({
    siswa_id: payload.siswaId,
    pelanggaran_id: payload.pelanggaranId,
    tgl: payload.tgl,
    catatan: payload.catatan,
  }));
  assertOdooSuccess(response);
  const createdId = mapCreateId(response);
  if (payload.autoConfirm !== false && createdId > 0) {
    await confirmPelanggaran(createdId);
  }
  return createdId;
}

export async function confirmPelanggaran(pelanggaranId: number) {
  const response = await postOdoo(apiEndpoints.pelanggaran.confirm, { pelanggaran_id: pelanggaranId });
  assertOdooSuccess(response);
  return response;
}

export async function processPelanggaran(payload: ProcessPelanggaranPayload) {
  const response = await postOdoo(apiEndpoints.pelanggaran.process, {
    pelanggaran_id: payload.pelanggaranId,
    tindakan_id: payload.tindakanId,
    deskripsi_tindakan: payload.deskripsiTindakan ?? "",
  });
  assertOdooSuccess(response);
  return response;
}

export async function cancelPelanggaran(payload: CancelPelanggaranPayload) {
  const response = await postOdoo(apiEndpoints.pelanggaran.cancel, compactPayload({
    pelanggaran_id: payload.pelanggaranId,
    alasan: payload.alasan,
  }));
  assertOdooSuccess(response);
  return response;
}

export async function decidePelanggaran(payload: DecidePelanggaranPayload) {
  const response = await postOdoo(apiEndpoints.pelanggaran.decide, {
    pelanggaran_id: payload.pelanggaranId,
    keputusan: payload.keputusan,
    catatan: payload.catatanManager ?? "",
  });
  assertOdooSuccess(response);
  return response;
}
