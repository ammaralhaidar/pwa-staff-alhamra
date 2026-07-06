import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackMusyrifStudents, fallbackMutabaahActivities, fallbackMutabaahSesi } from "../../application/musyrif-fallback-data";
import { useCreateMutabaah, useMusyrifStudents, useMutabaahActivities, useMutabaahSesi } from "../../application/musyrif-queries";
import type { MutabaahItem } from "../../domain/musyrif-types";
import { ActivityCheckItem } from "../components/activity-check-item";
import { MusyrifDatePicker } from "../components/musyrif-date-picker";
import { MusyrifHeader } from "../components/musyrif-header";
import { SearchableOptionPicker } from "../components/searchable-option-picker";

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function MutabaahFormPage() {
  const navigate = useNavigate();
  const today = useMemo(() => formatDateInput(new Date()), []);
  const [siswaId, setSiswaId] = useState("");
  const [sesiId, setSesiId] = useState("");
  const [tanggal, setTanggal] = useState(today);
  const [uncheckedIds, setUncheckedIds] = useState<number[]>([]);
  const [activityNotes, setActivityNotes] = useState<Record<number, string>>({});
  const studentsQuery = useMusyrifStudents();
  const sesiQuery = useMutabaahSesi();
  const activitiesQuery = useMutabaahActivities(Number(sesiId));
  const createMutation = useCreateMutabaah();
  const isStudentFallbackMode = studentsQuery.isError && isDemoFallbackEnabled();
  const isSesiFallbackMode = sesiQuery.isError && isDemoFallbackEnabled();
  const isActivitiesFallbackMode = activitiesQuery.isError && isDemoFallbackEnabled();
  
  const students = useMemo(
    () => studentsQuery.data ?? (isStudentFallbackMode ? fallbackMusyrifStudents : []),
    [studentsQuery.data, isStudentFallbackMode],
  );
  const sesiList = useMemo(
    () => sesiQuery.data ?? (isSesiFallbackMode ? fallbackMutabaahSesi : []),
    [sesiQuery.data, isSesiFallbackMode],
  );
  const activities = useMemo(
    () => activitiesQuery.data ?? (isActivitiesFallbackMode ? fallbackMutabaahActivities : []),
    [activitiesQuery.data, isActivitiesFallbackMode],
  );
  const isUsingFallback = isStudentFallbackMode || isSesiFallbackMode || isActivitiesFallbackMode;

  const items: MutabaahItem[] = useMemo(
    () => activities.map((activity) => ({ ...activity, dilaksanakan: !uncheckedIds.includes(activity.id), keterangan: activityNotes[activity.id] })),
    [activities, activityNotes, uncheckedIds],
  );
  const studentOptions = useMemo(
    () => students.map((student) => ({
      value: String(student.id),
      label: student.name,
      subtitle: student.nis ? `NIS: ${student.nis}` : undefined,
      badge: student.kelas,
    })),
    [students],
  );
  const sesiOptions = useMemo(
    () => sesiList.map((sesi) => ({
      value: String(sesi.id),
      label: sesi.name,
      subtitle: [sesi.jamMulai, sesi.jamSelesai].filter(Boolean).join(" - ") || undefined,
    })),
    [sesiList],
  );

  const score = useMemo(() => {
    const total = items.filter((item) => item.dilaksanakan).reduce((sum, item) => sum + item.skor, 0);
    const max = items.reduce((sum, item) => sum + item.skor, 0);
    return { total, max };
  }, [items]);

  const submit = () => {
    if (isUsingFallback) {
      toast.error("Data contoh tidak bisa dipakai untuk submit mutabaah.");
      return;
    }
    if (!siswaId || !sesiId || !tanggal) {
      toast.error("Santri, sesi, dan tanggal wajib diisi.");
      return;
    }
    createMutation.mutate({
      siswa_id: Number(siswaId),
      sesi_id: Number(sesiId),
      tgl: tanggal,
      mutabaah_lines: items
        .filter((item) => !item.dilaksanakan)
        .map((item) => ({ mutabaah_id: item.id, is_sudah: false, keterangan: item.keterangan?.trim() || "-" })),
    }, {
      onSuccess: () => {
        toast.success("Mutabaah berhasil disimpan.");
        navigate("/musyrif/aktivitas/mutabaah");
      },
      onError: () => toast.error("Gagal menyimpan mutabaah."),
    });
  };

  return (
    <div className="relative mx-auto flex h-svh max-w-[430px] flex-col bg-[#EFF6FF]">
      <div className="shrink-0 z-40">
        <MusyrifHeader
          title="Mutabaah Harian"
          subtitle="Evaluasi harian santri"
          onBack={() => navigate("/musyrif/aktivitas/mutabaah")}
        />
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        <section className="flex flex-col gap-4 px-4 py-6">
          {/* Inputs Card */}
          <Card className="space-y-4 rounded-[24px] border-0 bg-white p-5 shadow-sm">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">Tanggal</label>
              <MusyrifDatePicker value={tanggal} min={today} onChange={setTanggal} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">Sesi</label>
              <SearchableOptionPicker
                value={sesiId}
                onChange={setSesiId}
                title="Pilih Sesi"
                placeholder="Pilih Sesi"
                searchPlaceholder="Cari sesi..."
                options={sesiOptions}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 block">Siswa</label>
              <SearchableOptionPicker
                value={siswaId}
                onChange={setSiswaId}
                title="Pilih Siswa"
                placeholder="Pilih Siswa"
                searchPlaceholder="Cari nama, NIS, atau kelas..."
                options={studentOptions}
              />
            </div>
          </Card>

          {/* Action Checkbox Headers */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-800 text-[15px]">Check Aktivitas</span>
              {sesiId && (
                <span className="text-[11px] font-bold text-blue-500 mt-0.5">
                  {sesiList.find(s => String(s.id) === sesiId)?.name}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setUncheckedIds(activities.map((item) => item.id))}
                className="h-8 rounded-lg text-xs font-bold border-slate-200 text-slate-600 px-3 hover:bg-slate-50"
              >
                Uncheck All
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setUncheckedIds([])}
                className="h-8 rounded-lg text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white px-3"
              >
                Check All
              </Button>
            </div>
          </div>

          {/* Activities List */}
          <div className="flex flex-col gap-3">
            {!sesiId ? (
              <div className="text-center py-8 text-sm font-semibold text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                Pilih sesi untuk memuat aktivitas
              </div>
            ) : (
              items.map((item) => (
                <ActivityCheckItem
                  key={item.id}
                  item={item}
                  note={activityNotes[item.id] ?? ""}
                  onNoteChange={(value) => setActivityNotes((current) => ({ ...current, [item.id]: value }))}
                  onChange={(checked) =>
                    setUncheckedIds((current) =>
                      checked
                        ? current.filter((id) => id !== item.id)
                        : [...new Set([...current, item.id])]
                    )
                  }
                />
              ))
            )}
            {isUsingFallback ? (
              <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold leading-relaxed text-amber-700">
                Sebagian data contoh ditampilkan karena API belum tersedia. Submit dinonaktifkan.
              </div>
            ) : null}
            {sesiId && !activitiesQuery.isLoading && !items.length ? (
              <div className="text-center py-8 text-sm font-semibold text-slate-400 bg-white rounded-2xl">
                Aktivitas mutabaah belum tersedia.
              </div>
            ) : null}
          </div>


          {/* Total Score Card */}
          <Card className="rounded-[22px] border-0 bg-white p-5 shadow-sm mt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">TOTAL NILAI</p>
            <p className="text-base font-extrabold text-slate-800 mt-1">
              Skor Mutabaah {score.total} dari {score.max}
            </p>
          </Card>
        </section>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur z-30">
        <div className="mx-auto max-w-[430px]">
          <Button 
            onClick={submit} 
            disabled={createMutation.isPending || isUsingFallback} 
            className="h-12 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            Simpan Mutabaah
          </Button>
        </div>
      </div>
    </div>
  );
}
