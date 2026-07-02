import { apiEndpoints } from "@/lib/api/api-constants";
import { postOdoo } from "@/lib/api/odoo-server";
import type {
  Ayat,
  CreateAttendanceResult,
  CreateTahfidzAttendancePayload,
  Halaqoh,
  NilaiOption,
  Sesi,
  SubmitTahfidzScorePayload,
  Surah,
  TahfidzDraftDetail,
  TahfidzHistoryDetail,
  TahfidzStudent,
  Ustadz,
  AttendanceSession,
} from "../domain/guru-quran-types";
import {
  mapAttendanceList,
  mapCreateAttendanceResult,
  mapHalaqohList,
  mapNilaiList,
  mapSesiList,
  mapSurahList,
  mapTahfidzDraftDetail,
  mapTahfidzHistoryDetail,
  mapTahfidzStudents,
  mapUstadzList,
  mapAyatList,
} from "../application/guru-quran-mappers";

export async function fetchHalaqohList(): Promise<Halaqoh[]> {
  const response = await postOdoo<unknown>(apiEndpoints.guruQuran.halaqohList, {});
  return mapHalaqohList(response);
}

export async function fetchSesiList(): Promise<Sesi[]> {
  const response = await postOdoo<unknown>(apiEndpoints.tahfidz.sesiList, {});
  return mapSesiList(response);
}

export async function fetchUstadzList(halaqohId?: number): Promise<Ustadz[]> {
  const response = await postOdoo<unknown>(apiEndpoints.guruQuran.ustadzList, {
    ...(halaqohId ? { halaqoh_id: halaqohId } : {}),
  });
  return mapUstadzList(response);
}

export async function fetchTahfidzHistorySessions(params: {
  halaqohId: number;
  limit?: number;
  offset?: number;
}): Promise<AttendanceSession[]> {
  const response = await postOdoo<unknown>(apiEndpoints.tahfidz.historySessions, {
    halaqoh_id: params.halaqohId,
    limit: params.limit ?? 50,
    offset: params.offset ?? 0,
  });
  return mapAttendanceList(response);
}

export async function createTahfidzAttendance(payload: CreateTahfidzAttendancePayload): Promise<CreateAttendanceResult> {
  const response = await postOdoo<unknown>(apiEndpoints.guruQuran.absenTahfidzCreate, payload);
  return mapCreateAttendanceResult(response);
}

export async function confirmTahfidzAttendance(absenId: number): Promise<void> {
  await postOdoo(apiEndpoints.guruQuran.absenTahfidzConfirm, { absen_id: absenId });
}

export async function fetchTahfidzStudents(absenId: number): Promise<TahfidzStudent[]> {
  const response = await postOdoo<unknown>(apiEndpoints.tahfidz.historySiswa, { absen_id: absenId });
  return mapTahfidzStudents(response);
}

export async function fetchSurahList(): Promise<Surah[]> {
  const response = await postOdoo<unknown>(apiEndpoints.tahfidz.surah, {});
  return mapSurahList(response);
}

export async function fetchAyatList(surahId: number): Promise<Ayat[]> {
  const response = await postOdoo<unknown>(apiEndpoints.tahfidz.ayat, { surah_id: surahId });
  return mapAyatList(response);
}

export async function fetchNilaiList(): Promise<NilaiOption[]> {
  const response = await postOdoo<unknown>(apiEndpoints.tahfidz.nilai, {});
  return mapNilaiList(response);
}

export async function fetchTahfidzDraftDetail(params: {
  halaqohId: number;
  sesiId: number;
  tanggal: string;
  tahfidzId: number;
}): Promise<TahfidzDraftDetail | null> {
  const response = await postOdoo<unknown>(apiEndpoints.tahfidz.listDraft, {
    halaqoh_id: params.halaqohId,
    sesi_id: params.sesiId,
    tanggal: params.tanggal,
  });
  return mapTahfidzDraftDetail(response, params.tahfidzId);
}

export async function fetchTahfidzHistoryDetail(tahfidzId: number): Promise<TahfidzHistoryDetail | null> {
  const response = await postOdoo<unknown>(apiEndpoints.tahfidz.historyDetail, { tahfidz_id: tahfidzId });
  return mapTahfidzHistoryDetail(response, tahfidzId);
}

export async function submitTahfidzScore(payload: SubmitTahfidzScorePayload): Promise<void> {
  await postOdoo(apiEndpoints.tahfidz.update, payload);
}
