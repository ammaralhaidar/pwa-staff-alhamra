import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { getLastActiveRoleRoute, hasStoredAuthSession } from "@/lib/storage";
import { ProtectedRoute } from "@/app/router/protected-route";

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

const GuruAkademikDashboardPage = lazy(async () => ({ default: (await import("@/features/guru-akademik/presentation/pages/guru-akademik-dashboard-page")).GuruAkademikDashboardPage }));
const GuruAkademikHomePage = lazy(async () => ({ default: (await import("@/features/guru-akademik/presentation/pages/guru-akademik-home-page")).GuruAkademikHomePage }));
const GuruAkademikProfilePage = lazy(async () => ({ default: (await import("@/features/guru-akademik/presentation/pages/guru-akademik-profile-page")).GuruAkademikProfilePage }));
const AcademicAttendanceListPage = lazy(async () => ({ default: (await import("@/features/guru-akademik/presentation/pages/academic-attendance-list-page")).AcademicAttendanceListPage }));
const AcademicAttendanceFormPage = lazy(async () => ({ default: (await import("@/features/guru-akademik/presentation/pages/academic-attendance-form-page")).AcademicAttendanceFormPage }));
const AcademicAttendanceDetailPage = lazy(async () => ({ default: (await import("@/features/guru-akademik/presentation/pages/academic-attendance-detail-page")).AcademicAttendanceDetailPage }));

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

