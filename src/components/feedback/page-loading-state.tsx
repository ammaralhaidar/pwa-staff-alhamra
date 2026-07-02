interface PageLoadingStateProps {
  label?: string;
}

export function PageLoadingState({ label = "Memuat data..." }: PageLoadingStateProps) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[#EFF6FF] px-6 text-center">
      <div className="rounded-3xl bg-white px-6 py-5 text-sm font-semibold text-[#344054] shadow-sm">
        {label}
      </div>
    </div>
  );
}
