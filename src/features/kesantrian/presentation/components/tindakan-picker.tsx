import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Gavel, Search } from "lucide-react";
import type { TindakanOption } from "../../domain/kesantrian-types";

type Props = {
  value?: number;
  options: TindakanOption[];
  disabled?: boolean;
  onChange: (id: number) => void;
};

export function TindakanPicker({ value, options, disabled, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = options.find((option) => option.id === value);
  const filteredOptions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return options;
    return options.filter((option) => option.name.toLowerCase().includes(keyword));
  }, [options, search]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSearch("");
          setOpen(true);
        }}
        disabled={disabled || options.length === 0}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-800 transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 disabled:text-slate-400"
      >
        <span className={`min-w-0 flex-1 ${selected ? "line-clamp-2" : "text-slate-400"}`}>{selected?.name ?? "Pilih tindakan"}</span>
        <Gavel className="size-4 shrink-0 text-slate-400" />
      </button>

      {open ? (
        <TindakanPickerOverlay
          search={search}
          items={filteredOptions}
          onSearchChange={setSearch}
          onClose={() => setOpen(false)}
          onSelect={(item) => {
            onChange(item.id);
            setOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

function TindakanPickerOverlay({
  search,
  items,
  onSearchChange,
  onClose,
  onSelect,
}: {
  search: string;
  items: TindakanOption[];
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onSelect: (item: TindakanOption) => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] bg-[#F8F8FC]">
      <div className="mx-auto flex h-svh w-full max-w-[430px] flex-col overflow-hidden bg-[#F8F8FC]">
        <header className="z-10 flex shrink-0 items-center gap-4 bg-white px-5 py-5 shadow-sm">
          <button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-full text-slate-900">
            <ChevronLeft className="size-6" />
          </button>
          <h2 className="text-xl font-semibold text-slate-950">Pilih Tindakan</h2>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          <div className="mb-5 flex h-11 items-center gap-3 rounded-[14px] border border-slate-200 bg-white px-4 shadow-sm">
            <Search className="size-4 shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Cari tindakan..."
              className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
              autoFocus
            />
          </div>

          {items.length === 0 ? (
            <div className="rounded-[20px] bg-white p-5 text-center text-sm font-semibold text-slate-500 shadow-sm">Tindakan tidak ditemukan.</div>
          ) : (
            <div className="space-y-3 pb-12">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className="flex w-full items-center gap-4 rounded-[20px] bg-white p-4 text-left shadow-[0_3px_12px_rgba(15,23,42,0.08)] transition active:scale-[0.99]"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Gavel className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium leading-relaxed text-slate-900">{item.name}</span>
                    <span className="mt-1 block text-xs font-medium text-slate-400">Tindakan hukuman</span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-slate-300" />
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
