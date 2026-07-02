import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

import { appAssets } from "@/shared/assets/app-assets";
import { GlobalHeader } from "@/shared/presentation/components/global-header";

interface RoleGradientHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: ReactNode;
  bottom?: ReactNode;
  className?: string;
  showRoleButton?: boolean;
  backLayout?: "global" | "stacked";
}

export function RoleGradientHeader({
  title,
  subtitle,
  onBack,
  action,
  bottom,
  className,
  showRoleButton = true,
  backLayout = "global",
}: RoleGradientHeaderProps) {
  if (backLayout === "stacked" && onBack) {
    return (
      <header className="relative z-40 flex min-h-[135px] shrink-0 flex-col justify-center overflow-hidden rounded-b-[28px] px-6 text-white">
        <img
          src={appAssets.dashboardHeader}
          alt=""
          className="pointer-events-none absolute inset-x-0 -top-[30%] h-[160%] w-full select-none object-cover object-center"
        />

        <div className="relative z-10 mx-auto w-full max-w-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex shrink-0 items-center text-white/90 transition hover:text-white active:scale-95"
            >
              <ChevronLeft className="size-6" />
            </button>
            <div className="min-w-0 space-y-0.5">
              <h2 className="text-[20px] font-extrabold leading-tight">{title}</h2>
              {subtitle ? <p className="text-[12px] font-medium leading-normal text-white/80">{subtitle}</p> : null}
            </div>
          </div>
        </div>

        {bottom ? <div className="relative z-10 mx-auto mt-3 max-w-md">{bottom}</div> : null}
      </header>
    );
  }

  return (
    <GlobalHeader
      title={title}
      onBack={onBack}
      showRoleButton={showRoleButton}
      action={action}
      bottom={bottom}
      className={className}
    />
  );
}
