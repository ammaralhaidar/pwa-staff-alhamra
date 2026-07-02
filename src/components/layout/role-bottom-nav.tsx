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
  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] border-t border-blue-100 bg-white/95 px-8 py-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur",
        className,
      )}
    >
      {centerAction}
      <div className={cn("flex items-center justify-between", contentClassName)}>
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
                    "flex min-w-24 flex-col items-center gap-1 rounded-2xl px-5 py-2 text-xs font-semibold transition",
                    isActive ? activeClassName ?? "bg-blue-50 text-blue-600" : inactiveClassName ?? "text-slate-400 hover:text-blue-500",
                    itemClassName,
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn(iconWrapClassName, isActive && activeIconWrapClassName)}>
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
