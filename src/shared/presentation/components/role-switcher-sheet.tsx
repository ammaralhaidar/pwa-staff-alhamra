import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { filterUserRoles, resolveRoleRoute } from "@/features/roles/application/filter-user-roles";
import type { AppRole } from "@/features/roles/domain/role";
import { appRoles } from "@/features/roles/infrastructure/role-data";
import { RoleCard } from "@/features/roles/presentation/components/role-card";
import { resolveStoredRoleFlags } from "@/lib/storage";

type RoleSwitcherSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RoleSwitcherSheet({ open, onOpenChange }: RoleSwitcherSheetProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const userRoles = useMemo(() => resolveStoredRoleFlags(), []);

  const availableRoles = useMemo(
    () =>
      filterUserRoles(appRoles, userRoles).filter((role) => {
        const route = resolveRoleRoute(role, userRoles);
        return !isCurrentRoleRoute(location.pathname, route);
      }),
    [location.pathname, userRoles],
  );

  function handleRoleSelect(role: AppRole) {
    onOpenChange(false);
    navigate(resolveRoleRoute(role, userRoles), { state: { roleSwitchId: Date.now() } });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="mx-auto max-h-[78svh] w-full max-w-[430px] rounded-t-[28px] border-0 bg-white px-5 pb-[max(28px,env(safe-area-inset-bottom))] pt-3 shadow-2xl"
      >
        <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200" aria-hidden="true" />
        <div className="pt-5 text-center">
          <SheetTitle className="text-[25px] font-bold text-slate-950">Pilih Role Anda</SheetTitle>
          <SheetDescription className="mt-2 text-[15px] font-medium text-slate-400">
            Pilih peran Anda untuk melanjutkan
          </SheetDescription>
        </div>

        {availableRoles.length ? (
          <div className="mt-6 max-h-[52svh] space-y-3 overflow-y-auto overscroll-contain px-0.5 pb-1">
            {availableRoles.map((role) => (
              <RoleCard key={role.odooKey} role={role} onSelect={handleRoleSelect} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-52 items-center justify-center px-6 text-center text-[17px] font-medium text-slate-400">
            Tidak ada role lain tersedia
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function isCurrentRoleRoute(pathname: string, roleRoute: string) {
  return pathname === roleRoute || pathname.startsWith(`${roleRoute}/`);
}
