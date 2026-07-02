import type { ReactNode } from "react";
import { RoleGradientHeader } from "@/components/layout/role-gradient-header";

interface KesantrianHeaderProps {
  title: string;
  onBack?: () => void;
  bottom?: ReactNode;
  description?: string;
}

export function KesantrianHeader({ title, onBack, bottom }: KesantrianHeaderProps) {
  return <RoleGradientHeader title={title} onBack={onBack} showRoleButton bottom={bottom} />;
}
