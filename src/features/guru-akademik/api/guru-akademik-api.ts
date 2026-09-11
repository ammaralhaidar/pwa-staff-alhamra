import { apiEndpoints } from "@/lib/api/api-constants";
import { postOdoo } from "@/lib/api/odoo-server";
import {
  mapAcademicActionResult,
  mapAcademicAttendanceDetail,
  mapAcademicAttendanceList,
  mapAcademicClassStudents,
  mapAcademicMasterData,
} from "../application/guru-akademik-mappers";
import type {
  AcademicAttendanceListParams,
  CreateAcademicAttendancePayload,
  UpdateAcademicAttendancePayload,
} from "../domain/guru-akademik-types";

function compact(value: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== ""));
}

export async function getAcademicAttendanceMasterData() {
  return mapAcademicMasterData(await postOdoo(apiEndpoints.guruAkademik.attendanceDropdown, {}));
}

export async function getAcademicStudentsByClass(classId: number) {
  return mapAcademicClassStudents(await postOdoo(apiEndpoints.guruAkademik.attendanceStudentsByClass, { kelas_id: classId }));
}

export async function getAcademicAttendanceList(params: AcademicAttendanceListParams = {}) {
  const response = await postOdoo(apiEndpoints.guruAkademik.attendanceList, compact({
    page: params.page,
    limit: params.limit,
    status: params.status,
    tanggal_dari: params.dateFrom,
    tanggal_sampai: params.dateTo,
    kelas_id: params.classId,
    mapel_id: params.subjectId,
  }));
  return mapAcademicAttendanceList(response);
}

export async function getAcademicAttendanceDetail(attendanceId: number) {
  return mapAcademicAttendanceDetail(await postOdoo(apiEndpoints.guruAkademik.attendanceDetail, { absensi_id: attendanceId }));
}

export async function createAcademicAttendance(payload: CreateAcademicAttendancePayload) {
  const response = await postOdoo(apiEndpoints.guruAkademik.attendanceCreate, compact({
    tanggal: payload.date,
    kelas_id: payload.classId,
    jampelajaran_id: payload.lessonPeriodId,
    mapel_id: payload.subjectId,
    materi: payload.material,
    tema: payload.theme,
    guru_id: payload.teacherId,
    absensi_lines: payload.lines.map((line) => compact({
      siswa_id: line.studentId,
      kehadiran: line.attendance,
      keterangan: line.note,
    })),
  }));
  return mapAcademicActionResult(response);
}

export async function updateAcademicAttendance(payload: UpdateAcademicAttendancePayload) {
  const response = await postOdoo(apiEndpoints.guruAkademik.attendanceUpdate, compact({
    absensi_id: payload.attendanceId,
    materi: payload.material,
    tema: payload.theme,
    absensi_lines: payload.lines?.map((line) => compact({ id: line.id, kehadiran: line.attendance, keterangan: line.note })),
  }));
  return mapAcademicActionResult(response);
}

async function runAttendanceAction(endpoint: string, attendanceId: number) {
  return mapAcademicActionResult(await postOdoo(endpoint, { absensi_id: attendanceId }));
}

export function finalizeAcademicAttendance(attendanceId: number) {
  return runAttendanceAction(apiEndpoints.guruAkademik.attendanceDone, attendanceId);
}

export function reopenAcademicAttendance(attendanceId: number) {
  return runAttendanceAction(apiEndpoints.guruAkademik.attendanceDraft, attendanceId);
}

export function deleteAcademicAttendance(attendanceId: number) {
  return runAttendanceAction(apiEndpoints.guruAkademik.attendanceDelete, attendanceId);
}
