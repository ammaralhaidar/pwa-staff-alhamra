import { Home, AlertTriangle, User } from "lucide-react";
import { RoleBottomNav, type RoleBottomNavItem } from "@/components/layout/role-bottom-nav";

const navItems: RoleBottomNavItem[] = [
  { to: "/kesantrian/perijinan", label: "Perijinan", icon: Home },
  { to: "/kesantrian/pelanggaran", label: "Pelanggaran", icon: AlertTriangle },
  { to: "/kesantrian/profile", label: "Profil", icon: User },
];

export function KesantrianBottomNav() {
  return (
    <RoleBottomNav
      items={navItems}
      className="max-w-none border-blue-50 bg-white px-4 py-2 shadow-[0_-8px_30px_rgba(15,23,42,0.06)] backdrop-blur-none"
      contentClassName="mx-auto grid max-w-md grid-cols-3 gap-2"
      itemClassName="min-w-0 rounded-none px-0 py-0 text-[11px] font-medium"
      activeClassName="text-[#1F7CD4]"
      inactiveClassName="text-slate-400 hover:text-slate-600"
      iconWrapClassName="flex items-center justify-center rounded-2xl px-5 py-1.5 transition-all duration-250"
      activeIconWrapClassName="bg-[#F0F7FF] text-[#1F7CD4]"
    />
  );
}
