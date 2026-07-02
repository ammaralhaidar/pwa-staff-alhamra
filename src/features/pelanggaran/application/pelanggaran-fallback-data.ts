import type { MasterPelanggaran, Pelanggaran, StudentOption, TindakanOption } from "../domain/pelanggaran-types";

// Get current date dynamically so they aren't filtered out by default filters
const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const fallbackPelanggaranList: Pelanggaran[] = [
  {
    id: 122,
    reference: "KP/26.06/0122",
    santriId: 201,
    namaSantri: "Alvin Bagas Firmansyah",
    kelasSantri: "Kelas XII",
    tanggal: getTodayString(),
    masterPelanggaranId: 1,
    namaPelanggaran: "Terlambat shalat berjamaah",
    jenisPelanggaran: "Ibadah",
    kategori: "Ringan",
    poin: 5,
    status: "proses",
    statusLabel: "proses",
    pelaporName: "Petugas Pelanggaran Pendidik",
    deskripsi: "-",
  },
  {
    id: 121,
    reference: "KP/26.04/0121",
    santriId: 202,
    namaSantri: "Abdullah Fauzan",
    kelasSantri: "Kelas VII",
    tanggal: getTodayString(),
    masterPelanggaranId: 2,
    namaPelanggaran: "-",
    jenisPelanggaran: "-",
    kategori: "-",
    poin: 0,
    status: "selesai",
    statusLabel: "selesai",
    pelaporName: "Petugas Pelanggaran Pendidik",
    deskripsi: "-",
  },
  {
    id: 123,
    reference: "KP/26.06/0123",
    santriId: 203,
    namaSantri: "Raviandra Nara Muhammad",
    kelasSantri: "Kelas VIII A",
    tanggal: getTodayString(),
    masterPelanggaranId: 3,
    namaPelanggaran: "Tidak rapi",
    jenisPelanggaran: "Ketertiban",
    kategori: "Ringan",
    poin: 2,
    status: "selesai",
    statusLabel: "selesai",
    pelaporName: "Petugas Pelanggaran Pendidik",
    deskripsi: "-",
  },
];

export const fallbackStudents: StudentOption[] = [
  { id: 201, name: "Alvin Bagas Firmansyah", nis: "240101", kelas: "Kelas XII", kamar: "Abu Bakar 1" },
  { id: 202, name: "Abdullah Fauzan", nis: "240102", kelas: "Kelas VII", kamar: "Umar 2" },
  { id: 203, name: "Raviandra Nara Muhammad", nis: "240103", kelas: "Kelas VIII A", kamar: "Utsman 3" },
];

export const fallbackMasterPelanggaran: MasterPelanggaran[] = [
  { id: 1, name: "Terlambat shalat berjamaah", jenis: "Ibadah", kategori: "Ringan", poin: 5 },
  { id: 2, name: "-", jenis: "-", kategori: "-", poin: 0 },
  { id: 3, name: "Tidak rapi", jenis: "Ketertiban", kategori: "Ringan", poin: 2 },
];

export const fallbackTindakanOptions: TindakanOption[] = [
  { id: 1, name: "Teguran lisan" },
  { id: 2, name: "Hukuman fisik ringan" },
  { id: 3, name: "Tugas tambahan" },
];
