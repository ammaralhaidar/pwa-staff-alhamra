import type { MutabaahItem } from "../../domain/musyrif-types";

export function ActivityCheckItem({ item, onChange }: { item: MutabaahItem; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-start gap-4 rounded-[20px] bg-white p-4 shadow-sm border border-slate-100/50 cursor-pointer select-none">
      <div 
        onClick={() => onChange(!item.dilaksanakan)}
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          item.dilaksanakan 
            ? "border-blue-500 bg-blue-500 text-white" 
            : "border-slate-200 bg-white"
        }`}
      >
        {item.dilaksanakan && (
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="flex-1 space-y-1.5">
        <span className="text-sm font-extrabold text-slate-800 leading-snug block">{item.name}</span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-600">{item.kategori || "Aktivitas"}</span>
          <span className="text-[11px] font-bold text-slate-400">Skor: {item.skor}</span>
        </div>
      </div>
    </label>
  );
}
