import type { ReactNode } from "react";
import { RoleGradientHeader } from "@/components/layout/role-gradient-header";

interface MusyrifHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  bottom?: ReactNode;
}

export function MusyrifHeader({ title, subtitle, onBack, bottom }: MusyrifHeaderProps) {
  return <RoleGradientHeader title={title} subtitle={subtitle} onBack={onBack} showRoleButton bottom={bottom} backLayout={onBack ? "stacked" : "global"} />;
}
