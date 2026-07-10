/**
 * Kontrak API Absensi Guru Akademik. Backend belum aktif, sehingga query v1
 * memakai localStorage. Ketika endpoint tersedia, implementasikan fungsi ini
 * memakai client HTTP global tanpa mengubah page atau domain type.
 *
 * GET  /api/v1/guru/absensi/dropdown
 * GET  /api/v1/guru/absensi/siswa-kelas/:kelasId
 * GET  /api/v1/guru/absensi?page&limit&status&tanggal_dari&tanggal_sampai&kelas_id&mapel_id
 * GET  /api/v1/guru/absensi/:id
 * POST /api/v1/guru/absensi/create
 * POST /api/v1/guru/absensi/:id/update
 * POST /api/v1/guru/absensi/:id/done
 * POST /api/v1/guru/absensi/:id/draft
 * POST /api/v1/guru/absensi/:id/delete
 */
export const guruAkademikApi = {};
