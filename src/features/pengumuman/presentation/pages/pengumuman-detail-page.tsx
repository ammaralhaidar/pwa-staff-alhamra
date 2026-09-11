import { useMemo } from "react";
import { Calendar, CheckCircle2, Loader2, Pin, RefreshCw, Send, User, Pencil, ShieldCheck, Clock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { resolveStoredRoleFlags } from "@/lib/storage";
import { usePengumumanDetail, usePublishPengumuman } from "../../application/pengumuman-queries";
import { PengumumanHeader } from "../components/pengumuman-header";

const kategoriColorMap: Record<string, string> = {
  kesantrian: "bg-amber-50 text-amber-800 border-amber-200",
  akademik: "bg-blue-50 text-blue-800 border-blue-200",
  keuangan: "bg-emerald-50 text-emerald-800 border-emerald-200",
  umum: "bg-slate-100 text-slate-800 border-slate-200",
};

export function PengumumanDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const pengumumanId = Number(id);
  const query = usePengumumanDetail(pengumumanId);
  const publishMutation = usePublishPengumuman();

  const userRoles = useMemo(() => resolveStoredRoleFlags(), []);
  const isManager = Boolean(userRoles?.is_pengumuman_manager || userRoles?.is_manajer_kesantrian);
  const canEdit = Boolean(
    userRoles?.can_manage_pengumuman ||
      userRoles?.is_pengumuman_staff ||
      userRoles?.is_pengumuman_manager ||
      userRoles?.is_manajer_kesantrian
  );

  const item = query.data;
  const badgeColor = item ? kategoriColorMap[item.kategori] || kategoriColorMap.umum : "";

  const formattedPublishDate = item?.tanggal
    ? new Date(item.tanggal).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    : null;

  const formattedCreateDate = item?.tanggalBuat
    ? new Date(item.tanggalBuat).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB"
    : null;

  async function handlePublish() {
    if (!pengumumanId) return;
    try {
      await publishMutation.mutateAsync(pengumumanId);
      query.refetch();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[430px] min-h-svh bg-[#f8fbff] text-slate-900 pb-20 font-sans overflow-x-hidden">
      <PengumumanHeader
        title="Detail Pengumuman"
        subtitle="Pratinjau & Kelola Artikel"
        onBack={() => navigate("/pengumuman")}
        backLayout="stacked"
        showRoleButton={true}
      />

      <section className="w-full flex flex-col gap-4 px-4 py-5">
        {query.isLoading ? (
          <div className="space-y-4 w-full">
            <Skeleton className="h-48 w-full rounded-2xl bg-slate-200/70" />
            <Skeleton className="h-8 w-3/4 bg-slate-200/70" />
            <Skeleton className="h-32 w-full bg-slate-200/70" />
          </div>
        ) : query.isError || !item ? (
          <div className="w-full rounded-2xl border border-red-200 bg-red-50/80 p-6 text-center shadow-sm">
            <p className="text-sm font-semibold text-red-700">Pengumuman tidak ditemukan.</p>
            <Button variant="outline" size="sm" onClick={() => query.refetch()} className="mt-3 border-red-200 text-red-700 rounded-xl">
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Coba Lagi
            </Button>
          </div>
        ) : (
          <div className="space-y-4 w-full">
            <Card className="w-full overflow-hidden border border-slate-200/80 bg-white p-5 space-y-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] rounded-2xl">
              {item.coverImageUrl && (
                <div className="-mx-5 -mt-5 mb-3 overflow-hidden border-b border-slate-100">
                  <img src={item.coverImageUrl} alt={item.title} className="h-52 w-full object-cover" />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-semibold ${badgeColor}`}>
                  {item.kategoriLabel}
                </Badge>
                {item.targetAudienceLabel && (
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-semibold bg-slate-50 text-slate-700 border-slate-200">
                    🎯 {item.targetAudienceLabel}
                  </Badge>
                )}
                {item.state && (
                  <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-semibold ${item.state === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-sky-50 text-sky-700 border-sky-200"}`}>
                    {item.state === "published" ? "Dipublikasikan" : "Draf"}
                  </Badge>
                )}
                {item.isPinned && (
                  <Badge className="bg-amber-500 text-white text-xs px-2.5 py-0.5 font-semibold flex items-center gap-1">
                    <Pin className="h-3 w-3 fill-white" />
                    Highlight
                  </Badge>
                )}
              </div>

              <h1 className="text-lg font-bold text-slate-900 leading-snug">{item.title}</h1>

              {/* Info Penulis & Penerbit */}
              <div className="flex flex-col gap-1.5 text-xs text-slate-600 bg-slate-50/80 border border-slate-100 p-3 rounded-xl">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Penulis Draf:
                  </span>
                  <span className="font-semibold text-slate-800">{item.authorName}</span>
                </div>

                {formattedCreateDate && (
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Dibuat pada:
                    </span>
                    <span>{formattedCreateDate}</span>
                  </div>
                )}

                {item.publisherName && (
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60 mt-0.5">
                    <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Diterbitkan oleh:
                    </span>
                    <span className="font-bold text-emerald-800">{item.publisherName}</span>
                  </div>
                )}

                {formattedPublishDate && (
                  <div className="flex items-center justify-between gap-2 text-[11px] text-emerald-600">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      Tanggal Terbit:
                    </span>
                    <span className="font-medium">{formattedPublishDate}</span>
                  </div>
                )}
              </div>

              {/* Isi Konten HTML */}
              <div
                className="prose prose-sm max-w-none text-slate-700 leading-relaxed font-normal pt-1 break-words"
                dangerouslySetInnerHTML={{ __html: item.deskripsi || "<p class='text-slate-400 italic'>Tidak ada isi deskripsi pengumuman.</p>" }}
              />
            </Card>

            {/* Action Buttons: Edit & Publish */}
            <div className="w-full space-y-2 pt-1">
              {canEdit && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/pengumuman/${item.id}/edit`)}
                  className="w-full h-12 border-slate-300 bg-white hover:bg-slate-50 font-semibold text-slate-800 rounded-xl flex items-center justify-center gap-2 shadow-xs"
                >
                  <Pencil className="h-4 w-4 text-slate-600" />
                  Edit Pengumuman
                </Button>
              )}

              {item.state === "draft" && (
                <div>
                  {isManager ? (
                    <Button
                      type="button"
                      disabled={publishMutation.isPending}
                      onClick={handlePublish}
                      className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md rounded-xl flex items-center justify-center gap-2"
                    >
                      {publishMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Publikasikan Pengumuman Ini
                    </Button>
                  ) : (
                    <Card className="border-sky-200 bg-sky-50/80 p-3.5 flex items-center gap-2.5 text-xs text-sky-800 rounded-xl">
                      <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                      <p>Status artikel ini adalah <strong>Draf</strong>. Menunggu pemeriksaan dan publikasi oleh Manajer.</p>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
