import { ClipboardCheck } from "lucide-react";
import { GuruAkademikHeader } from "../components/guru-akademik-header";
import { AcademicMenuCard } from "../components/academic-menu-card";

export function GuruAkademikHomePage() { return <main className="mx-auto max-w-[430px]"><GuruAkademikHeader title="Dashboard Guru Akademik" /><section className="flex flex-col gap-4 px-5 py-6"><AcademicMenuCard to="/guru-akademik/absensi" title="Absensi Siswa" description="Kelola kehadiran siswa" icon={<ClipboardCheck className="size-8 text-blue-500" />} color="bg-blue-50" /></section></main>; }
