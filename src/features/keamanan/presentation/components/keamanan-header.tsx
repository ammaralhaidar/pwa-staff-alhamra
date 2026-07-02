import type { ReactNode } from "react";
import { RoleGradientHeader } from "@/components/layout/role-gradient-header";

interface KeamananHeaderProps {
  title: string;
  onBack?: () => void;
  action?: ReactNode;
  bottom?: ReactNode;
  className?: string;
}

export function KeamananHeader({ title, onBack, action, bottom, className }: KeamananHeaderProps) {
  return (
    <RoleGradientHeader title={title} onBack={onBack} showRoleButton={!action} action={action} bottom={bottom} className={className} />
  );
}
