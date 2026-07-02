import { BookOpenCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MusyrifHeader } from "../components/musyrif-header";
import { MusyrifMenuCard } from "../components/musyrif-menu-card";

export function MusyrifDataMenuPage() {
  const navigate = useNavigate();
  return (
    <main className="mx-auto max-w-[430px]">
      <MusyrifHeader
        title="Data Musyrif"
        subtitle="Data tahfidz dan musyrif"
        onBack={() => navigate("/musyrif")}
      />
      <section className="space-y-4 px-4 py-6">
        <MusyrifMenuCard
          to="/musyrif/data/tahfidz"
          title="Tahfidz Musyrif"
         
          icon={<BookOpenCheck className="size-7" />}
        />
      </section>
    </main>
  );
}
