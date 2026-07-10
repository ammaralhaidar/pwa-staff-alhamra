import { useState, type ReactNode } from "react";
import { ArrowLeft, UserSquare2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appAssets } from "@/shared/assets/app-assets";
import { RoleSwitcherSheet } from "@/shared/presentation/components/role-switcher-sheet";

interface GlobalHeaderProps {
  title: string;
  onBack?: () => void;
  showRoleButton?: boolean;
  action?: ReactNode;
  bottom?: ReactNode;
  className?: string;
}

export function GlobalHeader({ title, onBack, showRoleButton = true, action, bottom, className }: GlobalHeaderProps) {
  const [isRoleSheetOpen, setIsRoleSheetOpen] = useState(false);

  const formatDateIndonesian = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Intl.DateTimeFormat("id-ID", options).format(new Date());
  };

  return (
    <header className={`relative overflow-hidden rounded-b-[28px] bg-transparent px-5 pb-8 pt-4 text-white ${className ?? ""}`}>
      {/* Background Image */}
      <img
        src={appAssets.dashboardHeader}
        alt=""
        className="pointer-events-none absolute inset-x-0 w-full h-[160%] -top-[30%] select-none object-cover object-center"
      />
      
      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {action ? (
            action
          ) : onBack ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 rounded-full bg-white/20 text-white hover:bg-white/30"
              onClick={onBack}
            >
              <ArrowLeft className="size-5" />
            </Button>
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20 p-1.5 shadow-inner">
              <img src={appAssets.logo} alt="IBS Logo" className="h-full w-full object-contain" />
            </div>
          )}
          <div>
            <h2 className="m-0 text-base font-semibold leading-tight">{title}</h2>
            <p className="mt-0.5 text-xs font-medium text-white/80">
              {formatDateIndonesian()}
            </p>
          </div>
        </div>

        {showRoleButton && !onBack && !action && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-10 shrink-0 rounded-full bg-white/20 text-white hover:bg-white/30"
            onClick={() => setIsRoleSheetOpen(true)}
          >
            <UserSquare2 className="size-5" />
          </Button>
        )}
      </div>

      {bottom && (
        <div className="relative z-10 mx-auto mt-4 max-w-md">
          {bottom}
        </div>
      )}

      <RoleSwitcherSheet open={isRoleSheetOpen} onOpenChange={setIsRoleSheetOpen} />
    </header>
  );
}
