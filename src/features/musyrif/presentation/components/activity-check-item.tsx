import type { MutabaahItem } from "../../domain/musyrif-types";
import { Textarea } from "@/components/ui/textarea";

export function ActivityCheckItem({
  item,
  note,
  onChange,
  onNoteChange,
}: {
  item: MutabaahItem;
  note?: string;
  onChange: (checked: boolean) => void;
  onNoteChange?: (value: string) => void;
}) {
  return (
    <div className="rounded-[20px] border border-slate-100/50 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-4">
        <button
          type="button"
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
        </button>
        <div className="flex-1 space-y-1.5">
          <span className="block text-sm font-extrabold leading-snug text-slate-800">{item.name}</span>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-600">{item.kategori || "Aktivitas"}</span>
            <span className="text-[11px] font-bold text-slate-400">Skor: {item.skor}</span>
          </div>
        </div>
      </div>
      {!item.dilaksanakan && onNoteChange ? (
        <div className="mt-3 space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-400">Catatan</label>
          <Textarea
            value={note ?? ""}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Tuliskan catatan jika ada..."
            className="min-h-[72px] resize-none rounded-2xl border-slate-200 text-sm focus-visible:ring-blue-500"
          />
        </div>
      ) : null}
    </div>
  );
}
