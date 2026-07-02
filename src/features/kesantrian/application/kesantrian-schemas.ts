import { z } from "zod";

export const createPerijinanSchema = z.object({
  santriId: z.coerce.number().min(1, "Pilih santri terlebih dahulu"),
  tanggalIjin: z.string().min(1, "Tanggal izin wajib diisi"),
  tanggalKembali: z.string().min(1, "Tanggal kembali wajib diisi"),
  penjemput: z.string().min(1, "Penjemput wajib diisi"),
  jamPenjemputan: z.string().min(1, "Jam penjemputan wajib diisi"),
  keperluan: z.string().min(1, "Keperluan wajib diisi"),
  catatan: z.string().optional(),
}).refine((value) => {
  const start = new Date(value.tanggalIjin);
  const end = new Date(value.tanggalKembali);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
  return end.getTime() >= start.getTime();
}, {
  message: "Tanggal kembali tidak boleh sebelum tanggal izin",
  path: ["tanggalKembali"],
});

export const processPelanggaranSchema = z.object({
  tindakanId: z.coerce.number().min(1, "Pilih tindakan terlebih dahulu"),
  deskripsiTindakan: z.string().min(1, "Deskripsi tindakan wajib diisi"),
});

export type CreatePerijinanFormValues = z.infer<typeof createPerijinanSchema>;
export type ProcessPelanggaranFormValues = z.infer<typeof processPelanggaranSchema>;
