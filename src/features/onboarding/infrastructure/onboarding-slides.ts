import type { OnboardingSlide } from "@/features/onboarding/domain/onboarding-slide";

export const onboardingSlides: OnboardingSlide[] = [
  {
    id: "welcome",
    order: 1,
    imageSrc: "/images/avatar1.png",
    imageAlt: "Ilustrasi santri IBS Al Hamra",
    body:
      "Selamat datang di Aplikasi Pegawai IBS Al-Hamra! sistem digital yang dirancang khusus untuk mempermudah tugas dan manajemen harian Anda sebagai tenaga pendidik dan staf pesantren. Dengan aplikasi ini, semua aktivitas administratif, akademik, dan komunikasi bisa Anda kelola dalam satu genggaman.",
  },
  {
    id: "monitoring",
    order: 2,
    imageSrc: "/images/avatar2.png",
    imageAlt: "Ilustrasi guru memantau data siswa",
    body:
      "Pantau kehadiran, jadwal kegiatan harian, dan perkembangan siswa secara real-time. Semua data tersimpan rapi dan bisa diakses kapan saja tanpa perlu buku manual lagi!",
  },
  {
    id: "reporting",
    order: 3,
    imageSrc: "/images/avatar3.png",
    imageAlt: "Ilustrasi laporan akademik dan keuangan",
    body:
      "Lihat laporan nilai, rapor, dan perkembangan akademik siswa. Aplikasi juga menyediakan informasi transparan terkait tagihan, pembayaran, dan laporan keuangan pesantren yang terintegrasi.",
  },
  {
    id: "support",
    order: 4,
    imageSrc: "/images/avatar4.png",
    imageAlt: "Ilustrasi bantuan admin IBS Al Hamra",
    body:
      "Gunakan akun resmi yang diberikan oleh admin untuk login. Jika mengalami kendala, seperti lupa password atau belum menerima akun. Hubungi admin via WhatsApp di 0894-8347-387.",
  },
];