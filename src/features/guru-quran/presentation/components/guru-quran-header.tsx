import type { ReactNode } from "react";
import { RoleGradientHeader } from "@/components/layout/role-gradient-header";

interface GuruQuranHeaderProps {
  title?: string;
  bottom?: ReactNode;
  onBack?: () => void;
}

export function GuruQuranHeader({
  title = "Beranda Guru Qur'an",
  onBack,
  bottom,
}: GuruQuranHeaderProps) {
  return (
    <RoleGradientHeader title={title} onBack={onBack} showRoleButton bottom={bottom} />
  );
}
