import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addLocalTahfidzSession } from "../../application/guru-quran-storage";
import {
  useConfirmTahfidzAttendance,
  useCreateTahfidzAttendance,
  useHalaqohList,
  useSesiList,
  useUstadzList,
} from "../../application/guru-quran-queries";
import type { AttendancePresence, GuruQuranStudent, Halaqoh, Sesi, Ustadz } from "../../domain/guru-quran-types";
import { GuruQuranHeader } from "../components/guru-quran-header";

const KEHADIRAN_OPTIONS = ["Hadir", "Sakit", "Izin", "Alpa"] as const;

export function CreateTahfidzAttendancePage() {
  const navigate = useNavigate();
  const halaqohQuery = useHalaqohList();
  const sesiQuery = useSesiList();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedHalaqoh, setSelectedHalaqoh] = useState<Halaqoh | null>(null);
  const [selectedSesi, setSelectedSesi] = useState<Sesi | null>(null);
  const [selectedUstadz, setSelectedUstadz] = useState<Ustadz | null>(null);
  const [keterangan, setKeterangan] = useState("");
  const [attendanceMap, setAttendanceMap] = useState<Record<number, AttendancePresence>>({});

  const ustadzQuery = useUstadzList(selectedHalaqoh?.id);
  const createMutation = useCreateTahfidzAttendance();
  const confirmMutation = useConfirmTahfidzAttendance();

  const siswaList = selectedHalaqoh?.siswa ?? [];
  const ustadzOptions = useMemo(() => {
    const fromHalaqoh = selectedHalaqoh?.ustadz ?? [];
    return fromHalaqoh.length ? fromHalaqoh : ustadzQuery.data ?? [];
  }, [selectedHalaqoh?.ustadz, ustadzQuery.data]);

  function handleHalaqohSelect(halaqoh: Halaqoh) {
    const next: Record<number, AttendancePresence> = {};
    halaqoh.siswa.forEach((student) => {
      next[student.id] = "Hadir";
    });
    setSelectedHalaqoh(halaqoh);
    setAttendanceMap(next);
    setSelectedUstadz(halaqoh.ustadz[0] ?? null);
  }

  const isLoading = halaqohQuery.isLoading || sesiQuery.isLoading;
  const isSubmitting = createMutation.isPending || confirmMutation.isPending;

  function handleKehadiranChange(siswaId: number, value: AttendancePresence) {
    setAttendanceMap((current) => ({ ...current, [siswaId]: value }));
  }

  async function handleSubmit() {
    if (!selectedHalaqoh || !selectedSesi) {
      toast.error("Harap pilih Halaqoh dan Sesi");
      return;
    }
    if (siswaList.length === 0) {
      toast.error("Tidak ada siswa dalam halaqoh ini");
      return;
    }

    const ustadzId = selectedUstadz?.id ?? ustadzOptions[0]?.id;
    if (!ustadzId) {
      toast.error("Pilih ustadz terlebih dahulu");
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        halaqoh_id: selectedHalaqoh.id,
        ustadz_id: ustadzId,
        sesi_id: selectedSesi.id,
        tanggal: selectedDate,
        keterangan,
        absen_lines: siswaList.map((student) => ({
          siswa_id: student.id,
          kehadiran: attendanceMap[student.id] ?? "Hadir",
        })),
      });

      if (result.id > 0) {
        try {
          await confirmMutation.mutateAsync(result.id);
          if (result.data) addLocalTahfidzSession(result.data);
          toast.success("Absen Tahfidz berhasil disimpan & dikonfirmasi!");
        } catch {
          if (result.data) addLocalTahfidzSession(result.data);
          toast.warning("Absen tersimpan (Draft). Konfirmasi gagal.");
        }
      } else {
        toast.success("Absen Tahfidz berhasil disimpan.");
      }

      navigate("/guru-quran");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan absen");
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#EFF6FF]">
      <GuruQuranHeader title="Tambah Absen Tahfidz" onBack={() => navigate(-1)} />

      <main className="flex-1 px-5 pb-10 pt-5 flex flex-col gap-4">
        <div className="space-y-4 rounded-2xl border border-[#EAECF0] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <div>
            <FormLabel>Tanggal</FormLabel>
            <div className="flex items-center gap-3 rounded-xl border border-[#EAECF0] bg-[#FAFAFA] px-4 py-3">
              <Calendar className="h-5 w-5 text-[#98A2B3]" />
              <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="flex-1 bg-transparent text-sm font-semibold text-[#101828] outline-none" />
            </div>
          </div>

          <div>
            <FormLabel>Sesi</FormLabel>
            <DropdownSelect placeholder={isLoading ? "Memuat sesi..." : "Pilih Sesi"} value={selectedSesi?.name} options={sesiQuery.data ?? []} getLabel={(item) => item.name} onSelect={setSelectedSesi} />
          </div>

          <div>
            <FormLabel>Tahun Ajaran</FormLabel>
            <div className="rounded-xl border border-[#EAECF0] bg-[#F2F4F7] px-4 py-3">
              <p className="text-sm font-semibold text-[#667085]">{selectedHalaqoh?.tahunAjaran?.name ?? "-"}</p>
            </div>
          </div>

          <div>
            <FormLabel>Halaqoh</FormLabel>
            <DropdownSelect placeholder={isLoading ? "Memuat halaqoh..." : "Pilih Halaqoh"} value={selectedHalaqoh?.name} options={halaqohQuery.data ?? []} getLabel={(item) => item.name} onSelect={handleHalaqohSelect} />
          </div>

          <div>
            <FormLabel>Ustadz</FormLabel>
            <DropdownSelect placeholder="Pilih Ustadz" value={selectedUstadz?.name} options={ustadzOptions} getLabel={(item) => item.name} onSelect={setSelectedUstadz} />
          </div>

          <div>
            <FormLabel>Keterangan</FormLabel>
            <div className="rounded-xl border border-[#EAECF0] bg-[#FAFAFA] px-4 py-3">
              <textarea value={keterangan} onChange={(event) => setKeterangan(event.target.value)} rows={2} placeholder="Masukkan keterangan..." className="w-full resize-none bg-transparent text-sm font-medium text-[#101828] outline-none placeholder:text-[#98A2B3]" />
            </div>
          </div>
        </div>

        <div className="mb-1 flex items-center justify-between px-1">
          <p className="text-base font-bold text-[#101828]">Daftar Siswa</p>
          <span className="rounded-full bg-[#E0F2FE] px-2.5 py-0.5 text-xs font-bold text-[#0EA5E9]">{siswaList.length} Siswa</span>
        </div>

        {selectedHalaqoh && siswaList.length === 0 ? (
          <div className="rounded-2xl bg-white p-5 text-center text-sm font-semibold text-slate-500 shadow-sm">Tidak ada siswa di halaqoh ini.</div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {siswaList.map((siswa, index) => (
              <SiswaCard
                key={siswa.id}
                no={index + 1}
                siswa={siswa}
                kehadiran={attendanceMap[siswa.id] ?? "Hadir"}
                onChangeKehadiran={(value) => handleKehadiranChange(siswa.id, value)}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="mt-6 flex h-[50px] w-full items-center justify-center rounded-xl bg-[#288DE5] text-[15px] font-bold text-white shadow-md shadow-[#288DE5]/20 transition active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Simpan & Konfirmasi"}
        </button>
      </main>
    </div>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[13px] font-medium text-[#475467]">{children}</p>;
}

function DropdownSelect<T>({
  placeholder,
  value,
  options,
  getLabel,
  onSelect,
}: {
  placeholder: string;
  value?: string;
  options: T[];
  getLabel: (item: T) => string;
  onSelect: (item: T) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex w-full items-center justify-between rounded-xl border border-[#EAECF0] bg-[#FAFAFA] px-4 py-3 text-left text-sm font-semibold text-[#101828] transition active:scale-[0.99]">
        <span className={value ? "" : "text-[#98A2B3]"}>{value ?? placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-[#98A2B3] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul className="absolute left-0 right-0 z-20 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-[#EAECF0] bg-white py-1 shadow-xl">
            {options.length === 0 ? (
              <li className="px-4 py-3 text-sm font-semibold text-slate-400">Data belum tersedia</li>
            ) : (
              options.map((option, index) => (
                <li key={`${getLabel(option)}-${index}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(option);
                      setOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm font-semibold text-[#344054] hover:bg-[#F0F9FF] hover:text-[#288DE5]"
                  >
                    {getLabel(option)}
                  </button>
                </li>
              ))
            )}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function SiswaCard({
  no,
  siswa,
  kehadiran,
  onChangeKehadiran,
}: {
  no: number;
  siswa: GuruQuranStudent;
  kehadiran: AttendancePresence;
  onChangeKehadiran: (value: AttendancePresence) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-[#EAECF0] bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E0F2FE] text-sm font-bold text-[#0284C7]">{no}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#101828]">{siswa.name}</p>
          <p className="text-xs font-medium text-[#98A2B3]">NIS: {siswa.nis ?? "-"}</p>
        </div>
        <div className="relative">
          <button type="button" onClick={() => setOpen((current) => !current)} className="flex items-center gap-1 rounded-full bg-[#F0F9FF] px-3 py-1.5 text-xs font-bold text-[#288DE5]">
            {kehadiran}
            <ChevronDown className="h-3 w-3" />
          </button>
          {open ? (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-32 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl">
                {KEHADIRAN_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onChangeKehadiran(option);
                      setOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
