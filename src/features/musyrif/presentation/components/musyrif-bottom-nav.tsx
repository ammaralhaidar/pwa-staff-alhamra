import { Home, UserRound } from "lucide-react";
import { RoleBottomNav, type RoleBottomNavItem } from "@/components/layout/role-bottom-nav";

const items: RoleBottomNavItem[] = [
  { to: "/musyrif", label: "Beranda", icon: Home, end: true },
  { to: "/musyrif/profile", label: "Profil", icon: UserRound },
];

export function MusyrifBottomNav() {
  return <RoleBottomNav items={items} />;
}
