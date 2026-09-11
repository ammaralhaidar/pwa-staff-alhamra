import { Outlet, useLocation } from "react-router-dom";
import { PengumumanBottomNav } from "./pengumuman-bottom-nav";

export function PengumumanShell() {
  const location = useLocation();

  const showNav =
    location.pathname === "/pengumuman" ||
    location.pathname === "/pengumuman/" ||
    location.pathname === "/pengumuman/profile" ||
    location.pathname === "/pengumuman/profile/";

  return (
    <div className="min-h-svh bg-[#EFF6FF]">
      <div className={showNav ? "pb-[86px]" : ""}>
        <Outlet />
      </div>
      {showNav ? <PengumumanBottomNav /> : null}
    </div>
  );
}
