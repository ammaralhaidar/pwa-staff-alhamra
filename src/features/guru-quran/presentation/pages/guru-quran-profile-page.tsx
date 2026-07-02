import { RoleProfilePage } from "@/shared/presentation/components/role-profile-page";

export function GuruQuranProfilePage() {
  return (
    <RoleProfilePage
      title="Guru Quran"
      role="Guru Quran Tahfidz"
      fallbackName="Ustadz Pengampu"
      fallbackEmail="guru.quran@alhamra.com"
      fallbackInitial="G"
      avatarColor="#0EA5E9"
    />
  );
}
