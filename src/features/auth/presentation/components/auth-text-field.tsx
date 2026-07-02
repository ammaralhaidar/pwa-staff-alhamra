import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthTextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  rightSlot?: ReactNode;
};

export function AuthTextField({ label, error, rightSlot, className, id, ...props }: AuthTextFieldProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-2 block text-sm font-medium text-[#8a8a8a]">{label}</span>
      <span
        className={cn(
          "flex h-14 items-center rounded-lg border bg-white/95 px-4 shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition focus-within:border-alhamra-blue",
          error ? "border-red-400" : "border-alhamra-blue",
        )}
      >
        <input
          id={inputId}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#1f2937] outline-none placeholder:text-[#b7b7b7]",
            className,
          )}
          {...props}
        />
        {rightSlot}
      </span>
      {error ? <span className="mt-2 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}