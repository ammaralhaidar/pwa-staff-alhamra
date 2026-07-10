export type AcademicAttendanceStatus = "Hadir" | "Izin" | "Sakit" | "Alpa";
export type AcademicAssessmentStatus = "draft" | "done";

export type AcademicClass = { id: number; name: string; studentCount?: number };
export type AcademicLessonPeriod = { id: number; name: string; startTime?: number; endTime?: number };
export type AcademicSubject = { id: number; name: string; code?: string; category?: string };
export type AcademicTeacher = { id: string; name: string };
export type AcademicStudent = { id: number; name: string; nis: string; className: string };

export type AcademicAttendanceItem = {
  id?: number;
  studentId: number;
  studentName: string;
  nis?: string;
  status: AcademicAttendanceStatus;
  note?: string;
};

export type AcademicAttendance = {
  id: string | number;
  date: string;
  day?: string;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  lessonPeriodId: number;
  teacherName: string;
  lessonPeriod: number;
  meetingNumber: number;
  state: "draft" | "done";
  material: { theme?: string; content: string };
  items: AcademicAttendanceItem[];
};

export type AcademicAssessmentStudentInput = {
  studentId: number;
  studentName: string;
  finalScore: number | null;
  predicate: string;
  aspect1: number | null;
  aspect2: number | null;
  aspect3: number | null;
  aspect4: number | null;
  aspect5: number | null;
  aspect6: number | null;
};

export type AcademicAssessment = {
  id: string;
  className: string;
  subjectName: string;
  teacherName: string;
  schoolYear: string;
  semester: string;
  kkm: number;
  status: AcademicAssessmentStatus;
  items: AcademicAssessmentStudentInput[];
};
