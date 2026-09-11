# Plan Implementasi Role Guru Akademik PWA

## Tujuan

Membangun role **Guru Akademik** di PWA React TypeScript dengan perilaku yang setara dengan modul Flutter. API backend belum tersedia, sehingga versi pertama memakai dummy data yang tersimpan lokal. Struktur API tetap disiapkan agar nantinya data dummy dapat diganti tanpa mengubah halaman atau UX.

Ruang lingkup aktif:

- Dashboard Guru Akademik.
- Absensi Siswa: daftar dan tambah absensi.
- Materi pembelajaran yang tersimpan bersama absensi.
- Penilaian Akhir Guru: daftar dan input nilai siswa.
- Profil Guru Akademik.
- Role selection, role switcher, dan navigasi bottom nav.

Di luar ruang lingkup awal:

- Integrasi API produksi, karena endpoint baru masih dibuat backend.
- Upload dokumen/RPP.
- Detail absensi atau penilaian terpisah jika desain produk belum memerlukannya.

## Referensi Flutter

### Screen utama

| File Flutter | Fungsi | Target PWA |
| --- | --- | --- |
| `lib/presentation/screens/guru/guru_dashboard_screen.dart` | Shell dashboard dengan Beranda dan Profil. | `guru-akademik-dashboard-page.tsx` dan shell reusable. |
| `lib/presentation/screens/guru/guru_home_screen.dart` | Menu Absensi Siswa dan Penilaian Akhir Guru. | `guru-akademik-home-page.tsx`. |
| `lib/presentation/screens/guru/absensi_siswa_screen.dart` | Daftar riwayat absensi, refresh, FAB tambah. | `academic-attendance-list-page.tsx`. |
| `lib/presentation/screens/guru/absensi_form_screen.dart` | Form absensi dan materi pembelajaran. | `academic-attendance-form-page.tsx`. |
| `lib/presentation/screens/guru/penilaian_akhir_screen.dart` | Daftar penilaian akhir guru mapel. | `academic-assessment-list-page.tsx`. |
| `lib/presentation/screens/guru/penilaian_akhir_form_screen.dart` | Form input nilai per siswa. | `academic-assessment-form-page.tsx`. |

### Provider dan API Flutter

| File Flutter | Tanggung jawab |
| --- | --- |
| `lib/presentation/providers/absen_mapel_provider.dart` | Kelas, siswa per kelas, list/detail absensi, jumlah pertemuan, submit. |
| `lib/presentation/providers/penilaian_mapel_provider.dart` | List/detail penilaian, siswa per kelas, submit nilai. |
| `lib/data/datasources/remote/absen_mapel_api.dart` | Adapter endpoint absensi mapel legacy. |
| `lib/data/datasources/remote/penilaian_mapel_api.dart` | Adapter endpoint penilaian mapel legacy. |
| `lib/domain/entities/penilaian_mapel.dart` | Model penilaian siswa. |

## Perilaku Produk Dari Flutter

### Dashboard

- Header memakai pola dashboard seluruh role PWA: judul, tanggal, tombol role switcher di kanan.
- Dua menu utama:
  - **Absensi Siswa**: kelola kehadiran siswa.
  - **Penilaian Akhir Guru**: kelola nilai akhir siswa per mata pelajaran.
- Bottom nav hanya **Beranda** dan **Profil**.
- Profil memakai `RoleProfilePage` reusable dengan label `Guru Akademik` dan subtitle `Pengajar Mata Pelajaran`.

### Absensi Siswa

Daftar absensi menampilkan:

- Mata pelajaran.
- Kelas.
- Tanggal dan hari.
- Jam ke.
- Guru.
- Pertemuan ke.
- Tema/materi jika ada.
- Ringkasan jumlah Hadir, Izin, Sakit, dan Alpa.

Form absensi:

1. Tanggal default hari ini.
2. Pilih kelas.
3. Pilih jam ke, mata pelajaran, dan guru.
4. Setelah kelas dipilih, tampil daftar siswa kelas tersebut.
5. Status setiap siswa default `Hadir`.
6. Status tersedia: `Hadir`, `Izin`, `Sakit`, `Alpa`.
7. Tab kedua menyimpan materi: tema, materi, dan RPP.
8. Pertemuan ke dihitung dari kombinasi guru, mapel, dan kelas; dummy v1 menghitung berdasarkan data lokal yang sudah disimpan.
9. Submit menyimpan satu sesi absensi dan seluruh status siswa.

