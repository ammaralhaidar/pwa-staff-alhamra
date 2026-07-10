import { Home, UserCircle2 } from "lucide-react";
import { RoleBottomNav, type RoleBottomNavItem } from "@/components/layout/role-bottom-nav";

const navItems: RoleBottomNavItem[] = [
  { to: "/guru-quran", label: "Beranda", icon: Home, end: true },
  { to: "/guru-quran/profile", label: "Akun", icon: UserCircle2 },
];

export function GuruQuranBottomNav() {
  return <RoleBottomNav items={navItems} />;
}
