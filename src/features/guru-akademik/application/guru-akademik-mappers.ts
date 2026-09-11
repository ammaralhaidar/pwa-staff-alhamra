import type {
  AcademicAttendance,
  AcademicAttendanceActionResult,
  AcademicAttendanceListResult,
  AcademicAttendanceMasterData,
  AcademicAttendanceRecap,
  AcademicAttendanceStatus,
  AcademicClassStudents,
} from "../domain/guru-akademik-types";

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function text(value: unknown, fallback = "-") {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return fallback;
}

function number(value: unknown, fallback = 0) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function status(value: unknown): AcademicAttendanceStatus {
  const normalized = text(value, "Hadir").toLowerCase();
  if (normalized === "izin") return "Izin";
  if (normalized === "sakit") return "Sakit";
  if (normalized === "alpa") return "Alpa";
  return "Hadir";
}

function relation(value: unknown) {
  const source = record(value);
  return { id: number(source.id), name: text(source.name) };
}

function rootResult(value: unknown) {
  const outer = record(value);
  const result = record(outer.result ?? value);
  return record(result.result ?? result);
}

export function assertGuruAkademikSuccess(value: unknown) {
  const result = rootResult(value);
  const apiStatus = number(result.status, 200);
  if (apiStatus >= 400) {
    const message = text(result.message ?? result.error, "Request Absensi Guru gagal diproses.");
    throw new Error(message);
  }
  return result;
}

export function guruAkademikData(value: unknown): unknown {
  return assertGuruAkademikSuccess(value).data;
}

function mapRecap(value: unknown, itemCount = 0): AcademicAttendanceRecap {
  const source = record(value);
  return {
    present: number(source.hadir),
    sick: number(source.sakit),
    permitted: number(source.izin),
    absent: number(source.alpa),
    total: number(source.total, itemCount),
  };
}

export function mapAcademicAttendance(value: unknown): AcademicAttendance {
  const source = record(value);
  const classInfo = relation(source.kelas);
  const subject = relation(source.mapel);
  const lesson = relation(source.jam_pelajaran);
  const teacher = relation(source.guru);
  const rawLines = list(source.absensi_lines);
  const items = rawLines.map((entry) => {
    const line = record(entry);
    return {
      id: number(line.id) || undefined,
      studentId: number(line.siswa_id),
      studentName: text(line.nama_siswa ?? line.siswa_name),
      nis: text(line.nis, ""),
      status: status(line.kehadiran),
      note: text(line.keterangan, ""),
    };
  });

  const lessonNumber = number(source.jam_ke ?? source.lesson_period ?? lesson.name.replace(/\D/g, ""));
  return {
    id: number(source.id) || text(source.id, "0"),
    name: text(source.name, ""),
    date: text(source.tanggal, ""),
    day: text(source.hari, ""),
    classId: classInfo.id,
    className: classInfo.name,
    subjectId: subject.id,
    subjectName: subject.name,
    lessonPeriodId: lesson.id,
    lessonPeriod: lessonNumber,
    teacherName: teacher.name,
    meetingNumber: number(source.pertemuan_ke),
    state: text(source.state, "draft").toLowerCase() === "done" ? "done" : "draft",
    material: {
      theme: text(source.tema, ""),
      content: text(source.materi, ""),
    },
    items,
    recap: mapRecap(source.rekap_kehadiran, items.length),
  };
}

export function mapAcademicMasterData(value: unknown): AcademicAttendanceMasterData {
  const source = record(guruAkademikData(value));
  const currentTeacher = relation(source.current_guru);
  return {
    classes: list(source.kelas).map((entry) => {
      const item = record(entry);
      return { id: number(item.id), name: text(item.name), studentCount: number(item.jumlah_siswa) };
    }).filter((item) => item.id > 0),
    lessonPeriods: list(source.jam_pelajaran).map((entry) => {
      const item = record(entry);
      return { id: number(item.id), name: text(item.name), startTime: number(item.start_time), endTime: number(item.end_time) };
    }).filter((item) => item.id > 0),
    subjects: list(source.mapel).map((entry) => {
      const item = record(entry);
      return { id: number(item.id), name: text(item.name), code: text(item.kode, ""), category: text(item.kategori, "") };
    }).filter((item) => item.id > 0),
    teachers: list(source.guru).map((entry) => {
      const item = record(entry);
      return { id: number(item.id), name: text(item.name), nip: text(item.nip, "") };
    }).filter((item) => typeof item.id === "number" && item.id > 0),
    currentTeacher: currentTeacher.id > 0 ? currentTeacher : undefined,
    isManager: source.is_manager === true,
  };
}

export function mapAcademicClassStudents(value: unknown): AcademicClassStudents {
  const source = record(guruAkademikData(value));
  const classInfo = record(source.kelas);
  const className = text(classInfo.name);
  return {
    classInfo: { id: number(classInfo.id), name: className, studentCount: number(classInfo.jumlah_siswa) },
    students: list(source.siswa).map((entry) => {
      const item = record(entry);
      return {
        id: number(item.id),
        name: text(item.name),
        nis: text(item.nis, ""),
        className,
        defaultAttendance: status(item.default_kehadiran),
      };
    }).filter((item) => item.id > 0),
  };
}

export function mapAcademicAttendanceList(value: unknown): AcademicAttendanceListResult {
  const source = record(guruAkademikData(value));
  const pagination = record(source.pagination);
  return {
    records: list(source.records).map(mapAcademicAttendance),
    pagination: {
      page: number(pagination.page, 1),
      limit: number(pagination.limit, 20),
      totalRecords: number(pagination.total_records),
      totalPages: number(pagination.total_pages, 1),
    },
  };
}

export function mapAcademicAttendanceDetail(value: unknown) {
  return mapAcademicAttendance(guruAkademikData(value));
}

export function mapAcademicActionResult(value: unknown): AcademicAttendanceActionResult {
  const result = assertGuruAkademikSuccess(value);
  const data = record(result.data);
  const stateValue = text(data.state, "").toLowerCase();
  return {
    id: number(data.id) || undefined,
    state: stateValue === "done" ? "done" : stateValue === "draft" ? "draft" : undefined,
    message: text(result.message, "Aksi absensi berhasil diproses."),
  };
}
