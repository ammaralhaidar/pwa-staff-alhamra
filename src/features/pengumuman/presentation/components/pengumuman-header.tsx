import type { ReactNode } from "react";
import { RoleGradientHeader } from "@/components/layout/role-gradient-header";

interface PengumumanHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showRoleButton?: boolean;
  backLayout?: "global" | "stacked";
  bottom?: ReactNode;
}

export function PengumumanHeader({
  title,
  subtitle,
  onBack,
  showRoleButton = true,
  backLayout = "global",
  bottom,
}: PengumumanHeaderProps) {
  return (
    <RoleGradientHeader
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      showRoleButton={showRoleButton}
      backLayout={backLayout}
      bottom={bottom}
    />
  );
}
