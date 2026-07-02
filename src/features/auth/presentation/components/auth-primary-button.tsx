import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthPrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
};

export function AuthPrimaryButton({ children, isLoading, className, disabled, ...props }: AuthPrimaryButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-12 min-w-36 items-center justify-center gap-2 rounded-[20px] bg-alhamra-blue px-10 text-base font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70",
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}