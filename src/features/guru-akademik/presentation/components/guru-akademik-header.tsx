import type { ReactNode } from "react";
import { RoleGradientHeader } from "@/components/layout/role-gradient-header";

export function GuruAkademikHeader({ title, subtitle, onBack, bottom }: { title: string; subtitle?: string; onBack?: () => void; bottom?: ReactNode }) {
  return <RoleGradientHeader title={title} subtitle={subtitle} onBack={onBack} showRoleButton bottom={bottom} backLayout={onBack ? "stacked" : "global"} />;
}
