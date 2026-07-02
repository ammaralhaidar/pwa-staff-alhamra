import { Home, UserCircle2 } from "lucide-react";
import { RoleBottomNav, type RoleBottomNavItem } from "@/components/layout/role-bottom-nav";

const navItems: RoleBottomNavItem[] = [
  { to: "/guru-quran", label: "Beranda", icon: Home, end: true },
  { to: "/guru-quran/profile", label: "Akun", icon: UserCircle2 },
];

export function GuruQuranBottomNav() {
  return (
    <RoleBottomNav
      items={navItems}
      className="left-1/2 h-[70px] w-full -translate-x-1/2 border-gray-100 bg-white px-0 py-0 shadow-[0_-5px_10px_rgba(0,0,0,0.05)] backdrop-blur-none"
      contentClassName="h-full"
      itemClassName="h-full flex-1 justify-center gap-1 rounded-none px-0 py-0 text-[12px] font-medium"
      activeClassName="text-[#288DE5]"
      inactiveClassName="text-[#9CA3AF]"
      iconWrapClassName="flex items-center justify-center rounded-xl p-2 transition-colors"
      activeIconWrapClassName="bg-[#EFF6FF]"
    />
  );
}