### Penilaian Akhir Guru

Daftar penilaian menampilkan:

- Kelas.
- Mata pelajaran.
- Tahun ajaran.
- Semester.
- Jumlah siswa yang dinilai.
- Status `Draft` atau `Selesai`.

Form penilaian:

1. Pilih kelas dan mata pelajaran.
2. Isi guru, tahun ajaran, dan semester.
3. Memuat daftar siswa dari kelas.
4. Setiap siswa memiliki nilai akhir, predikat, dan enam aspek penilaian seperti form Flutter.
5. Nilai berada pada rentang 0 sampai 100.
6. KKM default 75.
7. Predikat dihitung otomatis dari nilai, tetapi boleh diubah bila aturan backend kelak memerlukannya.
8. Status selesai bila data semua siswa valid; selain itu disimpan sebagai draft pada dummy v1.

## Arsitektur PWA Yang Disarankan

```txt
src/features/guru-akademik/
  api/
    guru-akademik-api.ts
  domain/
    guru-akademik-types.ts
  application/
    guru-akademik-fallback-data.ts
    guru-akademik-mappers.ts
    guru-akademik-queries.ts
    guru-akademik-storage.ts
    guru-akademik-schemas.ts
  presentation/
    components/
      guru-akademik-shell.tsx
      guru-akademik-bottom-nav.tsx
      guru-akademik-menu-card.tsx
      academic-attendance-card.tsx
      academic-attendance-student-row.tsx
      academic-material-form.tsx
      academic-assessment-card.tsx
      academic-assessment-student-row.tsx
    pages/
      guru-akademik-dashboard-page.tsx
      guru-akademik-home-page.tsx
      guru-akademik-profile-page.tsx
      academic-attendance-list-page.tsx
      academic-attendance-form-page.tsx
      academic-assessment-list-page.tsx
      academic-assessment-form-page.tsx
```

Komponen global yang wajib dipakai bila cocok:

- `RoleGradientHeader` / header dashboard global.
- `RoleBottomNav`.
- `RoleProfilePage`.
- `PageLoadingState`, skeleton, empty state, dan error state.
- Formatter tanggal, rupiah tidak diperlukan pada modul ini kecuali ada kebutuhan baru.

## Route

| Route | Halaman |
| --- | --- |
| `/guru-akademik` | Dashboard / Beranda. |
| `/guru-akademik/profile` | Profil Guru Akademik. |
| `/guru-akademik/absensi` | Daftar absensi siswa. |
| `/guru-akademik/absensi/tambah` | Form tambah absensi. |
| `/guru-akademik/penilaian` | Daftar penilaian akhir. |
| `/guru-akademik/penilaian/tambah` | Form tambah penilaian akhir. |

Route detail tidak perlu dipaksakan pada v1 karena Flutter yang ditelusuri menekankan list dan form. Endpoint detail akan tetap dicatat untuk fase API agar mudah ditambahkan bila desain detail disetujui nanti.

## TypeScript Domain

```ts
type AcademicAttendanceStatus = "hadir" | "izin" | "sakit" | "alpa";
type AcademicAssessmentStatus = "draft" | "done";

interface AcademicClass {
  id: string;
  name: string;
}

interface AcademicSubject {
  id: string;
  name: string;
}

interface AcademicTeacher {
  id: string;
  name: string;
}

interface AcademicStudent {
  id: number;
  name: string;
  nis: string;
  className: string;
}

interface AcademicAttendanceItem {
  studentId: number;
  studentName: string;
  status: AcademicAttendanceStatus;
}

interface AcademicAttendance {
  id: string;
  date: string;
  className: string;
  subjectName: string;
  teacherName: string;
  lessonPeriod: number;
  meetingNumber: number;
  material?: { theme?: string; content?: string; rpp?: string };
  items: AcademicAttendanceItem[];
}

interface AcademicAssessmentStudentInput {
  studentId: number;
  studentName: string;
  finalScore: number | null;
  predicate: string;
  aspect1: number | null;
  aspect2: number | null;
  aspect3: number | null;
  aspect4: number | null;
  aspect5: number | null;
  aspect6: number | null;
}

interface AcademicAssessment {
  id: string;
  className: string;
  subjectName: string;
  teacherName: string;
  schoolYear: string;
  semester: string;
  kkm: number;
  status: AcademicAssessmentStatus;
  items: AcademicAssessmentStudentInput[];
}
```

