import { apiEndpoints } from "@/lib/api/api-constants";
import { postOdoo } from "@/lib/api/odoo-server";
import {
  mapActivityList,
  mapMutabaahList,
  mapPerijinan,
  mapPerijinanList,
  mapSesiList,
  mapStudent,
  mapStudentList,
  mapTahfidzList,
  mapTahfidzOptionList,
  mapWalletBalance,
  mapWalletHistory,
  numberValue,
  record,
  unwrapOdooData,
} from "../application/musyrif-mappers";
import type {
  ChangePinPayload,
  CheckPerijinanPayload,
  CreateMutabaahPayload,
  CreatePerijinanPayload,
  CreateTahfidzMusyrifPayload,
  Mutabaah,
  MutabaahActivity,
  MutabaahListParams,
  MutabaahSesi,
  MusyrifPerijinan,
  MusyrifStudent,
  TahfidzMasterOption,
  TahfidzMusyrif,
  TopupPayload,
  WalletBalance,
  WalletHistory,
  WalletHistoryType,
} from "../domain/musyrif-types";

function compactPayload<T extends Record<string, unknown>>(payload: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  ) as Partial<T>;
}

function extractOdooMessage(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const candidates = [
    raw.message,
    raw.error,
    raw.result,
    raw.data,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate;
    if (candidate && typeof candidate === "object") {
      const nested = extractOdooMessage(candidate);
      if (nested) return nested;
    }
  }
  return null;
}

function assertOdooSuccess(response: unknown) {
  const raw = response as Record<string, unknown> | undefined;
  const result = raw?.result as Record<string, unknown> | undefined;
  const nested = result?.result as Record<string, unknown> | undefined;
  const error = raw?.error ?? result?.error ?? nested?.error;
  const status = raw?.status ?? result?.status ?? nested?.status;
  if (error || (typeof status === "number" && status >= 400)) {
    throw new Error(extractOdooMessage(response) ?? "Request gagal diproses.");
  }
  return response;
}

export async function fetchMusyrifPerijinanList(params?: { state?: string }): Promise<MusyrifPerijinan[]> {
  const response = await postOdoo(apiEndpoints.musyrif.perizinanList, compactPayload(params ?? {}));
  assertOdooSuccess(response);
  return mapPerijinanList(response);
}

export async function fetchMusyrifPerijinanDetail(izinId: number): Promise<MusyrifPerijinan> {
  const response = await postOdoo(apiEndpoints.musyrif.perizinanDetail, { izin_id: izinId });
  assertOdooSuccess(response);
  return mapPerijinan(unwrapOdooData(response));
}

export async function createMusyrifPerijinan(payload: CreatePerijinanPayload): Promise<{ id: number; raw: unknown }> {
  const response = await postOdoo(apiEndpoints.musyrif.perizinanCreate, compactPayload(payload));
  assertOdooSuccess(response);
  const data = record(unwrapOdooData(response));
  return {
    id: numberValue(data.id, data.izin_id, (response as Record<string, unknown>)?.id),
    raw: response,
  };
}

export async function checkMusyrifPerijinan(payload: CheckPerijinanPayload) {
  return assertOdooSuccess(await postOdoo(apiEndpoints.musyrif.perizinanCheck, { izin_id: payload.izin_id }));
}

export async function fetchMusyrifStudents(search?: string): Promise<MusyrifStudent[]> {
  const response = await postOdoo(apiEndpoints.musyrif.siswaList, compactPayload({ search }));
  assertOdooSuccess(response);
  return mapStudentList(response);
}

export async function fetchMusyrifStudentDetail(santriId: number): Promise<MusyrifStudent> {
  const response = await postOdoo(apiEndpoints.musyrif.siswaDetail, { siswa_id: santriId });
  assertOdooSuccess(response);
  return mapStudent(unwrapOdooData(response));
}

export async function fetchWalletBalance(santriId: number): Promise<WalletBalance> {
  const response = await postOdoo(apiEndpoints.musyrif.saldoUangSakuDompet, { siswa_id: santriId });
  assertOdooSuccess(response);
  return mapWalletBalance(response, santriId);
}

export async function fetchWalletHistory(santriId: number, type: WalletHistoryType): Promise<WalletHistory[]> {
  const response = await postOdoo(apiEndpoints.musyrif.historyUangSakuDompet, { siswa_id: santriId, tipe: type });
  assertOdooSuccess(response);
  return mapWalletHistory(response, type);
}

export async function topupWallet(payload: TopupPayload) {
  return assertOdooSuccess(await postOdoo(apiEndpoints.musyrif.topupDompet, compactPayload(payload)));
}

export async function changeStudentPin(payload: ChangePinPayload) {
  return assertOdooSuccess(await postOdoo(apiEndpoints.musyrif.ubahPin, compactPayload(payload)));
}

export async function fetchMutabaahList(params?: MutabaahListParams): Promise<Mutabaah[]> {
  const response = await postOdoo(apiEndpoints.mutabaah.list, compactPayload(params ?? {}));
  assertOdooSuccess(response);
  return mapMutabaahList(response);
}

export async function fetchMutabaahSesi(): Promise<MutabaahSesi[]> {
  const response = await postOdoo(apiEndpoints.mutabaah.sesiList, {});
  assertOdooSuccess(response);
  return mapSesiList(response);
}

export async function fetchMutabaahActivities(sesiId?: number): Promise<MutabaahActivity[]> {
  const response = await postOdoo(apiEndpoints.mutabaah.aktivitasList, compactPayload({ sesi_id: sesiId }));
  assertOdooSuccess(response);
  return mapActivityList(response);
}

export async function createMutabaah(payload: CreateMutabaahPayload) {
  return assertOdooSuccess(await postOdoo(apiEndpoints.mutabaah.create, compactPayload(payload)));
}

export async function fetchTahfidzMusyrifList(): Promise<TahfidzMusyrif[]> {
  const response = await postOdoo(apiEndpoints.musyrif.tahfidzList, {});
  assertOdooSuccess(response);
  return mapTahfidzList(response);
}

export async function createTahfidzMusyrif(payload: CreateTahfidzMusyrifPayload) {
  return assertOdooSuccess(await postOdoo(apiEndpoints.musyrif.tahfidzCreate, compactPayload(payload)));
}

export async function fetchTahfidzSesi(): Promise<TahfidzMasterOption[]> {
  const response = await postOdoo(apiEndpoints.tahfidz.sesiList, {});
  assertOdooSuccess(response);
  return mapTahfidzOptionList(response);
}

export async function fetchTahfidzSurah(): Promise<TahfidzMasterOption[]> {
  const response = await postOdoo(apiEndpoints.tahfidz.surah, {});
  assertOdooSuccess(response);
  return mapTahfidzOptionList(response);
}

export async function fetchTahfidzAyat(surahId?: number): Promise<TahfidzMasterOption[]> {
  const response = await postOdoo(apiEndpoints.tahfidz.ayat, compactPayload({ surah_id: surahId }));
  assertOdooSuccess(response);
  return mapTahfidzOptionList(response);
}

export async function fetchTahfidzNilai(): Promise<TahfidzMasterOption[]> {
  const response = await postOdoo(apiEndpoints.tahfidz.nilai, {});
  assertOdooSuccess(response);
  return mapTahfidzOptionList(response);
}

export async function fetchMusyrifPegawai(): Promise<TahfidzMasterOption[]> {
  const response = await postOdoo(apiEndpoints.musyrif.pegawaiList, {});
  assertOdooSuccess(response);
  return mapTahfidzOptionList(response);
}
