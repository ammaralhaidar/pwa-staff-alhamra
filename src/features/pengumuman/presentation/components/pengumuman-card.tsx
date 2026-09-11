import { Calendar, Pin, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Pengumuman } from "../../domain/pengumuman-types";

interface PengumumanCardProps {
  item: Pengumuman;
}

const kategoriColorMap: Record<string, string> = {
  kesantrian: "bg-amber-50 text-amber-800 border-amber-200",
  akademik: "bg-blue-50 text-blue-800 border-blue-200",
  keuangan: "bg-emerald-50 text-emerald-800 border-emerald-200",
  umum: "bg-slate-100 text-slate-800 border-slate-200",
};

export function PengumumanCard({ item }: PengumumanCardProps) {
  const badgeColor = kategoriColorMap[item.kategori] || kategoriColorMap.umum;
  const formattedDate = item.tanggal
    ? new Date(item.tanggal).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <Link to={`/pengumuman/${item.id}`} className="block transition active:scale-[0.99]">
      <Card className={`relative overflow-hidden border border-slate-200/80 bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] rounded-2xl hover:shadow-md transition duration-200 ${item.isPinned ? "ring-1.5 ring-amber-400/70" : ""}`}>
        {item.isPinned && (
          <div className="absolute top-0 right-0 rounded-bl-xl bg-amber-500 px-2.5 py-0.5 text-[11px] font-semibold text-white flex items-center gap-1 shadow-sm">
            <Pin className="h-3 w-3 fill-white" />
            Highlight
          </div>
        )}

        <div className="flex items-start gap-3.5">
          {item.coverImageUrl && (
            <img
              src={item.coverImageUrl}
              alt={item.title}
              className="h-16 w-16 shrink-0 rounded-xl object-cover border border-slate-100"
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <Badge variant="outline" className={`text-[11px] px-2 py-0.5 font-medium ${badgeColor}`}>
                {item.kategoriLabel}
              </Badge>
              {item.state && (
                <Badge variant="outline" className={`text-[11px] px-2 py-0.5 font-medium ${item.state === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-sky-50 text-sky-700 border-sky-200"}`}>
                  {item.state === "published" ? "Dipublikasikan" : "Draf"}
                </Badge>
              )}
            </div>

            <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{item.title}</h3>

            {item.preview && (
              <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.preview}</p>
            )}

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1 truncate max-w-[120px]">
                <User className="h-3 w-3" />
                {item.authorName}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
