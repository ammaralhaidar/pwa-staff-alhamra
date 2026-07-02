import type { KeamananDashboard, KeamananPermission } from "../domain/keamanan-types";

export const fallbackKeamananPermissions: KeamananPermission[] = [
  {
    id: 901,
    permissionId: 901,
    studentName: "Ahmad Farhan",
    studentNis: "230101",
    className: "VIII A",
    kamar: "Al-Fatih 3",
    halaqoh: "Halaqoh 2",
    musyrif: "Ustadz Rahman",
    state: "Approved",
    stateLabel: "Disetujui",
    reason: "Kontrol kesehatan keluarga",
    dateStart: "2026-06-23T09:00:00",
    dateReturn: "2026-06-23",
    lamaIzin: "1 hari",
    penjemput: "Bapak Hasan",
    jamPenjemputan: "09:00",
  },
  {
    id: 902,
    permissionId: 902,
    studentName: "Muhammad Zidan",
    studentNis: "230102",
    className: "VIII B",
    kamar: "Al-Fatih 4",
    halaqoh: "Halaqoh 3",
    musyrif: "Ustadz Ahmad",
    state: "Permission",
    stateLabel: "Sedang Keluar",
    reason: "Keperluan keluarga",
    dateStart: "2026-06-22T10:00:00",
    dateReturn: "2026-06-22",
    lamaIzin: "1 hari",
    penjemput: "Ibu Sari",
    waktuKeluar: "2026-06-22T10:15:00",
  },
];

export const fallbackKeamananDashboard: KeamananDashboard = {
  summary: {
    totalPerijinan: 2,
    disetujui: 1,
    ijinKeluar: 1,
  },
  permissions: fallbackKeamananPermissions,
};
