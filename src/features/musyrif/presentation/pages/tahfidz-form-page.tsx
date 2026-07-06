import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackAyat, fallbackSurah, fallbackTahfidzOptions } from "../../application/musyrif-fallback-data";
import {
  useCreateTahfidzMusyrif,
  useMusyrifPegawai,
  useTahfidzAyat,
  useTahfidzNilai,
  useTahfidzSesi,
  useTahfidzSurah,
} from "../../application/musyrif-queries";
import { validateTahfidzPayload } from "../../application/musyrif-schemas";
import type { TahfidzMasterOption } from "../../domain/musyrif-types";
import { MusyrifDatePicker } from "../components/musyrif-date-picker";
import { MusyrifHeader } from "../components/musyrif-header";
import type { SearchableOption } from "../components/searchable-option-picker";

type TahfidzFormState = {
  tanggal: string;
  sesi_id: string;
  ustadz_id: string;
  surah_id: string;
  surah_lanjutan_id: string;
  ayat_awal_id: string;
  ayat_akhir_id: string;
  nilai_id: string;
  keterangan: string;
};

type InlineOptionDropdownProps = {
  label?: string;
  value: string;
  placeholder: string;
  options: SearchableOption[];
  disabled?: boolean;
  emptyLabel?: string;
  onChange: (value: string) => void;
};

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function InlineOptionDropdown({
  label,
  value,
  placeholder,
  options,
  disabled,
  emptyLabel = "Data tidak ditemukan.",
  onChange,
}: InlineOptionDropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => options.find((option) => option.value === value), [options, value]);

  const selectOption = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className="space-y-1.5">
      {label ? <label className="block text-[11px] font-bold text-slate-400">{label}</label> : null}
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="h-11 w-full justify-between rounded-xl border-slate-200 bg-white px-3 text-left text-sm font-semibold text-slate-700 shadow-none hover:bg-white disabled:bg-slate-100 disabled:text-slate-400"
      >
        <span className="min-w-0 flex-1 truncate text-left">{selected?.label || placeholder}</span>
        <ChevronDown className={`ml-2 size-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </Button>

      {open && !disabled ? (
        <div className="mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.10)]">
          <div className="max-h-56 overflow-y-auto p-2">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectOption(option.value)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-blue-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800">{option.label}</p>
                    {option.subtitle ? <p className="truncate text-xs font-medium text-slate-400">{option.subtitle}</p> : null}
                  </div>
                  {option.badge ? <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600">{option.badge}</span> : null}
                  {isSelected ? <Check className="size-4 text-blue-600" /> : null}
                </button>
              );
            })}
            {!options.length ? (
              <div className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-400">
                {emptyLabel}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function toOptions(items: TahfidzMasterOption[], getSubtitle?: (item: TahfidzMasterOption) => string | undefined): SearchableOption[] {
  return items.map((item) => ({
    value: String(item.id),
    label: item.name,
    subtitle: getSubtitle?.(item),
  }));
}

function ayatOptions(items: TahfidzMasterOption[]): SearchableOption[] {
  return items.map((item) => ({
    value: String(item.id),
    label: item.ayat ? `Ayat ${item.ayat}` : item.name,
    subtitle: item.halaman ? `Halaman ${item.halaman}` : undefined,
  }));
}

export function TahfidzFormPage() {
  const navigate = useNavigate();
  const today = useMemo(() => formatDateInput(new Date()), []);
  const [lanjutSurah, setLanjutSurah] = useState(false);
  const [form, setForm] = useState<TahfidzFormState>({
    tanggal: today,
    sesi_id: "",
    ustadz_id: "",
    surah_id: "",
    surah_lanjutan_id: "",
    ayat_awal_id: "",
    ayat_akhir_id: "",
    nilai_id: "",
    keterangan: "",
  });

  const update = (key: keyof TahfidzFormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const sesiQuery = useTahfidzSesi();
  const surahQuery = useTahfidzSurah();
  const ayatAwalQuery = useTahfidzAyat(Number(form.surah_id));
  const ayatLanjutanQuery = useTahfidzAyat(Number(form.surah_lanjutan_id));
  const nilaiQuery = useTahfidzNilai();
  const pegawaiQuery = useMusyrifPegawai();
  const createMutation = useCreateTahfidzMusyrif();

  const isSesiFallbackMode = sesiQuery.isError && isDemoFallbackEnabled();
  const isSurahFallbackMode = surahQuery.isError && isDemoFallbackEnabled();
  const isAyatAwalFallbackMode = ayatAwalQuery.isError && isDemoFallbackEnabled();
  const isAyatLanjutanFallbackMode = ayatLanjutanQuery.isError && isDemoFallbackEnabled();
  const isNilaiFallbackMode = nilaiQuery.isError && isDemoFallbackEnabled();
  const isPegawaiFallbackMode = pegawaiQuery.isError && isDemoFallbackEnabled();

  const sesi = useMemo(() => sesiQuery.data ?? (isSesiFallbackMode ? fallbackTahfidzOptions : []), [isSesiFallbackMode, sesiQuery.data]);
  const surah = useMemo(() => surahQuery.data ?? (isSurahFallbackMode ? fallbackSurah : []), [isSurahFallbackMode, surahQuery.data]);
  const ayatAwal = useMemo(() => ayatAwalQuery.data ?? (isAyatAwalFallbackMode ? fallbackAyat : []), [ayatAwalQuery.data, isAyatAwalFallbackMode]);
  const ayatLanjutan = useMemo(() => ayatLanjutanQuery.data ?? (isAyatLanjutanFallbackMode ? fallbackAyat : []), [ayatLanjutanQuery.data, isAyatLanjutanFallbackMode]);
  const nilai = useMemo(() => nilaiQuery.data ?? (isNilaiFallbackMode ? fallbackTahfidzOptions : []), [isNilaiFallbackMode, nilaiQuery.data]);
  const pegawai = useMemo(
    () => pegawaiQuery.data ?? (isPegawaiFallbackMode ? fallbackTahfidzOptions.map((item) => ({ ...item, name: item.id === 1 ? "Ustadz Abdullah" : "Ustadz Ahmad" })) : []),
    [isPegawaiFallbackMode, pegawaiQuery.data],
  );
  const isUsingFallback =
    isSesiFallbackMode ||
    isSurahFallbackMode ||
    isAyatAwalFallbackMode ||
    isAyatLanjutanFallbackMode ||
    isNilaiFallbackMode ||
    isPegawaiFallbackMode;

  const selectedSurah = useMemo(() => surah.find((item) => String(item.id) === form.surah_id), [form.surah_id, surah]);
  const selectedSurahLanjutan = useMemo(
    () => surah.find((item) => String(item.id) === form.surah_lanjutan_id),
    [form.surah_lanjutan_id, surah],
  );
  const surahLanjutan = useMemo(
    () => surah.filter((item) => item.id > Number(form.surah_id || 0)),
    [form.surah_id, surah],
  );
  const ayatAkhirSource = lanjutSurah ? ayatLanjutan : ayatAwal;
  const effectiveAyatAwalId = form.ayat_awal_id || (form.surah_id && ayatAwal[0] ? String(ayatAwal[0].id) : "");
  const selectedAyatAwal = useMemo(
    () => ayatAwal.find((item) => String(item.id) === effectiveAyatAwalId),
    [ayatAwal, effectiveAyatAwalId],
  );
  const selectedAyatAkhir = useMemo(
    () => ayatAkhirSource.find((item) => String(item.id) === form.ayat_akhir_id),
    [ayatAkhirSource, form.ayat_akhir_id],
  );

  const sesiOptions = useMemo(() => toOptions(sesi), [sesi]);
  const pegawaiOptions = useMemo(() => toOptions(pegawai), [pegawai]);
  const surahOptions = useMemo(() => toOptions(surah, (item) => (item.ayat ? `Jumlah ayat: ${item.ayat}` : undefined)), [surah]);
  const surahLanjutanOptions = useMemo(
    () => toOptions(surahLanjutan, (item) => (item.ayat ? `Jumlah ayat: ${item.ayat}` : undefined)),
    [surahLanjutan],
  );
  const ayatAwalOptions = useMemo(() => ayatOptions(ayatAwal), [ayatAwal]);
  const ayatAkhirOptions = useMemo(() => ayatOptions(ayatAkhirSource), [ayatAkhirSource]);
  const nilaiOptions = useMemo(() => toOptions(nilai), [nilai]);

  const changeSurah = (value: string) => {
    setLanjutSurah(false);
    setForm((current) => ({
      ...current,
      surah_id: value,
      surah_lanjutan_id: "",
      ayat_awal_id: "",
      ayat_akhir_id: "",
    }));
  };

  const changeLanjutSurah = (checked: boolean) => {
    setLanjutSurah(checked);
    setForm((current) => {
      const nextSurah = surah.find((item) => item.id > Number(current.surah_id || 0));
      return {
        ...current,
        surah_lanjutan_id: checked ? String(nextSurah?.id ?? "") : "",
        ayat_akhir_id: "",
      };
    });
  };

  const changeSurahLanjutan = (value: string) => {
    setForm((current) => ({
      ...current,
      surah_lanjutan_id: value,
      ayat_akhir_id: "",
    }));
  };

  const submit = () => {
    if (isUsingFallback) {
      toast.error("Data contoh tidak bisa dipakai untuk submit tahfidz.");
      return;
    }
    if (lanjutSurah && !form.surah_lanjutan_id) {
      toast.error("Pilih surah lanjutan.");
      return;
    }
    if (!lanjutSurah && selectedAyatAwal?.ayat && selectedAyatAkhir?.ayat && selectedAyatAwal.ayat > selectedAyatAkhir.ayat) {
      toast.error("Ayat awal tidak boleh lebih besar dari ayat akhir.");
      return;
    }

    const payload = {
      tanggal: form.tanggal,
      sesi_id: Number(form.sesi_id),
      ustadz_id: Number(form.ustadz_id),
      surah_id: Number(form.surah_id),
      ayat_awal_id: Number(effectiveAyatAwalId),
      ayat_akhir_id: Number(form.ayat_akhir_id),
      nilai_id: Number(form.nilai_id),
      jml_baris: 0,
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
      <div className="z-40 shrink-0">
        <MusyrifHeader
          title="Tambah Tahfidz"
          subtitle="Input setoran tahfidz pribadi"
          onBack={() => navigate("/musyrif/data/tahfidz")}
        />
      </div>
      <div className="flex-1 overflow-y-auto pb-24">
        <section className="space-y-4 px-4 py-4">
          <Card className="space-y-4 rounded-[22px] border-0 bg-white p-5 shadow-sm">
            <h3 className="border-b border-slate-100 pb-2 text-[15px] font-extrabold text-slate-800">Informasi Umum</h3>
            {isUsingFallback ? (
              <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold leading-relaxed text-amber-700">
                Sebagian data contoh ditampilkan karena API belum tersedia. Submit dinonaktifkan.
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">TANGGAL SETORAN</label>
              <MusyrifDatePicker value={form.tanggal} min={today} onChange={(value) => update("tanggal", value)} />
            </div>

            <InlineOptionDropdown
              label="PILIH SESI"
              value={form.sesi_id}
              onChange={(value) => update("sesi_id", value)}
              placeholder="Pilih sesi"
              options={sesiOptions}
            />

            <InlineOptionDropdown
              label="USTADZ / PENGUJI"
              value={form.ustadz_id}
              onChange={(value) => update("ustadz_id", value)}
              placeholder="Pilih ustadz"
              options={pegawaiOptions}
            />
          </Card>

          <Card className="space-y-4 rounded-[22px] border-0 bg-white p-5 shadow-sm">
            <h3 className="border-b border-slate-100 pb-2 text-[15px] font-extrabold text-slate-800">Setoran Hafalan</h3>

            <InlineOptionDropdown
              label="PILIH SURAH"
              value={form.surah_id}
              onChange={changeSurah}
              placeholder="Pilih surah"
              options={surahOptions}
            />

            <div className="flex items-center justify-between gap-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-600">
                Jumlah Ayat: {selectedSurah?.ayat ?? "-"}
              </div>
              <label className="flex min-w-0 items-center gap-2 rounded-2xl bg-white px-2 py-2 text-sm font-bold text-slate-600">
                <Checkbox
                  checked={lanjutSurah}
                  disabled={!form.surah_id}
                  onCheckedChange={(checked) => changeLanjutSurah(Boolean(checked))}
                  className="size-5"
                />
                <span className="truncate">Lanjut Surah</span>
              </label>
            </div>

            {lanjutSurah ? (
              <InlineOptionDropdown
                label="SURAH LANJUTAN"
                value={form.surah_lanjutan_id}
                onChange={changeSurahLanjutan}
                placeholder="Pilih surah lanjutan"
                options={surahLanjutanOptions}
                disabled={!form.surah_id}
              />
            ) : null}

            <div className="rounded-[22px] border border-slate-100 bg-white p-4">
              <h4 className="border-b border-slate-100 pb-3 text-sm font-extrabold text-slate-800">Penilaian Tahfidz</h4>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <InlineOptionDropdown
                  label="AYAT AWAL"
                  value={effectiveAyatAwalId}
                  onChange={(value) => update("ayat_awal_id", value)}
                  placeholder="Ayat awal"
                  options={ayatAwalOptions}
                  disabled={!form.surah_id}
                />
                <InlineOptionDropdown
                  label={lanjutSurah && selectedSurahLanjutan ? `AYAT AKHIR (${selectedSurahLanjutan.name})` : "AYAT AKHIR"}
                  value={form.ayat_akhir_id}
                  onChange={(value) => update("ayat_akhir_id", value)}
                  placeholder="Ayat akhir"
                  options={ayatAkhirOptions}
                  disabled={lanjutSurah ? !form.surah_lanjutan_id : !form.surah_id}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">HALAMAN AWAL</label>
                  <Input readOnly value={selectedAyatAwal?.halaman ?? ""} placeholder="Auto" className="h-11 rounded-xl border-slate-100 bg-slate-100" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400">HALAMAN AKHIR</label>
                  <Input readOnly value={selectedAyatAkhir?.halaman ?? ""} placeholder="Auto" className="h-11 rounded-xl border-slate-100 bg-slate-100" />
                </div>
              </div>
            </div>

            <InlineOptionDropdown
              label="NILAI / PRESTASI"
              value={form.nilai_id}
              onChange={(value) => update("nilai_id", value)}
              placeholder="Pilih nilai kelulusan"
              options={nilaiOptions}
            />

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400">KETERANGAN / CATATAN (OPSIONAL)</label>
              <Textarea
                placeholder="Masukkan keterangan tambahan jika ada..."
                value={form.keterangan}
                onChange={(event) => update("keterangan", event.target.value)}
                className="min-h-[90px] resize-none rounded-xl border-slate-100 bg-slate-50/50"
              />
            </div>
          </Card>
        </section>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="mx-auto max-w-[430px]">
          <Button
            className="h-12 w-full rounded-xl border-0 bg-blue-600 text-xs font-bold text-white shadow-none hover:bg-blue-700"
            disabled={createMutation.isPending || isUsingFallback}
            onClick={submit}
          >
            Selesai
          </Button>
        </div>
      </div>
    </div>
  );
}
