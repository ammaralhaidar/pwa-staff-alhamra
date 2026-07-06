import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Users, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useHalaqohList, useTahfidzHistorySessions, useTahfidzStudents } from "../../application/guru-quran-queries";
import type { AttendanceSession, TahfidzStudent } from "../../domain/guru-quran-types";

export function TahfidzAssessmentPage() {
  const navigate = useNavigate();
  const { attendanceId } = useParams<{ attendanceId: string }>();
  const location = useLocation();
  const routeSession = (location.state as { session?: AttendanceSession })?.session;
  const absenId = Number(attendanceId) || 0;
  const halaqohQuery = useHalaqohList();
  const activeHalaqoh = halaqohQuery.data?.[0];
  const activeHalaqohId = routeSession?.halaqohId || activeHalaqoh?.id;
  const sessionsQuery = useTahfidzHistorySessions(activeHalaqohId);
  const studentsQuery = useTahfidzStudents(absenId);
  const fetchedSession = sessionsQuery.data?.find((item) => item.id === absenId);
  const session = enrichSessionWithHalaqoh(fetchedSession ?? routeSession, activeHalaqoh);

  const halaqohName = session?.halaqohName ?? "-";
  const sesiName = session?.sesiName ?? "-";

  return (
    <div className="flex min-h-svh flex-col bg-[#EFF6FF]">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/guru-quran")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#475467] transition active:scale-90"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-black">
              Penilaian Tahfidz Al-Qur&apos;an
            </p>
            <p className="mt-0.5 text-xs font-semibold text-[#667085]">
              {halaqohName} - {sesiName}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-5 mt-5 flex items-center gap-3 rounded-2xl border border-[#B3E0FF] bg-[#F0F9FF] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        <AlertCircle className="h-5 w-5 shrink-0 text-[#288DE5]" />
        <p className="text-sm font-semibold text-[#344054]">
          Pilih siswa untuk melakukan penilaian tahfidz
        </p>
      </div>

      <main className="flex-1 px-5 pb-6 pt-4">
        {studentsQuery.isLoading ? (
          <LoadingSkeleton />
        ) : studentsQuery.isError ? (
          <ErrorState
            message={studentsQuery.error instanceof Error ? studentsQuery.error.message : "Gagal memuat siswa"}
            onRetry={() => studentsQuery.refetch()}
          />
        ) : (studentsQuery.data ?? []).length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-3.5">
            {(studentsQuery.data ?? []).map((student, idx) => (
              <StudentCard
                key={student.tahfidzId}
                no={idx + 1}
                student={student}
                onClick={() =>
                  navigate(
                    `/guru-quran/tahfidz/penilaian/${attendanceId}/santri/${student.tahfidzId}`,
                    {
                      state: {
                        session,
                        student,
                      },
                    },
                  )
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
  session?: AttendanceSession,
  halaqoh?: { id: number; name: string },
) {
  if (!session) return undefined;
  if (!halaqoh) return session;

  return {
    ...session,
    halaqohId: session.halaqohId || halaqoh.id,
    halaqohName: session.halaqohName && session.halaqohName !== "-" ? session.halaqohName : halaqoh.name,
  };
}

function StudentCard({
  no,
  student,
  onClick,
}: {
  no: number;
  student: TahfidzStudent;
  onClick: () => void;
}) {
  const isDone = student.status === "done";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-[#EAECF0] bg-white p-4 text-left shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition active:scale-[0.98]"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#288DE5] text-base font-bold text-white">
          {no}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-[#101828]">
            {student.studentName}
          </p>
          <p className="mt-0.5 text-xs font-medium text-[#98A2B3]">NIS: {student.nis || "-"}</p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            isDone
              ? "bg-[#ECFDF3] text-[#027A48]"
              : "bg-[#FEF3F2] text-[#B42318]"
          }`}
        >
          {isDone ? "Selesai" : "Belum"}
        </span>
      </div>

      {student.summaryHafalan && (
        <div className="mt-3.5 rounded-xl border border-[#F2F4F7] bg-[#FAFAFA] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#98A2B3]">
            {isDone ? "Hafalan Hari Ini" : "Hafalan Terakhir"}
          </p>
          <p className="mt-1 text-[13px] font-bold text-[#344054]">
            {student.summaryHafalan}
          </p>
        </div>
      )}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Users className="mb-4 h-12 w-12 text-gray-300" />
      <p className="font-medium text-gray-500">Tidak ada siswa</p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-gray-400" />
      <p className="text-sm text-gray-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-[#288DE5] px-5 py-2 text-sm font-medium text-white transition active:scale-95"
      >
        Coba Lagi
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="flex gap-4">
            <Skeleton className="h-11 w-11 rounded-[10px]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
