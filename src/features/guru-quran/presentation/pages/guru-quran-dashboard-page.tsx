import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { GuruQuranBottomNav } from "../components/guru-quran-bottom-nav";

export function GuruQuranDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Show FAB only on the home tab (not on profile)
  const isHomePage = location.pathname === "/guru-quran";

  return (
    <div className="relative min-h-svh bg-[#EFF6FF]">
      {/* Page content */}
      <div className="pb-[70px]">
        <Outlet />
      </div>

      {/* Floating Action Button — only visible on Beranda tab */}
      {isHomePage && (
        <div className="fixed bottom-[86px] left-0 right-0 pointer-events-none z-50">
          <div className="mx-auto max-w-[430px] w-full px-4 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/guru-quran/tahfidz/absen/tambah")}
              aria-label="Tambah Absen"
              className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#288DE5] shadow-[0_4px_14px_rgba(40,141,229,0.45)] transition-all duration-200 active:scale-95 text-white"
            >
              <Plus className="h-7 w-7" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <GuruQuranBottomNav />
    </div>
  );
}
