import { ClipboardList, TrendingUp, UsersRound, Database } from "lucide-react";
import { MusyrifHeader } from "../components/musyrif-header";
import { MusyrifMenuCard } from "../components/musyrif-menu-card";

export function MusyrifHomePage() {
  return (
    <main className="mx-auto max-w-[430px]">
      <MusyrifHeader title="Dashboard Musyrif" />
      <section className="flex flex-col gap-4 px-4 py-6">
        <MusyrifMenuCard
          to="/musyrif/perijinan"
          title="Perijinan Santri"
          description="Kelola izin keluar santri"
          icon={<ClipboardList className="size-7" />}
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-500"
        />
        <MusyrifMenuCard
          to="/musyrif/aktivitas"
          title="Aktivitas"
          description="Monitoring aktivitas santri"
          icon={<TrendingUp className="size-7" />}
          iconBgClass="bg-emerald-50"
          iconColorClass="text-emerald-500"
        />
        <MusyrifMenuCard
          to="/musyrif/data"
          title="Musyrif/Tahfidz"
          description="Input dan riwayat tahfidz musyrif"
          icon={<UsersRound className="size-7" />}
          iconBgClass="bg-purple-50"
          iconColorClass="text-purple-500"
        />
        <MusyrifMenuCard
          to="/musyrif/santri"
          title="Data Santri"
          description="Informasi lengkap santri"
          icon={<Database className="size-7" />}
          iconBgClass="bg-orange-50"
          iconColorClass="text-orange-500"
        />
      </section>
    </main>
  );
}
