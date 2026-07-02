import { RoleProfilePage } from "@/shared/presentation/components/role-profile-page";

export function MusyrifProfilePage() {
  return (
    <RoleProfilePage
      title="Musyrif"
      role="Musyrif"
      fallbackName="Musyrif"
      fallbackEmail="-"
      fallbackInitial="M"
      fallbackNotice="Data session belum lengkap. Menampilkan identitas role default."
    />
  );
}
