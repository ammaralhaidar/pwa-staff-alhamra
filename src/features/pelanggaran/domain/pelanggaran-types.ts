export type PelanggaranAccessType = "biasa" | "pendidik" | "kesantrian";

export type PelanggaranStatus = "draft" | "proses" | "validasi" | "selesai" | "batal";

export type TimeRangeFilter = "today" | "7days" | "30days" | "all";

export type PelanggaranFilter = {
  search: string;
  timeRange: TimeRangeFilter;
  status: PelanggaranStatus | "all";
};

export type PelanggaranListParams = {
  siswaId?: number;
  state?: PelanggaranStatus | "all" | string;
  limit?: number;
  offset?: number;
  isMySantri?: boolean;
};

export type SearchSiswaParams = {
  search?: string;
};

export type MasterJenisParams = {
  search?: string;
};

export type PelanggaranApiError = {
  message: string;
  status?: number;
  raw?: unknown;
};

export type PelanggaranDecision = "poin" | "no_poin" | "tolak";

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
  catatan?: string;
  deskripsi?: string;
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

export type PelanggaranDetail = Pelanggaran;

export type StudentOption = {
  id: number;
  name: string;
  nis?: string;
  kelas?: string;
  kamar?: string;
  halaqoh?: string;
};

export type MasterPelanggaran = {
  id: number;
  name: string;
  jenis?: string;
  kategori?: string;
  poin: number;
  deskripsi?: string;
};

export type TindakanOption = {
  id: number;
  name: string;
};

export type CreatePelanggaranPayload = {
  siswaId: number;
  pelanggaranId: number;
  tgl: string;
  catatan?: string;
  autoConfirm?: boolean;
};

export type ProcessPelanggaranPayload = {
  pelanggaranId: number;
  tindakanId: number;
  deskripsiTindakan?: string;
};

export type CancelPelanggaranPayload = {
  pelanggaranId: number;
  alasan?: string;
};

export type DecidePelanggaranPayload = {
  pelanggaranId: number;
  keputusan: PelanggaranDecision;
  catatanManager?: string;
};
