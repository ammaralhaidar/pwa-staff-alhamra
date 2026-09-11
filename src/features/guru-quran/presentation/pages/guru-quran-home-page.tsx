import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, BookOpen, ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { mergeTahfidzSessions } from "../../application/guru-quran-storage";
import { useHalaqohList, useTahfidzHistorySessions, useTahfidzStudents } from "../../application/guru-quran-queries";
import type { AttendanceSession, AttendanceStatus } from "../../domain/guru-quran-types";
import { GuruQuranHeader } from "../components/guru-quran-header";
import { AttendanceSessionCard } from "../components/attendance-session-card";

const FILTER_WAKTU_OPTIONS = ["Hari Ini", "7 Hari", "30 Hari", "Semua"] as const;
const FILTER_STATUS_OPTIONS = ["Semua", "Belum Disimak", "Disimak Sebagian", "Selesai"] as const;

type FilterWaktu = (typeof FILTER_WAKTU_OPTIONS)[number];
type FilterStatus = (typeof FILTER_STATUS_OPTIONS)[number];

export function GuruQuranHomePage() {
  const navigate = useNavigate();
  const [filterWaktu, setFilterWaktu] = useState<FilterWaktu>("Hari Ini");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("Semua");
  const [completionStatus, setCompletionStatus] = useState<Record<number, AttendanceStatus>>({});

  const halaqohQuery = useHalaqohList();
  const activeHalaqoh = halaqohQuery.data?.[0];
  const sessionsQuery = useTahfidzHistorySessions(activeHalaqoh?.id);

  const sessions = useMemo(
    () => mergeTahfidzSessions(sessionsQuery.data ?? []).map((session) => enrichSessionWithHalaqoh(session, activeHalaqoh)),
    [activeHalaqoh, sessionsQuery.data],
  );

  const filteredSessions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return sessions.filter((session) => {
      const sessionDate = new Date(session.tanggal);
      sessionDate.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today.getTime() - sessionDate.getTime()) / 86_400_000);

      const passWaktu =
        filterWaktu === "Semua"
          ? true
          : filterWaktu === "Hari Ini"
            ? diffDays === 0
            : filterWaktu === "7 Hari"
              ? diffDays >= 0 && diffDays <= 7
              : diffDays >= 0 && diffDays <= 30;

      const status = completionStatus[session.id] ?? session.status;
      const passStatus =
        filterStatus === "Semua"
          ? true
          : filterStatus === "Belum Disimak"
            ? status === "draft"
            : filterStatus === "Disimak Sebagian"
              ? status === "partial"
              : status === "done";

      return passWaktu && passStatus;
    });
  }, [completionStatus, filterStatus, filterWaktu, sessions]);

  const isLoading = halaqohQuery.isLoading || sessionsQuery.isLoading;
  const error = halaqohQuery.error ?? sessionsQuery.error;

  function retry() {
    void halaqohQuery.refetch();
    void sessionsQuery.refetch();
  }

  return (
    <div className="flex flex-col">
      <GuruQuranHeader title="Beranda Guru Qur'an" />

      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <FilterDropdown value={filterWaktu} options={[...FILTER_WAKTU_OPTIONS]} onChange={(value) => setFilterWaktu(value as FilterWaktu)} />
        <FilterDropdown value={filterStatus} options={[...FILTER_STATUS_OPTIONS]} onChange={(value) => setFilterStatus(value as FilterStatus)} />
      </div>

      <main className="flex-1 px-5 pb-24">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error instanceof Error ? error.message : "Gagal memuat absen Tahfidz"} onRetry={retry} />
        ) : !activeHalaqoh ? (
          <EmptyState title="Belum ada halaqoh" description="Data halaqoh Guru Quran belum tersedia." />
        ) : filteredSessions.length === 0 ? (
          <EmptyState title="Belum ada data absen Tahfidz" description="Tambah absen baru dengan tombol +" />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredSessions.map((session) => (
              <CompletionAwareSessionCard
                key={session.id}
                session={session}
                onStatusChange={(status) =>
                  setCompletionStatus((current) => current[session.id] === status ? current : { ...current, [session.id]: status })
                }
                onClick={() =>
                  navigate(`/guru-quran/tahfidz/penilaian/${session.id}`, {
                    state: { session: { ...session, status: completionStatus[session.id] ?? session.status } },
                  })
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function enrichSessionWithHalaqoh(
  session: AttendanceSession,
  halaqoh?: { id: number; name: string },
): AttendanceSession {
  if (!halaqoh) return session;

  return {
    ...session,
    halaqohId: session.halaqohId || halaqoh.id,
    halaqohName: session.halaqohName && session.halaqohName !== "-" ? session.halaqohName : halaqoh.name,
  };
}

function CompletionAwareSessionCard({
  session,
  onStatusChange,
  onClick,
}: {
  session: AttendanceSession;
  onStatusChange: (status: AttendanceStatus) => void;
  onClick: () => void;
}) {
  const studentsQuery = useTahfidzStudents(session.id);

  const { computedStatus, computedDoneCount, computedTotalCount } = useMemo(() => {
    const students = studentsQuery.data;
    if (!students || students.length === 0) {
      return {
        computedStatus: session.status,
        computedDoneCount: session.doneCount ?? 0,
        computedTotalCount: session.jumlahSiswa,
      };
    }
    const total = students.length;
    const done = students.filter((s) => s.status === "done").length;
    let status: AttendanceStatus = "draft";
    if (total > 0 && done === total) status = "done";
    else if (done > 0) status = "partial";
    else status = "draft";

    return { computedStatus: status, computedDoneCount: done, computedTotalCount: total };
  }, [session.doneCount, session.jumlahSiswa, session.status, studentsQuery.data]);

  useEffect(() => {
    if (studentsQuery.data) onStatusChange(computedStatus);
  }, [computedStatus, onStatusChange, studentsQuery.data]);

  return (
    <AttendanceSessionCard
      session={{
        ...session,
        status: computedStatus,
        doneCount: computedDoneCount,
        jumlahSiswa: computedTotalCount,
      }}
      onClick={onClick}
    />
  );
}

function FilterDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-1.5 rounded-xl border border-[#EAECF0] bg-white px-4 py-3 text-sm font-semibold text-[#344054] shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition active:scale-95"
      >
        <span>{value}</span>
        <ChevronDown className={`h-4 w-4 text-[#98A2B3] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul className="absolute left-0 right-0 z-20 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-[#EAECF0] bg-white py-1 shadow-lg">
            {options.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                    option === value ? "bg-[#F0F9FF] font-bold text-[#288DE5]" : "font-semibold text-[#475467]"
                  }`}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
        <BookOpen className="h-8 w-8 text-gray-300" />
      </div>
      <p className="font-semibold text-gray-500">{title}</p>
      <p className="mt-1 text-sm text-gray-400">{description}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-5 text-center shadow-sm">
      <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-500" />
      <p className="text-sm font-semibold text-slate-700">{message}</p>
      <Button type="button" className="mt-4 rounded-xl" onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Coba Lagi
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
          <Skeleton className="my-3 h-px w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
