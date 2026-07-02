import type { AppRole, UserRoleFlags } from "@/features/roles/domain/role";

export function filterUserRoles(roles: AppRole[], userRoles?: UserRoleFlags | null) {
  if (!userRoles || Object.keys(userRoles).length === 0) {
    return [];
  }

  return roles.filter((role) => userRoles[role.odooKey] || role.alternateOdooKeys?.some((key) => userRoles[key]));
}

export function resolveRoleRoute(role: AppRole, userRoles?: UserRoleFlags | null) {
  if (role.odooKey === "is_petugas_pelanggaran" && userRoles?.is_petugas_pelanggaran_pendidik) {
    return "/pelanggaran/pendidik";
  }

  return role.route;
}
