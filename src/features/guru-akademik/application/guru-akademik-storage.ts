import { academicAssessmentSeed } from "./guru-akademik-fallback-data";
import type { AcademicAssessment } from "../domain/guru-akademik-types";

const ASSESSMENT_KEY = "alhamra:guru-akademik:assessment";

function read<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch { return fallback; }
}

function write<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)); }

export function getAcademicAssessments() { return read<AcademicAssessment[]>(ASSESSMENT_KEY, academicAssessmentSeed); }
export function addAcademicAssessment(item: AcademicAssessment) { const data = [item, ...getAcademicAssessments()]; write(ASSESSMENT_KEY, data); return data; }
