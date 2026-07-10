export type AttendanceStatus = "draft" | "done";

export type AttendancePresence = "Hadir" | "Sakit" | "Izin" | "Alpa";

export type TimeRangeFilter = "today" | "7days" | "30days" | "all";

export type StudentAssessmentStatus = "draft" | "pending" | "done";

export type SchoolYear = {
  id: number;
  name: string;
};

export type GuruQuranStudent = {
  id: number;
  name: string;
  nis?: string;
};

export type Ustadz = {
  id: number;
  name: string;
  nip?: string;
  jobTitle?: string;
  mobilePhone?: string;
  workEmail?: string;
  isPenanggungJawab?: boolean;
};

export type Sesi = {
  id: number;
  name: string;
  keterangan?: string;
};

export type Halaqoh = {
  id: number;
  name: string;
  tahunAjaran?: SchoolYear;
  penanggungJawab?: {
    id: number;
    name: string;
  };
  jumlahSiswa: number;
  ustadz: Ustadz[];
  siswa: GuruQuranStudent[];
};

export type Surah = {
  id: number;
  name: string;
  number: number;
  jmlAyat: number;
};

export type Ayat = {
  id: number;
  name: string;
  nomorAyat: number;
  page?: number;
};

export type NilaiOption = {
  id: number;
  name: string;
};

export type AttendanceSession = {
  id: number;
  halaqohId: number;
  halaqohName: string;
  sesiId: number;
  sesiName: string;
  ustadzId: number;
  ustadzName: string;
  tanggal: string;
  jumlahSiswa: number;
  status: AttendanceStatus;
  raw?: Record<string, unknown>;
};

export type TahfidzStudent = {
  tahfidzId: number;
  studentId: number;
  studentName: string;
  nis?: string;
  kelas?: string;
  status: StudentAssessmentStatus;
  summaryHafalan?: string;
  raw?: Record<string, unknown>;
};

export type TahfidzDraftDetail = {
  tahfidzId: number;
  lastTahfidz?: string;
  totalHafalanSiswa?: string;
  currentSurah?: {
    id: number;
    name: string;
    number?: number;
  };
  currentAyatAwal?: {
    id: number;
    nomorAyat: number;
    page?: number;
  };
  raw?: Record<string, unknown>;
};

export type TahfidzHistoryDetail = {
  tahfidzId: number;
  totalHafalanSiswa?: string;
  surah?: string;
  surah2?: string;
  ayatAwal?: number;
  ayatAkhir?: number;
  halaman?: string;
  nilai?: string;
  jmlBaris?: number;
  keterangan?: string;
  isChangeSurah: boolean;
  raw?: Record<string, unknown>;
};

export type CreateTahfidzAttendancePayload = {
  halaqoh_id: number;
  ustadz_id: number;
  sesi_id: number;
  tanggal: string;
  keterangan?: string;
  absen_lines: Array<{
    siswa_id: number;
    kehadiran: AttendancePresence;
  }>;
};

export type CreateAttendanceResult = {
  id: number;
  data?: Record<string, unknown>;
};

export type SubmitTahfidzScorePayload = {
  tahfidz_id: number;
  surah_id: number;
  ayat_awal: number;
  ayat_akhir: number;
  nilai_id: number;
  jml_baris: number;
  keterangan?: string;
  is_change_surah?: boolean;
  surah2_id?: number;
};
