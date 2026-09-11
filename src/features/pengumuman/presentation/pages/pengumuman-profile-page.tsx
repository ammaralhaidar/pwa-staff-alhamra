import { RoleProfilePage } from "@/shared/presentation/components/role-profile-page";

export function PengumumanProfilePage() {
  return (
    <RoleProfilePage
      title="Pengumuman"
      role="Kelola Artikel & Pengumuman"
      fallbackName="Pegawai Pengumuman"
      fallbackEmail="-"
      fallbackInitial="P"
      avatarColor="#FB8C00"
      fallbackNotice="Data session belum lengkap. Menampilkan identitas role default."
    />
  );
}
