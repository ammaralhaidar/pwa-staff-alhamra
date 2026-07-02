import { RoleProfilePage } from "@/shared/presentation/components/role-profile-page";

export function KesantrianProfilePage() {
  return (
    <RoleProfilePage
      title="Kepala Bagian Kesantrian"
      role="Kepala Bagian Kesantrian"
      fallbackName="User Kesantrian"
      fallbackInitial="K"
    />
  );
}
