export type PerijinanStatus =
  | "draft"
  | "check"
  | "approve"
  | "reject"
  | "keluar"
  | "kembali"
  | "selesai";

export type PerijinanStatusAlias =
  | PerijinanStatus
  | "approved"
  | "rejected"
  | "permission"
  | "return"
  | "diperiksa"
  | "menunggu";

export type PelanggaranStatus =
  | "draft"
  | "proses"
  | "validasi"
  | "selesai"
  | "batal";

export type PelanggaranStatusAlias =
  | PelanggaranStatus
  | "process"
  | "confirmed"
  | "diperiksa"
  | "validation"
  | "cancel"
  | "cancelled";

export type TimeRangeFilter = "today" | "7days" | "30days" | "all";

export type KesantrianFilter = {
  search: string;
  timeRange: TimeRangeFilter;
  status: string;
};

export type PerijinanListParams = {
  state?: string;
  search?: string;
  limit?: number;
  offset?: number;
  dateFrom?: string;
  dateTo?: string;
};

export type PelanggaranListParams = {
  state?: string;
  search?: string;
  limit?: number;
  offset?: number;
  siswaId?: number;
  santriId?: number;
  dateFrom?: string;
  dateTo?: string;
};

export type StudentSearchParams = {
  search?: string;
  limit?: number;
  offset?: number;
};

export type Perijinan = {
  id: number;
  santriId: number;
  noReferensi?: string;
  reference: string;
  tanggalIjin: string;
  tanggalKembali?: string;
  keperluan: string;
  penjemput: string;
  jamPenjemputan: string;
  catatan?: string;
  status: PerijinanStatus;
  statusLabel: string;
  durasi?: string;
  namaSantri: string;
  kelasSantri?: string;
  kamarSantri?: string;
  halaqohSantri?: string;
  musyrifName?: string;
  waktuKeluar?: string;
  waktuKembali?: string;
  terlambatHari?: number;
  alasanTolak?: string;
  managerNote?: string;
  realisasiKeamanan?: {
    waktuKeluar?: string;
    waktuKembali?: string;
    terlambatHari?: number;
  };
};

export type PerijinanDecisionPayload = {
  izinId: number;
  keputusan: "approve" | "reject";
  catatan?: string;
};

export type CreatePerijinanPayload = {
  santriId: number;
  tanggalIjin: string;
  tanggalKembali?: string;
  keperluan: string;
  penjemput: string;
  jamPenjemputan: string;
  catatan?: string;
};

export type Pelanggaran = {
  id: number;
  noReferensi?: string;
  reference: string;
  santriId: number;
  namaSantri: string;
  kelasSantri?: string;
  tgl?: string;
  tanggal: string;
  masterPelanggaranId: number;
  namaPelanggaran: string;
  jenisPelanggaran?: string;
  kategori?: string;
  poin: number;
  tindakan?: string;
  deskripsi?: string;
  catatan?: string;
  status: PelanggaranStatus;
  statusLabel: string;
  pelaporName?: string;
  detail?: Record<string, unknown>;
  infoTindakan?: {
    tindakanId?: number;
    tindakanNama?: string;
    deskripsiTindakan?: string;
  };
  keputusan?: {
    userDisetujui?: string;
    catatanKaAsrama?: string;
  };
};

export type PelanggaranDecision = "poin" | "no_poin" | "tolak";

export type TindakanOption = {
  id: number;
  name: string;
};

export type ProcessPelanggaranPayload = {
  pelanggaranId: number;
  tindakanId: number;
  deskripsiTindakan: string;
};

export type DecidePelanggaranPayload = {
  pelanggaranId: number;
  keputusan: PelanggaranDecision;
  catatanManager?: string;
};

export type CancelPelanggaranPayload = {
  pelanggaranId: number;
  alasan?: string;
};

export type StudentOption = {
  id: number;
  name: string;
  kelas?: string;
  kamar?: string;
  halaqoh?: string;
};

export type KesantrianProfile = {
  name: string;
  email: string;
  role: string;
  initials: string;
  hasSessionData: boolean;
};

export type KesantrianApiError = {
  message: string;
  unauthorized?: boolean;
};
