export type MusyrifPerijinanStatus =
  | "draft"
  | "check"
  | "approve"
  | "reject"
  | "keluar"
  | "kembali"
  | "selesai";

export type MusyrifFilterRange = "today" | "7days" | "30days" | "all";

export type MusyrifApiError = {
  message: string;
  code?: number | string;
  unauthorized?: boolean;
};

export type PaginationParams = {
  limit?: number;
  offset?: number;
};

export type MusyrifPerijinan = {
  id: number;
  name: string;
  santriId?: number;
  santriName: string;
  nis?: string;
  kelas?: string;
  status: MusyrifPerijinanStatus;
  statusLabel: string;
  tanggalIzin?: string;
  tanggalKembali?: string;
  jamKeluar?: string;
  jamKembali?: string;
  durasi?: string;
  penjemput?: string;
  keperluan?: string;
  catatan?: string;
  managerNote?: string;
  kamar?: string;
  halaqoh?: string;
  waktuKeluar?: string;
  waktuKembali?: string;
  alasanTolak?: string;
};

export type CreatePerijinanPayload = {
  siswa_id: number;
  tgl_ijin: string;
  tgl_kembali?: string;
  penjemput?: string;
  jam_penjemputan?: string;
  keperluan: string;
  catatan?: string;
};

export type CheckPerijinanPayload = {
  izin_id: number;
};

export type MusyrifStudent = {
  id: number;
  name: string;
  nis?: string;
  kelas?: string;
  kamar?: string;
  wali?: string;
  phone?: string;
  avatar?: string;
  saldoUangSaku: number;
  saldoDompet: number;
  virtualAccount?: string;
  noVaUangSaku?: string;
  pinDompet?: string | null;
  hasPinSet?: boolean;
  detail?: MusyrifStudentDetail;
};

export type StudentAcademicInfo = {
  nis?: string;
  nisn?: string;
  kelas?: string;
  kamar?: string;
  halaqoh?: string;
  musyrif?: string;
  tahunAjaran?: string;
  jenjang?: string;
  tingkat?: string;
  jurusan?: string;
};

export type StudentBiodata = {
  namaLengkap?: string;
  namaPanggilan?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  golonganDarah?: string;
  agama?: string;
  anakKe?: string | number;
  jumlahSaudara?: string | number;
  hobi?: string;
  citaCita?: string;
};

export type StudentAddress = {
  alamat?: string;
  rtRw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  kodePos?: string;
};

export type StudentParentInfo = {
  ayah?: string;
  ibu?: string;
  wali?: string;
  hubunganWali?: string;
  phone?: string;
};

export type StudentFinanceInfo = {
  virtualAccount?: string;
  noVaUangSaku?: string;
  saldoUangSaku: number;
  saldoDompet: number;
  pinDompet?: string | null;
  hasPinSet?: boolean;
};

export type StudentTahfidzSummary = {
  text?: string;
  surah?: string;
  ayat?: string;
  nilai?: string;
};

export type MusyrifStudentDetail = {
  academic: StudentAcademicInfo;
  biodata: StudentBiodata;
  address: StudentAddress;
  parents: StudentParentInfo;
  finance: StudentFinanceInfo;
  tahfidz?: StudentTahfidzSummary;
};

export type WalletBalance = {
  santriId: number;
  uangSaku: number;
  dompet: number;
  pinDompet?: string | null;
  hasPinSet?: boolean;
};

export type WalletHistoryType = "uang_saku" | "dompet";

export type WalletHistory = {
  id: number;
  type: WalletHistoryType;
  title: string;
  description?: string;
  amount: number;
  date?: string;
  kind: "in" | "out";
  reference?: string;
};

export type TopupPayload = {
  siswa_id: number;
  amount: number;
};

export type ChangePinPayload = {
  siswa_id: number;
  new_pin: string;
};

export type MutabaahSesi = {
  id: number;
  name: string;
  jamMulai?: string;
  jamSelesai?: string;
};

export type MutabaahActivity = {
  id: number;
  name: string;
  kategori?: string;
  skor: number;
};

export type MutabaahItem = MutabaahActivity & {
  dilaksanakan: boolean;
  keterangan?: string;
};

export type Mutabaah = {
  id: number;
  name: string;
  santriId?: number;
  santriName: string;
  kelas?: string;
  sesiName?: string;
  tanggal?: string;
  totalSkor: number;
  maxSkor: number;
  catatan?: string;
};

export type MutabaahListParams = {
  siswa_id?: number;
  sesi_id?: number;
  tgl?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export type CreateMutabaahPayload = {
  siswa_id: number;
  sesi_id: number;
  tgl: string;
  mutabaah_lines: Array<{
    mutabaah_id: number;
    is_sudah: false;
    keterangan?: string;
  }>;
};

export type TahfidzMasterOption = {
  id: number;
  name: string;
  halaman?: number;
  ayat?: number;
};

export type TahfidzMusyrif = {
  id: number;
  name: string;
  santriName?: string;
  tanggal?: string;
  sesiName?: string;
  ustadzName?: string;
  surahName?: string;
  ayat?: string;
  ayatAwal?: string;
  ayatAkhir?: string;
  nilai?: string;
  status?: string;
  keterangan?: string;
};

export type CreateTahfidzMusyrifPayload = {
  tanggal: string;
  sesi_id: number;
  ustadz_id: number;
  surah_id: number;
  ayat_awal_id: number;
  ayat_akhir_id: number;
  nilai_id: number;
  jml_baris?: number;
  keterangan?: string;
};
