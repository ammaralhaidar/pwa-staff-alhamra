import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Info, Loader2, Send, Save, AlertTriangle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { resolveStoredRoleFlags } from "@/lib/storage";
import { useCreatePengumuman, usePengumumanDetail, usePengumumanList } from "../../application/pengumuman-queries";
import type { PengumumanFormData, PengumumanKategori, PengumumanState, PengumumanTarget } from "../../domain/pengumuman-types";
import { PengumumanHeader } from "../components/pengumuman-header";
import { RichPengumumanEditor } from "../components/rich-pengumuman-editor";
import { whatsappToHtml, htmlToWhatsapp } from "../utils/whatsapp-format";

export function PengumumanFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const editId = id ? Number(id) : undefined;
  const isEditMode = Boolean(editId && !isNaN(editId));

  const createMutation = useCreatePengumuman();
  const detailQuery = usePengumumanDetail(editId || 0);
  const listQuery = usePengumumanList();

  const userRoles = useMemo(() => resolveStoredRoleFlags(), []);
  const isManager = Boolean(userRoles?.is_pengumuman_manager || userRoles?.is_manajer_kesantrian);

  const [name, setName] = useState("");
  const [kategori, setKategori] = useState<PengumumanKategori>("umum");
  const [targetAudience, setTargetAudience] = useState<PengumumanTarget>("ortu");
  const [isPinned, setIsPinned] = useState(false);
  const [deskripsi, setDeskripsi] = useState("");
  const [coverImageBase64, setCoverImageBase64] = useState<string | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [prefilled, setPrefilled] = useState(false);

  // Pre-fill data when editing
  useEffect(() => {
    if (isEditMode && detailQuery.data && !prefilled) {
      const d = detailQuery.data;
      setName(d.title || "");
      setKategori(d.kategori || "umum");
      setTargetAudience(d.targetAudience || "ortu");
      setIsPinned(Boolean(d.isPinned));
      setDeskripsi(htmlToWhatsapp(d.deskripsi || ""));
      if (d.coverImageUrl) {
        setImagePreview(d.coverImageUrl);
      }
      setPrefilled(true);
    }
  }, [isEditMode, detailQuery.data, prefilled]);

  // Count active pinned announcements in database (excluding the current one being edited)
  const activePinnedCount = useMemo(() => {
    if (!listQuery.data) return 0;
    return listQuery.data.filter(
      (item) => item.isPinned && item.state === "published" && item.id !== editId
    ).length;
  }, [listQuery.data, editId]);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran file gambar maksimal 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(",")[1];
      setCoverImageBase64(base64Data);
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(targetState: PengumumanState) {
    if (!name.trim()) {
      setErrorMsg("Judul pengumuman wajib diisi!");
      return;
    }

    setErrorMsg("");

    const payload: PengumumanFormData = {
      ...(editId ? { id: editId } : {}),
      name: name.trim(),
      kategori,
      target_audience: targetAudience,
      deskripsi: whatsappToHtml(deskripsi.trim()),
      is_pinned: isPinned,
      state: targetState,
      ...(coverImageBase64 ? { cover_image: coverImageBase64 } : {}),
    };


    try {
      const res = await createMutation.mutateAsync(payload);
      const targetId = res.id || editId;
      if (targetId) {
        navigate(`/pengumuman/${targetId}`, { replace: true });
      } else {
        navigate("/pengumuman", { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan pengumuman");
    }
  }

  return (
    <main className="mx-auto w-full max-w-[430px] min-h-svh bg-[#f8fbff] text-slate-900 pb-16 font-sans overflow-x-hidden">
      <PengumumanHeader
        title={isEditMode ? "Edit Pengumuman" : "Buat Pengumuman"}
        subtitle={isEditMode ? "Perbarui Artikel / Informasi" : "Tulis Artikel / Informasi Baru"}
        onBack={() => (editId ? navigate(`/pengumuman/${editId}`) : navigate("/pengumuman"))}
        backLayout="stacked"
        showRoleButton={true}
      />

      <section className="w-full flex flex-col gap-4 px-4 py-5">
        {errorMsg && (
          <div className="w-full rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {errorMsg}
          </div>
        )}

        {!isManager && (
          <Card className="w-full border-amber-200 bg-amber-50/80 p-3 flex items-start gap-2.5 text-xs text-amber-800 rounded-2xl">
            <Info className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <p>
              Sebagai <strong>Staff</strong>, pengumuman yang Anda buat akan disimpan dalam status <strong>Draft</strong> untuk diperiksa dan dipublikasikan oleh Manajer.
            </p>
          </Card>
        )}

        <Card className="w-full border border-slate-200/80 bg-white p-5 space-y-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)] rounded-2xl">
          {/* Judul Pengumuman */}
          <div className="w-full space-y-1.5">
            <Label htmlFor="title" className="text-xs font-bold text-slate-700">
              Judul Pengumuman <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Contoh: Jadwal Penjemputan Santri Libur Semester..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border-slate-200 font-medium rounded-xl text-sm"
            />
          </div>

          {/* Grid Kategori & Sasaran Pembaca */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {/* Kategori Pengumuman */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Kategori</Label>
              <Select value={kategori} onValueChange={(val) => setKategori(val as PengumumanKategori)}>
                <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl text-xs font-medium">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="umum">Umum</SelectItem>
                  <SelectItem value="kesantrian">Kesantrian</SelectItem>
                  <SelectItem value="akademik">Akademik</SelectItem>
                  <SelectItem value="keuangan">Keuangan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sasaran Pembaca (Target Audience) */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Sasaran Pembaca</Label>
              <Select value={targetAudience} onValueChange={(val) => setTargetAudience(val as PengumumanTarget)}>
                <SelectTrigger className="w-full bg-white border-slate-200 rounded-xl text-xs font-medium">
                  <SelectValue placeholder="Pilih Sasaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua</SelectItem>
                  <SelectItem value="calon_ortu">Calon Santri</SelectItem>
                  <SelectItem value="ortu">Santri Aktif</SelectItem>
                </SelectContent>

              </Select>
            </div>
          </div>

          {/* Switch Highlight / Pinned */}
          <div className="border-t border-b border-slate-100 py-3 w-full space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-bold text-slate-800">📌 Pengumuman Penting</Label>
                <p className="text-[11px] text-slate-500">Sematkan di bagian atas daftar (Maksimal 2 pengumuman aktif)</p>
              </div>
              <Switch checked={isPinned} onCheckedChange={setIsPinned} />
            </div>

            {/* Dynamic Alert if Pinned Quota is Reached */}
            {isPinned && activePinnedCount >= 2 && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-2.5 flex items-start gap-2 text-[11px] text-amber-800">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <p>
                  <strong>Perhatian Kuota Sematan:</strong> Saat ini sudah terdapat <strong>{activePinnedCount} pengumuman penting</strong> yang aktif dipublikasikan. Menyematkan pengumuman ini akan menggantikan salah satu sematan sebelumnya saat dipublikasikan.
                </p>
              </div>
            )}
          </div>

          {/* Upload Cover Image */}
          <div className="space-y-1.5 w-full">
            <Label className="text-xs font-bold text-slate-700">Gambar Sampul / Banner (Opsional)</Label>
            {imagePreview ? (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 w-full">
                <img src={imagePreview} alt="Cover Preview" className="h-40 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImageBase64(undefined);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs text-white"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-28 w-full border-2 border-dashed border-slate-200 rounded-xl cursor-pointer bg-slate-50/70 hover:bg-slate-100 transition">
                <ImageIcon className="h-6 w-6 text-slate-400 mb-1" />
                <span className="text-xs text-slate-600 font-semibold">Upload Gambar (Max 5MB)</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Isi Pengumuman / Artikel (Rich Editor) */}
          <div className="space-y-1.5 w-full">
            <Label htmlFor="content" className="text-xs font-bold text-slate-700">
              Isi Pengumuman / Artikel
            </Label>
            <RichPengumumanEditor
              value={deskripsi}
              onChange={setDeskripsi}
              placeholder="Tuliskan isi pengumuman secara lengkap di sini... Tekan '/' untuk memunculkan format teks otomatis."
            />
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {isManager ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={createMutation.isPending}
                onClick={() => handleSubmit("draft")}
                className="h-12 border-slate-300 font-semibold text-slate-700 rounded-xl"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                {isEditMode ? "Simpan Draf" : "Simpan Draf"}
              </Button>
              <Button
                type="button"
                disabled={createMutation.isPending}
                onClick={() => handleSubmit("published")}
                className="h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md rounded-xl"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="mr-1.5 h-4 w-4" />}
                {isEditMode ? "Simpan & Terbitkan" : "Publikasikan"}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              disabled={createMutation.isPending}
              onClick={() => handleSubmit("draft")}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md rounded-xl"
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              {isEditMode ? "Simpan Perubahan Draf" : "Simpan Draf Pengumuman"}
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