## Dummy Data dan Penyimpanan Lokal

Sebelum API tersedia, modul akan memakai seed data untuk:

- Kelas dan daftar siswa.
- Mata pelajaran.
- Daftar guru.
- Riwayat absensi.
- Riwayat penilaian.

Data baru yang dibuat user disimpan di `localStorage` dengan namespace khusus, misalnya:

```txt
alhamra:guru-akademik:attendance
alhamra:guru-akademik:assessment
```

Aturan:

- Seed dipakai hanya ketika storage belum memiliki data.
- Create absensi dan penilaian mengubah storage, lalu TanStack Query di-invalidate/refetch agar daftar langsung terbaru.
- API adapter tetap diekspor dari awal, tetapi fallback dummy dipilih selama feature flag API Guru Akademik belum aktif.
- Saat API siap, implementasi cukup mengganti fungsi adapter/query tanpa menulis ulang page dan komponen.

## Kontrak API Referensi Flutter

Endpoint berikut berasal dari Flutter legacy dan **perlu konfirmasi backend** sebelum dipakai di PWA produksi.

| Kebutuhan | Method | Endpoint Flutter | Payload / parameter |
| --- | --- | --- | --- |
| Daftar kelas | GET | `/api/kelas` | - |
| Siswa per kelas | GET | `/api/kelas/{kelas}/santri` | Path `kelas`. |
| Daftar absensi | GET | `/api/absen-mapel` | `mataPelajaran`, `kelas` opsional. |
| Detail absensi | GET | `/api/absen-mapel/{id}` | Path `id`. |
| Buat absensi | POST | `/api/absen-mapel` | Tanggal, mapel, kelas, hari, jam, guru, materi, `items`. |
| Jumlah pertemuan | GET | `/api/absen-mapel/pertemuan-count` | `guruNama`, `mataPelajaran`, `kelas`. |
| Daftar penilaian | GET | `/api/penilaian-mapel` | `mataPelajaran`, `kelas` opsional. |
| Detail penilaian | GET | `/api/penilaian-mapel/{id}` | Path `id`. |
| Simpan penilaian | POST | `/api/penilaian-mapel` | Guru, kelas, mapel, tahun ajaran, semester, item nilai. |

Payload referensi absensi:

```json
{
  "tanggal": "2026-07-10",
  "mataPelajaran": "Bahasa Indonesia",
  "kelas": "Kelas VIII A",
  "hari": "Jumat",
  "jamKe": 1,
  "guruNama": "Nama Guru",
  "tema": "Tema pembelajaran",
  "materi": "Materi pembelajaran",
  "rpp": "Referensi RPP",
  "items": [
    { "santriId": 421, "kehadiran": "Hadir" }
  ]
}
```

Payload referensi penilaian:

```json
{
  "mataPelajaran": "Bahasa Indonesia",
  "kelas": "Kelas VIII A",
  "guru": "Nama Guru",
  "tahunAjaran": "2025/2026",
  "semester": "Semester 2",
  "items": [
    {
      "santriId": 421,
      "nilaiAkhir": 85,
      "predikat": "B",
      "aspek1": 85,
      "aspek2": 80,
      "aspek3": 90,
      "aspek4": 82,
      "aspek5": 86,
      "aspek6": 88
    }
  ]
}
```

## Role, Session, dan Reusable UI

Perubahan integrasi lintas aplikasi:

- Tambahkan role key `is_academic_teacher` pada domain role PWA.
- Tambahkan kartu **Guru Akademik** pada role selection bila session API mengirim role tersebut.
- Prioritas route: `/guru-akademik`.
- Tambahkan route ini ke daftar dashboard yang dipertahankan saat URL root dibuka kembali setelah login.
- Role switcher bottom sheet otomatis dapat menampilkan Guru Akademik dari data role yang sama.
- Header dashboard dan bottom nav memakai reusable global agar posisi konsisten dengan semua role lain.

## Validasi dan UX

### Absensi

- Kelas, mapel, guru, jam, dan minimal satu siswa wajib dipilih.
- Tanggal tidak boleh kosong.
- Semua status siswa harus salah satu dari empat status resmi.
- Tombol simpan disable saat data belum valid atau submit berjalan.

### Penilaian

- Kelas, mapel, guru, tahun ajaran, dan semester wajib.
- Nilai akhir dan enam aspek berada dalam rentang 0-100 bila diisi.
- Nilai akhir menentukan predikat dummy:
  - 90-100: A
  - 80-89: B
  - 70-79: C
  - di bawah 70: D
