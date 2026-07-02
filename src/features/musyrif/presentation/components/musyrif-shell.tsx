import { Outlet, useLocation } from "react-router-dom";
import { MusyrifBottomNav } from "./musyrif-bottom-nav";

export function MusyrifShell() {
  const location = useLocation();
  
  // Show bottom nav only on main landing pages (Beranda and Profil)
  const showNav = location.pathname === "/musyrif" || 
                  location.pathname === "/musyrif/" || 
                  location.pathname === "/musyrif/profile" || 
                  location.pathname === "/musyrif/profile/";

  return (
    <div className="min-h-svh bg-[#EFF6FF]">
      <div className={showNav ? "pb-[86px]" : ""}>
        <Outlet />
      </div>
      {showNav ? <MusyrifBottomNav /> : null}
    </div>
  );
}
