import type { ElementType, ReactNode } from "react";
import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

export interface RoleBottomNavItem {
  to: string;
  label: string;
  icon: ElementType;
  end?: boolean;
}

interface RoleBottomNavProps {
  items: RoleBottomNavItem[];
  centerAction?: ReactNode;
  centerSpacer?: boolean;
  className?: string;
  contentClassName?: string;
  itemClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  iconWrapClassName?: string;
  activeIconWrapClassName?: string;
}

export function RoleBottomNav({
  items,
  centerAction,
  centerSpacer = false,
  className,
  contentClassName,
  itemClassName,
  activeClassName,
  inactiveClassName,
  iconWrapClassName,
  activeIconWrapClassName,
}: RoleBottomNavProps) {
  const columnCount = centerSpacer ? 3 : items.length;

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-slate-100 bg-white/95 px-5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur",
        className,
      )}
    >
      {centerAction}
      <div
        className={cn("grid min-h-14 items-center", contentClassName)}
        style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          const shouldRenderSpacer = centerSpacer && index === Math.ceil(items.length / 2);

          return (
            <div key={item.to} className="contents">
              {shouldRenderSpacer ? <div className="w-24" /> : null}
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex min-w-0 w-[84px] justify-self-center flex-col items-center gap-1 rounded-2xl px-3 py-1.5 text-[11px] font-medium transition active:scale-95",
                    isActive ? activeClassName ?? "bg-[#EFF6FF] text-[#288DE5]" : inactiveClassName ?? "text-slate-400 hover:text-blue-500",
                    itemClassName,
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn("flex items-center justify-center", iconWrapClassName, isActive && activeIconWrapClassName)}>
                      <Icon className="size-5" />
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
