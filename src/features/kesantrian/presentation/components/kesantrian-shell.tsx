import { Outlet } from "react-router-dom";
import { KesantrianBottomNav } from "./kesantrian-bottom-nav";

export function KesantrianShell() {
  return (
    <div className="min-h-svh bg-[#EFF6FF]">
      <div className="pb-[86px]">
        <Outlet />
      </div>
      <KesantrianBottomNav />
    </div>
  );
}
