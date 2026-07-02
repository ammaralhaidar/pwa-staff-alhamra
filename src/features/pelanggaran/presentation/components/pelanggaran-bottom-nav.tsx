import { ClipboardList, Home, UserRound } from "lucide-react";
import { RoleBottomNav, type RoleBottomNavItem } from "@/components/layout/role-bottom-nav";
import type { PelanggaranAccessType } from "../../domain/pelanggaran-types";

export function PelanggaranBottomNav({ accessType, showBinaan }: { accessType: PelanggaranAccessType; showBinaan?: boolean }) {
  const basePath = accessType === "pendidik" ? "/pelanggaran/pendidik" : "/pelanggaran";
  const items: RoleBottomNavItem[] = [
    { to: basePath, label: "Beranda", icon: Home, end: true },
    ...(showBinaan ? [{ to: "/pelanggaran/binaan", label: "Binaan", icon: ClipboardList, end: false }] : []),
    { to: `${basePath}/profile`, label: "Profil", icon: UserRound, end: false },
  ];

  return (
    <RoleBottomNav
      items={items}
      className="px-5"
      itemClassName="min-w-20 px-4"
    />
  );
}
