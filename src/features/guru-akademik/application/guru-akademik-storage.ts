import { academicAssessmentSeed, academicAttendanceSeed } from "./guru-akademik-fallback-data";
import type { AcademicAssessment, AcademicAttendance } from "../domain/guru-akademik-types";

const ATTENDANCE_KEY = "alhamra:guru-akademik:attendance";
const ASSESSMENT_KEY = "alhamra:guru-akademik:assessment";

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch { return fallback; }
}

function write<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)); }

export function getAcademicAttendance() { return read<AcademicAttendance[]>(ATTENDANCE_KEY, academicAttendanceSeed); }
export function getAcademicAssessments() { return read<AcademicAssessment[]>(ASSESSMENT_KEY, academicAssessmentSeed); }
export function addAcademicAttendance(item: AcademicAttendance) { const data = [item, ...getAcademicAttendance()]; write(ATTENDANCE_KEY, data); return data; }
export function addAcademicAssessment(item: AcademicAssessment) { const data = [item, ...getAcademicAssessments()]; write(ASSESSMENT_KEY, data); return data; }
export function updateAcademicAttendance(item: AcademicAttendance) { const data = getAcademicAttendance().map((current) => String(current.id) === String(item.id) ? item : current); write(ATTENDANCE_KEY, data); return data; }
export function deleteAcademicAttendance(id: string | number) { const data = getAcademicAttendance().filter((item) => String(item.id) !== String(id)); write(ATTENDANCE_KEY, data); return data; }
