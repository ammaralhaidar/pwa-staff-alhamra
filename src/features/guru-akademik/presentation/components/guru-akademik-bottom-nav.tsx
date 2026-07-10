import { Home, UserCircle2 } from "lucide-react";
import { RoleBottomNav, type RoleBottomNavItem } from "@/components/layout/role-bottom-nav";

const items: RoleBottomNavItem[] = [
  { to: "/guru-akademik", label: "Beranda", icon: Home, end: true },
  { to: "/guru-akademik/profile", label: "Akun", icon: UserCircle2 },
];

export function GuruAkademikBottomNav() { return <RoleBottomNav items={items} />; }
