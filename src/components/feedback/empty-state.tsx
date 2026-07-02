interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center shadow-sm">
      <p className="text-sm font-bold text-slate-800">{title}</p>
      {description ? <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">{description}</p> : null}
    </div>
  );
}
