import type { AppRole } from "@/features/roles/domain/role";

export const appRoles: AppRole[] = [
  {
    title: "Guru Quran",
    subtitle: "Pengajar Al-Quran",
    gradient: ["#42A5F5", "#1976D2"],
    icon: "book",
    route: "/guru-quran",
    odooKey: "is_guru_quran",
  },
  {
    title: "Musyrif",
    subtitle: "Pembimbing Asrama",
    gradient: ["#26C6DA", "#00ACC1"],
    icon: "users",
    route: "/musyrif",
    odooKey: "is_musyrif",
  },
  {
    title: "Keamanan",
    subtitle: "Petugas Keamanan",
    gradient: ["#78909C", "#37474F"],
    icon: "shield",
    route: "/keamanan",
    odooKey: "is_petugas_keamanan",
  },
  {
    title: "Pelanggaran",
    subtitle: "Petugas Pelanggaran",
    gradient: ["#EF5350", "#C62828"],
    icon: "alert",
    route: "/pelanggaran",
    odooKey: "is_petugas_pelanggaran",
    alternateOdooKeys: ["is_petugas_pelanggaran_pendidik"],
  },
  {
    title: "Kesantrian",
    subtitle: "Kepala Bagian",
    gradient: ["#5C6BC0", "#283593"],
    icon: "admin",
    route: "/kesantrian",
    odooKey: "is_manajer_kesantrian",
  },
];
