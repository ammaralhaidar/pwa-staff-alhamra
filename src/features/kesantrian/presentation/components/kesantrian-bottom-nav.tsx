import { Home, AlertTriangle, User } from "lucide-react";
import { RoleBottomNav, type RoleBottomNavItem } from "@/components/layout/role-bottom-nav";

const navItems: RoleBottomNavItem[] = [
  { to: "/kesantrian/perijinan", label: "Perijinan", icon: Home },
  { to: "/kesantrian/pelanggaran", label: "Pelanggaran", icon: AlertTriangle },
  { to: "/kesantrian/profile", label: "Profil", icon: User },
];

export function KesantrianBottomNav() {
  return <RoleBottomNav items={navItems} />;
}
