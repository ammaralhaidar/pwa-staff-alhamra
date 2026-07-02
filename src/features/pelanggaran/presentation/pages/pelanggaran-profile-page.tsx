import { RoleProfilePage } from "@/shared/presentation/components/role-profile-page";
import type { PelanggaranAccessType } from "../../domain/pelanggaran-types";

export function PelanggaranProfilePage({ accessType }: { accessType: PelanggaranAccessType }) {
  const role = accessType === "pendidik" ? "Pelanggaran Pendidik" : "Pengelola Pelanggaran";
  const fallbackName = accessType === "pendidik" ? "User Pelanggaran Pendidik" : "User Pelanggaran";

  return <RoleProfilePage title={role} role={role} fallbackName={fallbackName} fallbackInitial="P" />;
}
