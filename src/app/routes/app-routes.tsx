import { lazy } from "react";
import { Route, Routes } from "react-router-dom";

const SplashScreen = lazy(async () => ({ default: (await import("@/features/onboarding/presentation/pages/splash-screen")).SplashScreen }));
const OnboardingScreen = lazy(async () => ({ default: (await import("@/features/onboarding/presentation/pages/onboarding-screen")).OnboardingScreen }));
const LoginPage = lazy(async () => ({ default: (await import("@/features/auth/presentation/pages/login-page")).LoginPage }));
const RoleSelectionPage = lazy(async () => ({ default: (await import("@/features/roles/presentation/pages/role-selection-page")).RoleSelectionPage }));
const HelpPage = lazy(async () => ({ default: (await import("@/features/help/presentation/pages/help-page")).HelpPage }));

const KeamananDashboardPage = lazy(async () => ({ default: (await import("@/features/keamanan/presentation/pages/keamanan-dashboard-page")).KeamananDashboardPage }));
const KeamananHomePage = lazy(async () => ({ default: (await import("@/features/keamanan/presentation/pages/keamanan-home-page")).KeamananHomePage }));
const KeamananProfilePage = lazy(async () => ({ default: (await import("@/features/keamanan/presentation/pages/keamanan-profile-page")).KeamananProfilePage }));
const KeamananScanPage = lazy(async () => ({ default: (await import("@/features/keamanan/presentation/pages/keamanan-scan-page")).KeamananScanPage }));
const KeamananManualPage = lazy(async () => ({ default: (await import("@/features/keamanan/presentation/pages/keamanan-manual-page")).KeamananManualPage }));
const KeamananActionPage = lazy(async () => ({ default: (await import("@/features/keamanan/presentation/pages/keamanan-action-page")).KeamananActionPage }));

const GuruQuranDashboardPage = lazy(async () => ({ default: (await import("@/features/guru-quran/presentation/pages/guru-quran-dashboard-page")).GuruQuranDashboardPage }));
const GuruQuranHomePage = lazy(async () => ({ default: (await import("@/features/guru-quran/presentation/pages/guru-quran-home-page")).GuruQuranHomePage }));
const GuruQuranProfilePage = lazy(async () => ({ default: (await import("@/features/guru-quran/presentation/pages/guru-quran-profile-page")).GuruQuranProfilePage }));
const CreateTahfidzAttendancePage = lazy(async () => ({ default: (await import("@/features/guru-quran/presentation/pages/create-tahfidz-attendance-page")).CreateTahfidzAttendancePage }));
const TahfidzAssessmentPage = lazy(async () => ({ default: (await import("@/features/guru-quran/presentation/pages/tahfidz-assessment-page")).TahfidzAssessmentPage }));
const TahfidzStudentScorePage = lazy(async () => ({ default: (await import("@/features/guru-quran/presentation/pages/tahfidz-student-score-page")).TahfidzStudentScorePage }));

const KesantrianDashboardPage = lazy(async () => ({ default: (await import("@/features/kesantrian/presentation/pages/kesantrian-dashboard-page")).KesantrianDashboardPage }));
const KesantrianIndexRedirect = lazy(async () => ({ default: (await import("@/features/kesantrian/presentation/pages/kesantrian-dashboard-page")).KesantrianIndexRedirect }));
const PerijinanHomePage = lazy(async () => ({ default: (await import("@/features/kesantrian/presentation/pages/perijinan-home-page")).PerijinanHomePage }));
const PerijinanDetailPage = lazy(async () => ({ default: (await import("@/features/kesantrian/presentation/pages/perijinan-detail-page")).PerijinanDetailPage }));
const PerijinanFormPage = lazy(async () => ({ default: (await import("@/features/kesantrian/presentation/pages/perijinan-form-page")).PerijinanFormPage }));
const KesantrianPelanggaranHomePage = lazy(async () => ({ default: (await import("@/features/kesantrian/presentation/pages/pelanggaran-home-page")).PelanggaranHomePage }));
const KesantrianPelanggaranDetailPage = lazy(async () => ({ default: (await import("@/features/kesantrian/presentation/pages/pelanggaran-detail-page")).PelanggaranDetailPage }));
const KesantrianProfilePage = lazy(async () => ({ default: (await import("@/features/kesantrian/presentation/pages/kesantrian-profile-page")).KesantrianProfilePage }));

