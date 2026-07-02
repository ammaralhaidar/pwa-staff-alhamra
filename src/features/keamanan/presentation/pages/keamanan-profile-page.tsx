import { RoleProfilePage } from "@/shared/presentation/components/role-profile-page";

export function KeamananProfilePage() {
  return (
    <RoleProfilePage
      title="Petugas Keamanan"
      role="Petugas Keamanan"
      fallbackName="Petugas Keamanan"
      fallbackInitial="K"
      fallbackNotice="Data session belum tersedia, menampilkan identitas role default."
    />
  );
}
