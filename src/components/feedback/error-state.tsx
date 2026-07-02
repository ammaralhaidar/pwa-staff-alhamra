interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Gagal memuat data", message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-3xl border border-red-100 bg-white px-5 py-6 text-center shadow-sm">
      <p className="text-sm font-bold text-slate-900">{title}</p>
      {message ? <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">{message}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white active:scale-[0.98]"
        >
          Coba lagi
        </button>
      ) : null}
    </div>
  );
}