const PelanggaranDashboardPage = lazy(async () => ({ default: (await import("@/features/pelanggaran/presentation/pages/pelanggaran-dashboard-page")).PelanggaranDashboardPage }));
const RolePelanggaranHomePage = lazy(async () => ({ default: (await import("@/features/pelanggaran/presentation/pages/pelanggaran-home-page")).PelanggaranHomePage }));
const PelanggaranBinaanPage = lazy(async () => ({ default: (await import("@/features/pelanggaran/presentation/pages/pelanggaran-binaan-page")).PelanggaranBinaanPage }));
const RolePelanggaranFormPage = lazy(async () => ({ default: (await import("@/features/pelanggaran/presentation/pages/pelanggaran-form-page")).PelanggaranFormPage }));
const RolePelanggaranDetailPage = lazy(async () => ({ default: (await import("@/features/pelanggaran/presentation/pages/pelanggaran-detail-page")).PelanggaranDetailPage }));
const PelanggaranProfilePage = lazy(async () => ({ default: (await import("@/features/pelanggaran/presentation/pages/pelanggaran-profile-page")).PelanggaranProfilePage }));

const MusyrifDashboardPage = lazy(async () => ({ default: (await import("@/features/musyrif/presentation/pages/musyrif-dashboard-page")).MusyrifDashboardPage }));
const MusyrifHomePage = lazy(async () => ({ default: (await import("@/features/musyrif/presentation/pages/musyrif-home-page")).MusyrifHomePage }));
const MusyrifProfilePage = lazy(async () => ({ default: (await import("@/features/musyrif/presentation/pages/musyrif-profile-page")).MusyrifProfilePage }));
const MusyrifPerijinanListPage = lazy(async () => ({ default: (await import("@/features/musyrif/presentation/pages/musyrif-perijinan-list-page")).MusyrifPerijinanListPage }));
const MusyrifPerijinanFormPage = lazy(async () => ({ default: (await import("@/features/musyrif/presentation/pages/musyrif-perijinan-form-page")).MusyrifPerijinanFormPage }));
const MusyrifPerijinanDetailPage = lazy(async () => ({ default: (await import("@/features/musyrif/presentation/pages/musyrif-perijinan-detail-page")).MusyrifPerijinanDetailPage }));
const MusyrifActivityMenuPage = lazy(async () => ({ default: (await import("@/features/musyrif/presentation/pages/musyrif-activity-menu-page")).MusyrifActivityMenuPage }));
const MutabaahListPage = lazy(async () => ({ default: (await import("@/features/musyrif/presentation/pages/mutabaah-list-page")).MutabaahListPage }));
const MutabaahFormPage = lazy(async () => ({ default: (await import("@/features/musyrif/presentation/pages/mutabaah-form-page")).MutabaahFormPage }));
const MusyrifDataMenuPage = lazy(async () => ({ default: (await import("@/features/musyrif/presentation/pages/musyrif-data-menu-page")).MusyrifDataMenuPage }));
const TahfidzListPage = lazy(async () => ({ default: (await import("@/features/musyrif/presentation/pages/tahfidz-list-page")).TahfidzListPage }));
const TahfidzFormPage = lazy(async () => ({ default: (await import("@/features/musyrif/presentation/pages/tahfidz-form-page")).TahfidzFormPage }));
const SantriListPage = lazy(async () => ({ default: (await import("@/features/musyrif/presentation/pages/santri-list-page")).SantriListPage }));
const SantriDetailPage = lazy(async () => ({ default: (await import("@/features/musyrif/presentation/pages/santri-detail-page")).SantriDetailPage }));
const UangSakuHistoryPage = lazy(async () => ({ default: (await import("@/features/musyrif/presentation/pages/uang-saku-history-page")).UangSakuHistoryPage }));
const DompetHistoryPage = lazy(async () => ({ default: (await import("@/features/musyrif/presentation/pages/dompet-history-page")).DompetHistoryPage }));

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/roles" element={<RoleSelectionPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/keamanan" element={<KeamananDashboardPage />}>
        <Route index element={<KeamananHomePage />} />
        <Route path="profile" element={<KeamananProfilePage />} />
        <Route path="scan" element={<KeamananScanPage />} />
        <Route path="manual" element={<KeamananManualPage />} />
        <Route path="checkout/:permissionId" element={<KeamananActionPage actionType="checkout" />} />
        <Route path="checkin/:permissionId" element={<KeamananActionPage actionType="checkin" />} />
      </Route>
      <Route path="/guru-quran" element={<GuruQuranDashboardPage />}>
        <Route index element={<GuruQuranHomePage />} />
        <Route path="profile" element={<GuruQuranProfilePage />} />
      </Route>
      <Route path="/guru-quran/tahfidz/absen/tambah" element={<CreateTahfidzAttendancePage />} />
      <Route path="/guru-quran/tahfidz/penilaian/:attendanceId" element={<TahfidzAssessmentPage />} />
      <Route path="/guru-quran/tahfidz/penilaian/:attendanceId/santri/:studentId" element={<TahfidzStudentScorePage />} />
      <Route path="/kesantrian" element={<KesantrianDashboardPage />}>
        <Route index element={<KesantrianIndexRedirect />} />
        <Route path="perijinan" element={<PerijinanHomePage />} />
        <Route path="pelanggaran" element={<KesantrianPelanggaranHomePage />} />
        <Route path="profile" element={<KesantrianProfilePage />} />
      </Route>
      <Route path="/kesantrian/perijinan/tambah" element={<PerijinanFormPage />} />
      <Route path="/kesantrian/perijinan/:izinId" element={<PerijinanDetailPage />} />
      <Route path="/kesantrian/pelanggaran/tambah" element={<RolePelanggaranFormPage accessType="kesantrian" />} />
      <Route path="/kesantrian/pelanggaran/:pelanggaranId" element={<KesantrianPelanggaranDetailPage />} />
      <Route path="/pelanggaran" element={<PelanggaranDashboardPage accessType="biasa" />}>
        <Route index element={<RolePelanggaranHomePage accessType="biasa" />} />
        <Route path="tambah" element={<RolePelanggaranFormPage accessType="biasa" />} />
        <Route path="binaan" element={<PelanggaranBinaanPage />} />
        <Route path="profile" element={<PelanggaranProfilePage accessType="biasa" />} />
        <Route path=":pelanggaranId" element={<RolePelanggaranDetailPage accessType="biasa" />} />
      </Route>
      <Route path="/pelanggaran/pendidik" element={<PelanggaranDashboardPage accessType="pendidik" />}>
        <Route index element={<RolePelanggaranHomePage accessType="pendidik" />} />
        <Route path="tambah" element={<RolePelanggaranFormPage accessType="pendidik" />} />
        <Route path="profile" element={<PelanggaranProfilePage accessType="pendidik" />} />
        <Route path=":pelanggaranId" element={<RolePelanggaranDetailPage accessType="pendidik" />} />
      </Route>
      <Route path="/musyrif" element={<MusyrifDashboardPage />}>
        <Route index element={<MusyrifHomePage />} />
        <Route path="profile" element={<MusyrifProfilePage />} />
        <Route path="perijinan" element={<MusyrifPerijinanListPage />} />
        <Route path="perijinan/tambah" element={<MusyrifPerijinanFormPage />} />
        <Route path="perijinan/:izinId" element={<MusyrifPerijinanDetailPage />} />
        <Route path="aktivitas" element={<MusyrifActivityMenuPage />} />
        <Route path="aktivitas/mutabaah" element={<MutabaahListPage />} />
        <Route path="aktivitas/mutabaah/tambah" element={<MutabaahFormPage />} />
        <Route path="data" element={<MusyrifDataMenuPage />} />
        <Route path="data/tahfidz" element={<TahfidzListPage />} />
        <Route path="data/tahfidz/tambah" element={<TahfidzFormPage />} />
        <Route path="santri" element={<SantriListPage />} />
        <Route path="santri/:santriId" element={<SantriDetailPage />} />
        <Route path="santri/:santriId/uang-saku" element={<UangSakuHistoryPage />} />
        <Route path="santri/:santriId/dompet" element={<DompetHistoryPage />} />
      </Route>
    </Routes>
  );
}
