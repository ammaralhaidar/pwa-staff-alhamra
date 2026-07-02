import type { CreatePelanggaranPayload, ProcessPelanggaranPayload } from "../domain/pelanggaran-types";

export function validateCreatePelanggaran(payload: Partial<CreatePelanggaranPayload>): string | null {
  if (!payload.siswaId) return "Pilih santri terlebih dahulu.";
  if (!payload.pelanggaranId) return "Pilih jenis pelanggaran terlebih dahulu.";
  if (!payload.tgl) return "Tanggal pelanggaran wajib diisi.";
  if (Number.isNaN(new Date(payload.tgl).getTime())) return "Tanggal pelanggaran tidak valid.";
  return null;
}

export function validateProcessPelanggaran(payload: Partial<ProcessPelanggaranPayload>): string | null {
  if (!payload.pelanggaranId) return "Data pelanggaran tidak valid.";
  if (!payload.tindakanId) return "Silakan pilih tindakan terlebih dahulu.";
  return null;
}
