export type AcademicAttendanceStatus = "Hadir" | "Izin" | "Sakit" | "Alpa";
export type AcademicAssessmentStatus = "draft" | "done";
export type AcademicAttendanceState = "draft" | "done";

export type AcademicClass = { id: number; name: string; studentCount?: number };
export type AcademicLessonPeriod = { id: number; name: string; startTime?: number; endTime?: number };
export type AcademicSubject = { id: number; name: string; code?: string; category?: string };
export type AcademicTeacher = { id: string | number; name: string; nip?: string };
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
  name?: string;
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
  state: AcademicAttendanceState;
  material: { theme?: string; content: string };
  items: AcademicAttendanceItem[];
  recap?: AcademicAttendanceRecap;
};

export type AcademicAttendanceRecap = {
  present: number;
  sick: number;
  permitted: number;
  absent: number;
  total: number;
};

export type AcademicAttendanceMasterData = {
  classes: AcademicClass[];
  lessonPeriods: AcademicLessonPeriod[];
  subjects: AcademicSubject[];
  teachers: AcademicTeacher[];
  currentTeacher?: AcademicTeacher;
  isManager: boolean;
};

export type AcademicClassStudents = {
  classInfo: AcademicClass;
  students: Array<AcademicStudent & { defaultAttendance: AcademicAttendanceStatus }>;
};

export type AcademicAttendanceListParams = {
  page?: number;
  limit?: number;
  status?: AcademicAttendanceState | "semua";
  dateFrom?: string;
  dateTo?: string;
  classId?: number;
  subjectId?: number;
};

export type AcademicAttendancePagination = {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
};

export type AcademicAttendanceListResult = {
  records: AcademicAttendance[];
  pagination: AcademicAttendancePagination;
};

export type CreateAcademicAttendancePayload = {
  date: string;
  classId: number;
  lessonPeriodId: number;
  subjectId: number;
  material: string;
  theme?: string;
  teacherId?: number;
  lines: Array<{
    studentId: number;
    attendance: AcademicAttendanceStatus;
    note?: string;
  }>;
};

export type UpdateAcademicAttendancePayload = {
  attendanceId: number;
  material?: string;
  theme?: string;
  lines?: Array<{
    id: number;
    attendance: AcademicAttendanceStatus;
    note?: string;
  }>;
};

export type AcademicAttendanceActionResult = {
  id?: number;
  state?: AcademicAttendanceState;
  message: string;
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
