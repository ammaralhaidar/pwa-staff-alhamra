import { LogOut } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/features/auth/infrastructure/auth-api";
import { filterUserRoles, resolveRoleRoute } from "@/features/roles/application/filter-user-roles";
import type { AppRole } from "@/features/roles/domain/role";
import { appRoles } from "@/features/roles/infrastructure/role-data";
import { RoleCard } from "@/features/roles/presentation/components/role-card";
import { clearAuthSession, hasStoredAuthSession, resolveStoredRoleFlags } from "@/lib/storage";
import { appAssets } from "@/shared/assets/app-assets";
import { appQueryClient } from "@/app/providers/app-providers";

export function RoleSelectionPage() {
  const navigate = useNavigate();
  const userRoles = useMemo(() => resolveStoredRoleFlags(), []);
  const visibleRoles = filterUserRoles(appRoles, userRoles);

  useEffect(() => {
    if (!hasStoredAuthSession()) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  function handleRoleSelect(role: AppRole) {
    navigate(resolveRoleRoute(role, userRoles));
  }

  async function handleLogout() {
    await authApi.logout().catch(() => undefined);
    appQueryClient.clear();
    clearAuthSession();
    navigate("/login", { replace: true });
  }

  return (
    <main className="role-stage min-h-svh bg-[#f8fbff] text-[#111827]">
      <section className="mx-auto min-h-svh w-full max-w-[430px] bg-white px-6 pb-8 pt-10 md:max-w-[520px] md:px-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logout"
            className="flex h-11 w-11 items-center justify-center rounded-full text-[#111827] transition active:scale-95"
          >
            <LogOut className="h-6 w-6 stroke-[1.8] rotate-180" aria-hidden="true" />
          </button>
          <img src={appAssets.brandLogo} alt="IBS Al Hamra" className="h-auto w-[92px] object-contain" />
        </header>

        <div className="mt-12 text-center md:mt-14">
          <p className="text-[28px] font-bold leading-tight tracking-normal text-[#111827] md:text-[28px]">Pilih Role Anda</p>
          <p className="mt-2 text-[14px] font-medium text-[#6b7280] md:text-[15px]">Pilih peran Anda untuk melanjutkan</p>
        </div>

        {visibleRoles.length === 0 ? (
          <div className="flex min-h-[430px] flex-col items-center justify-center text-center text-[#6b7280]">
            <p className="text-base font-semibold">Tidak ada akses role tersedia</p>
            <p className="mt-2 text-sm">Hubungi admin untuk mendapatkan akses</p>
          </div>
        ) : (
          <div className="mt-7 space-y-4 md:mt-8">
            {visibleRoles.map((role) => (
              <RoleCard key={role.odooKey} role={role} onSelect={handleRoleSelect} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
