import { useState, useMemo } from "react";
import { BookOpen, ChevronDown, Check, Search, Users } from "lucide-react";
import type { Halaqoh } from "../../domain/guru-quran-types";

interface HalaqohSelectorProps {
  halaqohList: Halaqoh[];
  selectedHalaqohId?: number | null;
  onSelectHalaqoh: (halaqoh: Halaqoh) => void;
}

export function HalaqohSelector({
  halaqohList,
  selectedHalaqohId,
  onSelectHalaqoh,
}: HalaqohSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const activeHalaqoh = useMemo(() => {
    return halaqohList.find((h) => h.id === selectedHalaqohId) ?? halaqohList[0];
  }, [halaqohList, selectedHalaqohId]);

  const filteredHalaqoh = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return halaqohList;
    return halaqohList.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        (h.penanggungJawab?.name && h.penanggungJawab.name.toLowerCase().includes(q)),
    );
  }, [halaqohList, search]);

  if (!halaqohList || halaqohList.length === 0) {
    return null;
  }

  // Jika ustadz hanya memiliki 1 halaqoh, tampilkan banner info rapi tanpa tombol dropdown
  if (halaqohList.length === 1) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-sky-100 bg-white p-3.5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#288DE5]">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">{activeHalaqoh.name}</p>
            <p className="truncate text-xs font-medium text-slate-500">
              {activeHalaqoh.penanggungJawab?.name ? `PJ: ${activeHalaqoh.penanggungJawab.name}` : "Halaqoh Qur'an"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <span>{activeHalaqoh.jumlahSiswa ?? activeHalaqoh.siswa?.length ?? 0}</span>
        </div>
      </div>
    );
  }

  // Jika ustadz / manajer memiliki lebih dari 1 halaqoh, tampilkan selector interaktif
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-2xl border border-sky-100 bg-white p-3.5 text-left shadow-sm transition active:scale-[0.99] hover:border-sky-200"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#288DE5]">
            <BookOpen className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#288DE5]">
                Halaqoh Aktif
              </span>
              <span className="flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                <Users className="h-3 w-3" />
                {activeHalaqoh.jumlahSiswa ?? activeHalaqoh.siswa?.length ?? 0} Santri
              </span>
            </div>
            <p className="truncate text-sm font-bold text-slate-800">
              {activeHalaqoh.name}
            </p>
            {activeHalaqoh.penanggungJawab?.name && (
              <p className="truncate text-xs font-medium text-slate-500">
                PJ: {activeHalaqoh.penanggungJawab.name}
              </p>
            )}
          </div>
        </div>
        <div className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={() => {
              setOpen(false);
              setSearch("");
            }}
          />
          <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl animate-in fade-in-0 zoom-in-95 duration-150">
            {halaqohList.length > 5 && (
              <div className="border-b border-slate-100 p-2.5">
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari halaqoh atau ustadz..."
                    className="w-full bg-transparent text-slate-800 placeholder-slate-400 outline-none"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto p-1.5 divide-y divide-slate-50">
              {filteredHalaqoh.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Tidak ada halaqoh yang cocok
                </div>
              ) : (
                filteredHalaqoh.map((h) => {
                  const isSelected = h.id === activeHalaqoh.id;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => {
                        onSelectHalaqoh(h);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition ${
                        isSelected
                          ? "bg-sky-50/80 font-bold text-[#288DE5]"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm ${isSelected ? "font-bold text-[#288DE5]" : "font-semibold"}`}>
                          {h.name}
                        </p>
                        <p className="truncate text-xs font-normal text-slate-400">
                          {h.penanggungJawab?.name ? `PJ: ${h.penanggungJawab.name}` : "Halaqoh Qur'an"} • {h.jumlahSiswa ?? h.siswa?.length ?? 0} Santri
                        </p>
                      </div>
                      {isSelected && (
                        <div className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#288DE5] text-white">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
