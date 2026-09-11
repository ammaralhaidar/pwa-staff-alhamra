import { Outlet, useLocation } from "react-router-dom";
import { GuruAkademikBottomNav } from "../components/guru-akademik-bottom-nav";

export function GuruAkademikDashboardPage() {
  const location = useLocation();
  const showNav = location.pathname === "/guru-akademik" || location.pathname === "/guru-akademik/profile";
  return <div className="min-h-svh bg-[#EFF6FF]"><div className={showNav ? "pb-[86px]" : ""}><Outlet /></div>{showNav ? <GuruAkademikBottomNav /> : null}</div>;
}
