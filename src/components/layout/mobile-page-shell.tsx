import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function MobilePageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto min-h-svh w-full max-w-md bg-[#EFF6FF]", className)}>{children}</div>;
}
