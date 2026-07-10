import { ClipboardCheck, GraduationCap } from "lucide-react";
import { GuruAkademikHeader } from "../components/guru-akademik-header";
import { AcademicMenuCard } from "../components/academic-menu-card";

export function GuruAkademikHomePage() { return <main className="mx-auto max-w-[430px]"><GuruAkademikHeader title="Dashboard Guru Akademik" /><section className="flex flex-col gap-4 px-4 py-6"><AcademicMenuCard to="/guru-akademik/absensi" title="Absensi Siswa" description="Kelola kehadiran siswa" icon={<ClipboardCheck className="size-7 text-blue-500" />} color="bg-blue-50" /><AcademicMenuCard to="/guru-akademik/penilaian" title="Penilaian Akhir Guru" description="Kelola penilaian akhir siswa" icon={<GraduationCap className="size-7 text-violet-500" />} color="bg-violet-50" /></section></main>; }
