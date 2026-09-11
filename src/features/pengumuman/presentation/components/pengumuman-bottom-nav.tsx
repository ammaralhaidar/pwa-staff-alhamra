import { Home, UserRound } from "lucide-react";
import { RoleBottomNav, type RoleBottomNavItem } from "@/components/layout/role-bottom-nav";

const items: RoleBottomNavItem[] = [
  { to: "/pengumuman", label: "Beranda", icon: Home, end: true },
  { to: "/pengumuman/profile", label: "Profil", icon: UserRound, end: false },
];

export function PengumumanBottomNav() {
  return <RoleBottomNav items={items} />;
}
