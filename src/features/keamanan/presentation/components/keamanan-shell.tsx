import { Outlet, useLocation } from "react-router-dom";
import { KeamananBottomNav } from "./keamanan-bottom-nav";

export function KeamananShell() {
  const { pathname } = useLocation();

  // Show navigation only on home page and profile page
  const cleanPath = pathname.replace(/\/$/, "");
  const showNav = cleanPath === "/keamanan" || cleanPath === "/keamanan/profile";

  return (
    <div className="min-h-svh bg-white">
      <div className={showNav ? "pb-[86px]" : ""}>
        <Outlet />
      </div>
      {showNav ? <KeamananBottomNav /> : null}
    </div>
  );
}