const PengumumanDashboardPage = lazy(async () => ({ default: (await import("@/features/pengumuman/presentation/pages/pengumuman-dashboard-page")).PengumumanDashboardPage }));
const PengumumanHomePage = lazy(async () => ({ default: (await import("@/features/pengumuman/presentation/pages/pengumuman-home-page")).PengumumanHomePage }));
const PengumumanFormPage = lazy(async () => ({ default: (await import("@/features/pengumuman/presentation/pages/pengumuman-form-page")).PengumumanFormPage }));
const PengumumanDetailPage = lazy(async () => ({ default: (await import("@/features/pengumuman/presentation/pages/pengumuman-detail-page")).PengumumanDetailPage }));
const PengumumanProfilePage = lazy(async () => ({ default: (await import("@/features/pengumuman/presentation/pages/pengumuman-profile-page")).PengumumanProfilePage }));

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootEntryRoute />} />
      <Route path="/onboarding" element={<OnboardingScreen />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/roles" element={<RoleSelectionPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/pengumuman" element={<ProtectedRoute allowedRoles={["can_manage_pengumuman", "is_pengumuman_staff", "is_pengumuman_manager", "is_manajer_kesantrian"]}><PengumumanDashboardPage /></ProtectedRoute>}>
        <Route index element={<PengumumanHomePage />} />
        <Route path="profile" element={<PengumumanProfilePage />} />
      </Route>
      <Route path="/pengumuman/buat" element={<ProtectedRoute allowedRoles={["can_manage_pengumuman", "is_pengumuman_staff", "is_pengumuman_manager", "is_manajer_kesantrian"]}><PengumumanFormPage /></ProtectedRoute>} />
      <Route path="/pengumuman/:id/edit" element={<ProtectedRoute allowedRoles={["can_manage_pengumuman", "is_pengumuman_staff", "is_pengumuman_manager", "is_manajer_kesantrian"]}><PengumumanFormPage /></ProtectedRoute>} />
      <Route path="/pengumuman/:id" element={<ProtectedRoute allowedRoles={["can_manage_pengumuman", "is_pengumuman_staff", "is_pengumuman_manager", "is_manajer_kesantrian"]}><PengumumanDetailPage /></ProtectedRoute>} />
      <Route path="/keamanan" element={<ProtectedRoute allowedRoles={["is_petugas_keamanan"]}><KeamananDashboardPage /></ProtectedRoute>}>
        <Route index element={<KeamananHomePage />} />
        <Route path="profile" element={<KeamananProfilePage />} />
        <Route path="scan" element={<KeamananScanPage />} />
        <Route path="manual" element={<KeamananManualPage />} />
        <Route path="checkout/:permissionId" element={<KeamananActionPage actionType="checkout" />} />
        <Route path="checkin/:permissionId" element={<KeamananActionPage actionType="checkin" />} />
      </Route>
      <Route path="/guru-quran" element={<ProtectedRoute allowedRoles={["is_guru_quran"]}><GuruQuranDashboardPage /></ProtectedRoute>}>
        <Route index element={<GuruQuranHomePage />} />
        <Route path="profile" element={<GuruQuranProfilePage />} />
      </Route>
      <Route path="/guru-quran/tahfidz/absen/tambah" element={<ProtectedRoute allowedRoles={["is_guru_quran"]}><CreateTahfidzAttendancePage /></ProtectedRoute>} />
      <Route path="/guru-quran/tahfidz/penilaian/:attendanceId" element={<ProtectedRoute allowedRoles={["is_guru_quran"]}><TahfidzAssessmentPage /></ProtectedRoute>} />
      <Route path="/guru-quran/tahfidz/penilaian/:attendanceId/santri/:studentId" element={<ProtectedRoute allowedRoles={["is_guru_quran"]}><TahfidzStudentScorePage /></ProtectedRoute>} />
      <Route path="/guru-akademik" element={<ProtectedRoute allowedRoles={["is_academic_teacher"]}><GuruAkademikDashboardPage /></ProtectedRoute>}>
        <Route index element={<GuruAkademikHomePage />} />
        <Route path="profile" element={<GuruAkademikProfilePage />} />
        <Route path="absensi" element={<AcademicAttendanceListPage />} />
        <Route path="absensi/tambah" element={<AcademicAttendanceFormPage />} />
        <Route path="absensi/:attendanceId" element={<AcademicAttendanceDetailPage />} />
      </Route>
      <Route path="/kesantrian" element={<ProtectedRoute allowedRoles={["is_manajer_kesantrian"]}><KesantrianDashboardPage /></ProtectedRoute>}>
        <Route index element={<KesantrianIndexRedirect />} />
        <Route path="perijinan" element={<PerijinanHomePage />} />
        <Route path="pelanggaran" element={<KesantrianPelanggaranHomePage />} />
        <Route path="profile" element={<KesantrianProfilePage />} />
      </Route>
      <Route path="/kesantrian/perijinan/tambah" element={<ProtectedRoute allowedRoles={["is_manajer_kesantrian"]}><PerijinanFormPage /></ProtectedRoute>} />
      <Route path="/kesantrian/perijinan/:izinId" element={<ProtectedRoute allowedRoles={["is_manajer_kesantrian"]}><PerijinanDetailPage /></ProtectedRoute>} />
      <Route path="/kesantrian/pelanggaran/tambah" element={<ProtectedRoute allowedRoles={["is_manajer_kesantrian"]}><RolePelanggaranFormPage accessType="kesantrian" /></ProtectedRoute>} />
      <Route path="/kesantrian/pelanggaran/:pelanggaranId" element={<ProtectedRoute allowedRoles={["is_manajer_kesantrian"]}><KesantrianPelanggaranDetailPage /></ProtectedRoute>} />
      <Route path="/pelanggaran" element={<ProtectedRoute allowedRoles={["is_petugas_pelanggaran"]}><PelanggaranDashboardPage accessType="biasa" /></ProtectedRoute>}>
        <Route index element={<RolePelanggaranHomePage accessType="biasa" />} />
        <Route path="tambah" element={<RolePelanggaranFormPage accessType="biasa" />} />
        <Route path="binaan" element={<PelanggaranBinaanPage />} />
        <Route path="profile" element={<PelanggaranProfilePage accessType="biasa" />} />
        <Route path=":pelanggaranId" element={<RolePelanggaranDetailPage accessType="biasa" />} />
      </Route>
      <Route path="/pelanggaran/pendidik" element={<ProtectedRoute allowedRoles={["is_petugas_pelanggaran_pendidik"]}><PelanggaranDashboardPage accessType="pendidik" /></ProtectedRoute>}>
        <Route index element={<RolePelanggaranHomePage accessType="pendidik" />} />
        <Route path="tambah" element={<RolePelanggaranFormPage accessType="pendidik" />} />
        <Route path="profile" element={<PelanggaranProfilePage accessType="pendidik" />} />
        <Route path=":pelanggaranId" element={<RolePelanggaranDetailPage accessType="pendidik" />} />
      </Route>
      <Route path="/musyrif" element={<ProtectedRoute allowedRoles={["is_musyrif"]}><MusyrifDashboardPage /></ProtectedRoute>}>
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

function RootEntryRoute() {
  if (!hasStoredAuthSession()) {
    return <SplashScreen />;
  }

  return <Navigate to={getLastActiveRoleRoute() ?? "/roles"} replace />;
}
