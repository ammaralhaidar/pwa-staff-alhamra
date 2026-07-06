import type {
  Mutabaah,
  MutabaahActivity,
  MutabaahSesi,
  MusyrifPerijinan,
  MusyrifStudent,
  TahfidzMasterOption,
  TahfidzMusyrif,
  WalletBalance,
  WalletHistory,
} from "../domain/musyrif-types";

export const fallbackMusyrifStudents: MusyrifStudent[] = [
  {
    id: 101,
    name: "Ahmad Aqeef Alvaro",
    nis: "2401014",
    kelas: "Kelas VIII A",
    kamar: "Gedung B/Lantai 3 - SHARJAH",
    wali: "Bapak Ahmad",
    phone: "081234567890",
    saldoUangSaku: 908798,
    saldoDompet: 1510302,
  },
  {
    id: 102,
    name: "Akmal Gerrard Kayana Lubis",
    nis: "2401017",
    kelas: "Kelas VIII A",
    kamar: "Gedung B/Lantai 3 - SHARJAH",
    wali: "Ibu Lubis",
    phone: "081298765432",
    saldoUangSaku: 80000,
    saldoDompet: 14300,
  },
];

export const fallbackMusyrifPerijinan: MusyrifPerijinan[] = [
  {
    id: 201,
    name: "IZIN/2026/001",
    santriId: 101,
    santriName: "Ahmad Farhan",
    nis: "230101",
    kelas: "VIII A",
    status: "draft",
    statusLabel: "Menunggu Check",
    tanggalIzin: "2026-06-23",
    tanggalKembali: "2026-06-23",
    jamKeluar: "09:00",
    jamKembali: "16:00",
    durasi: "1 hari",
    penjemput: "Bapak Hasan",
    keperluan: "Kontrol kesehatan keluarga",
  },
  {
    id: 202,
    name: "IZIN/2026/002",
    santriId: 102,
    santriName: "Muhammad Zidan",
    nis: "230102",
    kelas: "VIII B",
    status: "approve",
    statusLabel: "Disetujui",
    tanggalIzin: "2026-06-22",
    tanggalKembali: "2026-06-24",
    jamKeluar: "10:00",
    penjemput: "Ibu Sari",
    keperluan: "Keperluan keluarga",
  },
];

export const fallbackWalletBalance = (santriId: number): WalletBalance => {
  if (santriId === 101) return { santriId, uangSaku: 908798, dompet: 1510302 };
  if (santriId === 102) return { santriId, uangSaku: 80000, dompet: 14300 };
  return {
    santriId,
    uangSaku: 175000,
    dompet: 85000,
  };
};

export const fallbackWalletHistory: WalletHistory[] = [
  {
    id: 301,
    type: "uang_saku",
    title: "Uang saku pekanan",
    description: "Transfer dari wali santri",
    amount: 100000,
    date: "2026-06-21",
    kind: "in",
    reference: "TRX-001",
  },
  {
    id: 302,
    type: "uang_saku",
    title: "Pembelian koperasi",
    description: "Jajan dan kebutuhan pribadi",
    amount: 25000,
    date: "2026-06-22",
    kind: "out",
    reference: "TRX-002",
  },
];

export const fallbackMutabaahSesi: MutabaahSesi[] = [
  { id: 1, name: "Pagi" },
  { id: 2, name: "Malam" },
];

export const fallbackMutabaahActivities: MutabaahActivity[] = [
  { id: 1, name: "Shalat Subuh Berjamaah", skor: 10 },
  { id: 2, name: "Dzikir Pagi", skor: 5 },
  { id: 3, name: "Tilawah Harian", skor: 10 },
  { id: 4, name: "Belajar Malam", skor: 10 },
];

export const fallbackMutabaah: Mutabaah[] = [
  {
    id: 401,
    name: "MUT/2026/001",
    santriId: 101,
    santriName: "Ahmad Farhan",
    kelas: "Kelas VIII A",
    sesiName: "Pagi",
    tanggal: "2026-06-23",
    totalSkor: 30,
    maxSkor: 35,
    catatan: "Ada satu aktivitas belum selesai.",
  },
];

export const fallbackTahfidzOptions: TahfidzMasterOption[] = [
  { id: 1, name: "Pilihan 1" },
  { id: 2, name: "Pilihan 2" },
];

export const fallbackSurah: TahfidzMasterOption[] = [
  { id: 1, name: "1. Al-Fatihah", ayat: 7 },
  { id: 2, name: "2. Al-Baqarah", ayat: 286 },
  { id: 3, name: "3. Ali Imran", ayat: 200 },
];

export const fallbackAyat: TahfidzMasterOption[] = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  name: `Ayat ${index + 1}`,
  ayat: index + 1,
  halaman: index < 7 ? 1 : 2,
}));

export const fallbackTahfidz: TahfidzMusyrif[] = [
  {
    id: 501,
    name: "THF/2026/001",
    santriName: "Ahmad Farhan",
    tanggal: "2026-06-23",
    sesiName: "Pagi",
    ustadzName: "Ustadz Abdullah",
    surahName: "Al-Baqarah",
    ayatAwal: "Ayat 1",
    ayatAkhir: "Ayat 5",
    nilai: "A",
    keterangan: "Bacaan lancar.",
  },
];
