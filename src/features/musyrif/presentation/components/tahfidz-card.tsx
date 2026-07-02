import { Card } from "@/components/ui/card";
import type { TahfidzMusyrif } from "../../domain/musyrif-types";

export function TahfidzCard({ item }: { item: TahfidzMusyrif }) {
  const isMumtaz = item.nilai?.toLowerCase() === "mumtaz" || item.nilai?.toLowerCase() === "a";
  const displayNilai = isMumtaz ? "Mumtaz" : (item.nilai || "Jayyid");

  // Format date if needed
  const dateParts = item.tanggal ? item.tanggal.split("-") : [];
  const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : item.tanggal;

  // Clean ayat initial / final values (remove 'Ayat' text prefix if any)
  const cleanAyat = (val?: string) => val ? val.replace(/Ayat\s+/i, "") : "-";
  const startAyat = cleanAyat(item.ayatAwal);
  const endAyat = cleanAyat(item.ayatAkhir);

  return (
    <Card className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition text-left flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-slate-50 pb-3">
        <h3 className="text-[16px] font-extrabold text-slate-800 leading-snug">
          {formattedDate || "-"}
        </h3>
        <span className="rounded-full bg-emerald-50 border border-emerald-100/50 px-3 py-0.5 text-[11px] font-extrabold text-emerald-600">
          Selesai
        </span>
      </div>

      <div className="space-y-3 text-[13px] font-medium text-slate-500">
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Surah:</span>
          <span className="font-bold text-slate-700">{item.surahName || "-"}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Ayat:</span>
          <span className="font-bold text-slate-700">
            {startAyat} - {endAyat}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Nilai:</span>
          <span className={`rounded-full px-3 py-0.5 text-[11px] font-extrabold ${
            isMumtaz 
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100/50" 
              : "bg-blue-50 text-blue-600 border border-blue-100/50"
          }`}>
            {displayNilai}
          </span>
        </div>
      </div>
    </Card>
  );
}
