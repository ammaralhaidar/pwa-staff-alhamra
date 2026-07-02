import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackAyat, fallbackSurah, fallbackTahfidzOptions } from "../../application/musyrif-fallback-data";
import { useCreateTahfidzMusyrif, useMusyrifPegawai, useTahfidzAyat, useTahfidzNilai, useTahfidzSesi, useTahfidzSurah } from "../../application/musyrif-queries";
import { validateTahfidzPayload } from "../../application/musyrif-schemas";
import { MusyrifHeader } from "../components/musyrif-header";

export function TahfidzFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tanggal: "",
    sesi_id: "",
    ustadz_id: "",
    surah_id: "",
    ayat_awal_id: "",
    ayat_akhir_id: "",
    nilai_id: "",
    jml_baris: "",
    keterangan: "",
  });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const sesiQuery = useTahfidzSesi();
  const surahQuery = useTahfidzSurah();
  const ayatQuery = useTahfidzAyat(Number(form.surah_id));
  const nilaiQuery = useTahfidzNilai();
  const pegawaiQuery = useMusyrifPegawai();
  const createMutation = useCreateTahfidzMusyrif();

  const isSesiFallbackMode = sesiQuery.isError && isDemoFallbackEnabled();
  const isSurahFallbackMode = surahQuery.isError && isDemoFallbackEnabled();
  const isAyatFallbackMode = ayatQuery.isError && isDemoFallbackEnabled();
  const isNilaiFallbackMode = nilaiQuery.isError && isDemoFallbackEnabled();
  const isPegawaiFallbackMode = pegawaiQuery.isError && isDemoFallbackEnabled();
  const sesi = sesiQuery.data ?? (isSesiFallbackMode ? fallbackTahfidzOptions : []);
  const surah = surahQuery.data ?? (isSurahFallbackMode ? fallbackSurah : []);
  const ayat = ayatQuery.data ?? (isAyatFallbackMode ? fallbackAyat : []);
  const nilai = nilaiQuery.data ?? (isNilaiFallbackMode ? fallbackTahfidzOptions : []);
  const pegawai = pegawaiQuery.data ?? (isPegawaiFallbackMode ? fallbackTahfidzOptions.map((item) => ({ ...item, name: item.id === 1 ? "Ustadz Abdullah" : "Ustadz Ahmad" })) : []);
  const isUsingFallback = isSesiFallbackMode || isSurahFallbackMode || isAyatFallbackMode || isNilaiFallbackMode || isPegawaiFallbackMode;
  const selectedAyatAwal = ayat.find((item) => String(item.id) === form.ayat_awal_id);
  const selectedAyatAkhir = ayat.find((item) => String(item.id) === form.ayat_akhir_id);

  const submit = () => {
    if (isUsingFallback) {
      toast.error("Data contoh tidak bisa dipakai untuk submit tahfidz.");
      return;
    }
    const payload = {
      tanggal: form.tanggal,
      sesi_id: Number(form.sesi_id),
      ustadz_id: Number(form.ustadz_id),
      surah_id: Number(form.surah_id),
      ayat_awal_id: Number(form.ayat_awal_id),
      ayat_akhir_id: Number(form.ayat_akhir_id),
      nilai_id: Number(form.nilai_id),
      jml_baris: form.jml_baris ? Number(form.jml_baris) : undefined,
      keterangan: form.keterangan,
    };
    const error = validateTahfidzPayload(payload);
    if (error) {
      toast.error(error);
      return;
    }
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Tahfidz berhasil disimpan.");
        navigate("/musyrif/data/tahfidz");
      },
      onError: () => toast.error("Gagal menyimpan tahfidz."),
    });
  };

  return (
    <div className="relative mx-auto flex h-svh max-w-[430px] flex-col bg-[#EFF6FF]">
      <div className="shrink-0 z-40">
        <MusyrifHeader
          title="Tambah Tahfidz"
          subtitle="Input setoran tahfidz pribadi"
          onBack={() => navigate("/musyrif/data/tahfidz")}
        />
      </div>
      <div className="flex-1 overflow-y-auto pb-24">
        <section className="space-y-4 px-4 py-4">
          {/* Card 1: Data Setoran & Sesi */}
          <Card className="rounded-[22px] border-0 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-[15px] text-slate-800 border-b border-slate-100 pb-2">Informasi Umum</h3>
            {isUsingFallback ? (
              <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold leading-relaxed text-amber-700">
                Sebagian data contoh ditampilkan karena API belum tersedia. Submit dinonaktifkan.
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">TANGGAL SETORAN</label>
              <Input type="date" value={form.tanggal} onChange={(event) => update("tanggal", event.target.value)} className="rounded-xl border-slate-100 bg-slate-50/50 h-11" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">PILIH SESI</label>
              <Select value={form.sesi_id} onValueChange={(value) => update("sesi_id", value)}>
                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50/50 h-11"><SelectValue placeholder="Pilih sesi" /></SelectTrigger>
                <SelectContent>{sesi.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">USTADZ / PENGUJI</label>
              <Select value={form.ustadz_id} onValueChange={(value) => update("ustadz_id", value)}>
                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50/50 h-11"><SelectValue placeholder="Pilih ustadz" /></SelectTrigger>
                <SelectContent>{pegawai.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </Card>

          {/* Card 2: Setoran Tahfidz */}
          <Card className="rounded-[22px] border-0 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-[15px] text-slate-800 border-b border-slate-100 pb-2">Setoran Hafalan</h3>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">PILIH SURAH</label>
              <Select value={form.surah_id} onValueChange={(value) => {
                update("surah_id", value);
                update("ayat_awal_id", "");
                update("ayat_akhir_id", "");
              }}>
                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50/50 h-11"><SelectValue placeholder="Pilih surah" /></SelectTrigger>
                <SelectContent>{surah.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400">AYAT AWAL</label>
                <Select value={form.ayat_awal_id} onValueChange={(value) => update("ayat_awal_id", value)}>
                  <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50/50 h-11"><SelectValue placeholder="Ayat awal" /></SelectTrigger>
                  <SelectContent>{ayat.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400">AYAT AKHIR</label>
                <Select value={form.ayat_akhir_id} onValueChange={(value) => update("ayat_akhir_id", value)}>
                  <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50/50 h-11"><SelectValue placeholder="Ayat akhir" /></SelectTrigger>
                  <SelectContent>{ayat.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400">HALAMAN AWAL</label>
                <Input readOnly value={selectedAyatAwal?.halaman ?? ""} placeholder="Auto" className="rounded-xl border-slate-100 bg-slate-100 h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400">HALAMAN AKHIR</label>
                <Input readOnly value={selectedAyatAkhir?.halaman ?? ""} placeholder="Auto" className="rounded-xl border-slate-100 bg-slate-100 h-11" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">NILAI / PRESTASI</label>
              <Select value={form.nilai_id} onValueChange={(value) => update("nilai_id", value)}>
                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50/50 h-11"><SelectValue placeholder="Pilih nilai kelulusan" /></SelectTrigger>
                <SelectContent>{nilai.map((item) => <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">JUMLAH BARIS (OPSIONAL)</label>
              <Input type="number" placeholder="Contoh: 12" value={form.jml_baris} onChange={(event) => update("jml_baris", event.target.value)} className="rounded-xl border-slate-100 bg-slate-50/50 h-11" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">KETERANGAN / CATATAN (OPSIONAL)</label>
              <Textarea placeholder="Masukkan keterangan tambahan jika ada..." value={form.keterangan} onChange={(event) => update("keterangan", event.target.value)} className="rounded-xl border-slate-100 bg-slate-50/50 min-h-[90px] resize-none" />
            </div>
          </Card>
        </section>
      </div>
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur z-30">
        <div className="mx-auto max-w-[430px]">
          <Button className="h-12 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-none border-0" disabled={createMutation.isPending || isUsingFallback} onClick={submit}>Selesai</Button>
        </div>
      </div>
    </div>
  );
}
