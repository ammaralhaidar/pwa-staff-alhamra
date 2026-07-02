import type { CreatePerijinanPayload, CreateTahfidzMusyrifPayload } from "../domain/musyrif-types";

export function validatePerijinanPayload(payload: Partial<CreatePerijinanPayload>): string | null {
  if (!payload.siswa_id) return "Pilih santri terlebih dahulu.";
  if (!payload.tgl_ijin) return "Tanggal izin wajib diisi.";
  if (!payload.tgl_kembali) return "Tanggal kembali wajib diisi.";
  if (payload.tgl_ijin && payload.tgl_kembali && new Date(payload.tgl_kembali) < new Date(payload.tgl_ijin)) {
    return "Tanggal kembali tidak boleh sebelum tanggal izin.";
  }
  if (!payload.penjemput?.trim()) return "Penjemput wajib diisi.";
  if (!payload.jam_penjemputan?.trim()) return "Jam penjemputan wajib diisi.";
  if (!payload.keperluan?.trim()) return "Keperluan izin wajib diisi.";
  return null;
}

export function validateTopup(amount: number): string | null {
  if (!Number.isFinite(amount) || amount < 1000) return "Topup dompet minimal Rp 1.000.";
  return null;
}

export function validatePin(pin: string): string | null {
  if (!/^\d{4,6}$/.test(pin)) return "PIN wajib angka 4 sampai 6 digit.";
  return null;
}

export function validateTahfidzPayload(payload: Partial<CreateTahfidzMusyrifPayload>): string | null {
  if (!payload.tanggal) return "Tanggal tahfidz wajib diisi.";
  if (!payload.sesi_id) return "Pilih sesi tahfidz.";
  if (!payload.ustadz_id) return "Pilih ustadz.";
  if (!payload.surah_id) return "Pilih surah.";
  if (!payload.ayat_awal_id) return "Pilih ayat awal.";
  if (!payload.ayat_akhir_id) return "Pilih ayat akhir.";
  if (payload.ayat_awal_id && payload.ayat_akhir_id && payload.ayat_awal_id > payload.ayat_akhir_id) {
    return "Ayat awal tidak boleh lebih besar dari ayat akhir.";
  }
  if (!payload.nilai_id) return "Pilih nilai.";
  return null;
}
