import type { ReactNode } from "react";
import { RoleGradientHeader } from "@/components/layout/role-gradient-header";

interface PelanggaranHeaderProps {
  title: string;
  onBack?: () => void;
  bottom?: ReactNode;
  action?: ReactNode;
}

export function PelanggaranHeader({ title, onBack, bottom, action }: PelanggaranHeaderProps) {
  return (
    <RoleGradientHeader title={title} onBack={onBack} showRoleButton bottom={bottom} action={action} />
  );
}
