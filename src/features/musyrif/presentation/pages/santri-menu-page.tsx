import { UsersRound } from "lucide-react";
import { MusyrifHeader } from "../components/musyrif-header";
import { MusyrifMenuCard } from "../components/musyrif-menu-card";

export function SantriMenuPage() {
  return (
    <main className="mx-auto max-w-[430px]">
      <MusyrifHeader title="Data Santri" />
      <section className="space-y-4 px-4 py-6">
        <MusyrifMenuCard
          to="/musyrif/santri/list"
          title="Cek Santri"
         
          icon={<UsersRound className="size-7" />}
        />
      </section>
    </main>
  );
}
