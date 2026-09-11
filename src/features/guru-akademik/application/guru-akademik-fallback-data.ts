import type { AcademicAssessment, AcademicClass, AcademicStudent, AcademicSubject, AcademicTeacher, AcademicAttendance } from "../domain/guru-akademik-types";

export const academicClasses: AcademicClass[] = [
  { id: 24, name: "Kelas VII A", studentCount: 1 },
  { id: 25, name: "Kelas VII B", studentCount: 1 },
  { id: 26, name: "Kelas VIII A", studentCount: 3 },
];

export const academicSubjects: AcademicSubject[] = [
  "Hadits", "Siroh", "Akhlaq", "Aqidah", "PPKn", "Bahasa Indonesia", "Bahasa Inggris", "Matematika", "Fisika", "Kimia", "Biologi",
].map((name, index) => ({ id: index + 1, name, code: name.slice(0, 3).toUpperCase(), category: "akademik" }));

export const academicTeachers: AcademicTeacher[] = [
  { id: "guru-1", name: "Ustadz Muhammad Amar" },
  { id: "guru-2", name: "Ustadz Fikri Abdullah" },
  { id: "guru-3", name: "Ustadzah Aisyah Rahmah" },
];

export const academicStudents: AcademicStudent[] = [
  { id: 421, name: "Ahmad Aqeef Alvaro", nis: "2401014", className: "Kelas VIII A" },
  { id: 424, name: "Akmal Gerrard Kayana Lubis", nis: "2401017", className: "Kelas VIII A" },
  { id: 432, name: "Fathir Tsaqif Alfarizqi", nis: "2401031", className: "Kelas VIII A" },
  { id: 441, name: "Gusti Faeyza Safa Abhista", nis: "2401041", className: "Kelas VII A" },
  { id: 446, name: "Aditya Nur Iksan Salim", nis: "25010030", className: "Kelas VII B" },
];

export const academicAttendanceSeed: AcademicAttendance[] = [
  {
    id: "abs-001", date: "2026-07-10", day: "Jumat", classId: 26, className: "Kelas VIII A", subjectId: 6, subjectName: "Bahasa Indonesia", lessonPeriodId: 1, teacherName: "Ustadz Muhammad Amar", lessonPeriod: 1, meetingNumber: 3, state: "draft",
    material: { theme: "Teks Eksplanasi", content: "Struktur dan ciri kebahasaan teks eksplanasi." },
    items: academicStudents.filter((student) => student.className === "Kelas VIII A").map((student, index) => ({ id: index + 1, studentId: student.id, studentName: student.name, nis: student.nis, status: "Hadir", note: "" })),
  },
];

export const academicAssessmentSeed: AcademicAssessment[] = [
  {
    id: "nilai-001", className: "Kelas VIII A", subjectName: "Bahasa Indonesia", teacherName: "Ustadz Muhammad Amar", schoolYear: "2025/2026", semester: "Semester 2", kkm: 75, status: "done",
    items: academicStudents.filter((student) => student.className === "Kelas VIII A").map((student, index) => ({
      studentId: student.id, studentName: student.name, finalScore: 86 - index * 2, predicate: "B", aspect1: 85, aspect2: 86, aspect3: 84, aspect4: 88, aspect5: 86, aspect6: 87,
    })),
  },
];