- KKM awal 75; status tuntas dihitung dari nilai akhir terhadap KKM.

### Tampilan

- Mobile-first, mengikuti PWA role lain.
- Tidak memakai default browser select yang kasar; gunakan select/shadcn yang sudah dipakai aplikasi.
- List memakai skeleton ketika data dimuat, empty state ketika tidak ada data, dan error state bila adapter API nantinya gagal.
- Dummy mode tidak menampilkan error API palsu.
- Konten panjang dipotong aman atau wrap tanpa merusak card.

## Tahapan Implementasi

### Tahap 1: Fondasi Role dan Routing

- Tambahkan role `is_academic_teacher`.
- Tambahkan role data, route, dashboard persistence, dan lazy loading.
- Output: user yang memiliki role Guru Akademik dapat memilih dan masuk role ini.

### Tahap 2: Domain, Dummy Store, dan API Seam

- Buat types, fallback seed data, local storage repository, schema, dan query hooks.
- Buat API adapter placeholder dengan kontrak endpoint referensi Flutter.
- Output: halaman tidak bergantung pada hardcode di JSX dan siap diganti API.

### Tahap 3: Dashboard dan Profil

- Buat shell, Beranda, dua menu utama, dan profil reusable.
- Output: role dapat dinavigasi dengan header, role switcher, dan footer konsisten.

### Tahap 4: Absensi Siswa

- Buat list, card ringkasan, form, status kehadiran, materi, jumlah pertemuan dummy, dan local mutation.
- Output: guru dapat membuat absensi baru dan melihatnya setelah refresh.

### Tahap 5: Penilaian Akhir

- Buat list, card penilaian, form nilai per siswa, predikat/KKM, enam aspek, dan local mutation.
- Output: guru dapat membuat penilaian baru dan melihat ringkasannya setelah refresh.

### Tahap 6: Stabilitas UX

- Terapkan skeleton, empty/error state, toast, validasi, sticky action, dan pemeriksaan overflow layar mobile.
- Output: flow nyaman diuji meskipun API belum ada.

### Tahap 7: Verifikasi

- Manual smoke test seluruh route Guru Akademik.
- Jalankan `npm exec tsc -- --noEmit`, `npm run lint`, dan `npm run build` hanya setelah implementasi selesai dan bila diizinkan.
- Output: modul siap masuk tahap integrasi API backend.

## Checklist Manual

- [ ] Login dengan role `is_academic_teacher` menampilkan kartu Guru Akademik.
- [ ] Role switcher dapat berpindah ke dan dari Guru Akademik.
- [ ] Dashboard membuka menu Absensi dan Penilaian.
- [ ] Bottom nav Beranda dan Profil aktif benar.
- [ ] Kelas yang dipilih memuat siswa yang sesuai.
- [ ] Absensi default seluruh siswa `Hadir`.
- [ ] Status Izin/Sakit/Alpa dapat diganti dan ikut tersimpan.
- [ ] Materi dan pertemuan ikut tersimpan pada absensi.
- [ ] Data absensi tetap tampil setelah refresh.
- [ ] Nilai 0-100 tervalidasi.
- [ ] Predikat dan status tuntas terhitung sesuai nilai.
- [ ] Data penilaian tetap tampil setelah refresh.
- [ ] Tidak ada blank page di seluruh route Guru Akademik.

## Pertanyaan Untuk Backend

1. Apakah endpoint final Guru Akademik tetap memakai endpoint legacy `/api/*`, atau akan pindah ke pola Odoo `/api/v2/*`?
2. Apakah status penilaian `draft/done` dikirim backend atau dihitung frontend?
3. Apakah keenam aspek penilaian selalu wajib untuk semua mapel?
4. Apa daftar mapel, kelas, dan guru yang menjadi master resmi?
5. Apakah absensi mendukung edit dan pembatalan setelah disimpan?
6. Apakah detail absensi/penilaian harus memiliki route sendiri pada PWA?
7. Bagaimana aturan predikat resmi dan KKM per mapel/kelas?

## Keputusan Implementasi V1

- Ikuti flow Flutter sebagai sumber utama.
- Gunakan dummy data + localStorage sampai API final tersedia.
- Tidak mengaktifkan integrasi endpoint legacy tanpa konfirmasi backend.
- Gunakan komponen global yang sudah ada agar desain tetap satu keluarga dengan role lain.
