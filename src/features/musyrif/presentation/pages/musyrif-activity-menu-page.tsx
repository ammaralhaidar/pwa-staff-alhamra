import { ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MusyrifHeader } from "../components/musyrif-header";
import { MusyrifMenuCard } from "../components/musyrif-menu-card";

export function MusyrifActivityMenuPage() {
  const navigate = useNavigate();
  return (
    <main className="mx-auto max-w-[430px]">
      <MusyrifHeader
        title="Aktivitas"
        subtitle="Monitoring aktivitas santri"
        onBack={() => navigate("/musyrif")}
      />
      <section className="space-y-4 px-4 py-6">
        <MusyrifMenuCard
          to="/musyrif/aktivitas/mutabaah"
          title="Mutabaah Harian"
         
          icon={<ClipboardCheck className="size-7" />}
        />
      </section>
    </main>
  );
}
