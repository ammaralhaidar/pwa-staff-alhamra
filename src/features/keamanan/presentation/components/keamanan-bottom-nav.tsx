import { Home, QrCode, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RoleBottomNav, type RoleBottomNavItem } from "@/components/layout/role-bottom-nav";

const items: RoleBottomNavItem[] = [
  { to: "/keamanan", label: "Beranda", icon: Home, end: true },
  { to: "/keamanan/profile", label: "Profil", icon: UserRound },
];

export function KeamananBottomNav() {
  const navigate = useNavigate();
  return (
    <RoleBottomNav
      items={items}
      centerSpacer
      centerAction={
        <button
          type="button"
          onClick={() => navigate("/keamanan/scan")}
          className="absolute left-1/2 top-0 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-lg"
          aria-label="Scan QR"
        >
          <QrCode className="size-7" />
        </button>
      }
    />
  );
}
