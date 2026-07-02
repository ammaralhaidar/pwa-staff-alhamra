import { Outlet, useLocation } from "react-router-dom";
import type { PelanggaranAccessType } from "../../domain/pelanggaran-types";
import { PelanggaranBottomNav } from "./pelanggaran-bottom-nav";

export function PelanggaranShell({ accessType }: { accessType: PelanggaranAccessType }) {
  const location = useLocation();
  const showBinaan = accessType === "biasa";

  // Check if we are on a landing page that should display the bottom navigation
  const basePath = accessType === "pendidik" ? "/pelanggaran/pendidik" : "/pelanggaran";
  const showNav = location.pathname === basePath || 
                  location.pathname === `${basePath}/` || 
                  location.pathname === `${basePath}/binaan` || 
                  location.pathname === `${basePath}/binaan/` || 
                  location.pathname === `${basePath}/profile` || 
                  location.pathname === `${basePath}/profile/`;

  return (
    <div className="min-h-svh bg-[#EFF6FF]">
      <div className={showNav ? "pb-[86px]" : ""}>
        <Outlet />
      </div>
      {showNav ? <PelanggaranBottomNav accessType={accessType} showBinaan={showBinaan} /> : null}
    </div>
  );
}
