import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAcademicAttendance,
  deleteAcademicAttendance,
  finalizeAcademicAttendance,
  getAcademicAttendanceDetail,
  getAcademicAttendanceList,
  getAcademicAttendanceMasterData,
  getAcademicStudentsByClass,
  reopenAcademicAttendance,
  updateAcademicAttendance,
} from "../api/guru-akademik-api";
import { addAcademicAssessment, getAcademicAssessments } from "./guru-akademik-storage";
import type {
  AcademicAssessment,
  AcademicAttendanceListParams,
  CreateAcademicAttendancePayload,
  UpdateAcademicAttendancePayload,
} from "../domain/guru-akademik-types";

export const guruAkademikKeys = {
  root: ["guru-akademik"] as const,
  attendanceRoot: ["guru-akademik", "attendance"] as const,
  master: ["guru-akademik", "attendance", "master"] as const,
  students: (classId: number) => ["guru-akademik", "attendance", "students", classId] as const,
  listRoot: ["guru-akademik", "attendance", "list"] as const,
  list: (params: AcademicAttendanceListParams) => ["guru-akademik", "attendance", "list", params] as const,
  detail: (attendanceId: number) => ["guru-akademik", "attendance", "detail", attendanceId] as const,
  assessment: ["guru-akademik", "assessment"] as const,
};

export function useAcademicAttendanceMasterData() {
  return useQuery({ queryKey: guruAkademikKeys.master, queryFn: getAcademicAttendanceMasterData, staleTime: 5 * 60_000 });
}

export function useAcademicStudentsByClass(classId?: number) {
  return useQuery({
    queryKey: guruAkademikKeys.students(classId ?? 0),
    queryFn: () => getAcademicStudentsByClass(classId as number),
    enabled: Boolean(classId),
    staleTime: 60_000,
  });
}

export function useAcademicAttendanceList(params: AcademicAttendanceListParams) {
  return useQuery({
    queryKey: guruAkademikKeys.list(params),
    queryFn: () => getAcademicAttendanceList(params),
    placeholderData: (previous) => previous,
  });
}

export function useAcademicAttendanceDetail(attendanceId?: number) {
  return useQuery({
    queryKey: guruAkademikKeys.detail(attendanceId ?? 0),
    queryFn: () => getAcademicAttendanceDetail(attendanceId as number),
    enabled: Boolean(attendanceId),
  });
}

function useInvalidateAttendance() {
  const queryClient = useQueryClient();
  return async (attendanceId?: number) => {
    await queryClient.invalidateQueries({ queryKey: guruAkademikKeys.listRoot });
    if (attendanceId) await queryClient.invalidateQueries({ queryKey: guruAkademikKeys.detail(attendanceId) });
  };
}

export function useCreateAcademicAttendance() {
  const invalidate = useInvalidateAttendance();
  return useMutation({ mutationFn: (payload: CreateAcademicAttendancePayload) => createAcademicAttendance(payload), onSuccess: () => invalidate() });
}

export function useUpdateAcademicAttendance() {
  const invalidate = useInvalidateAttendance();
  return useMutation({ mutationFn: (payload: UpdateAcademicAttendancePayload) => updateAcademicAttendance(payload), onSuccess: (_, payload) => invalidate(payload.attendanceId) });
}

export function useFinalizeAcademicAttendance() {
  const invalidate = useInvalidateAttendance();
  return useMutation({ mutationFn: finalizeAcademicAttendance, onSuccess: (_, attendanceId) => invalidate(attendanceId) });
}

export function useReopenAcademicAttendance() {
  const invalidate = useInvalidateAttendance();
  return useMutation({ mutationFn: reopenAcademicAttendance, onSuccess: (_, attendanceId) => invalidate(attendanceId) });
}

export function useDeleteAcademicAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAcademicAttendance,
    onSuccess: async (_, attendanceId) => {
      queryClient.removeQueries({ queryKey: guruAkademikKeys.detail(attendanceId) });
      await queryClient.invalidateQueries({ queryKey: guruAkademikKeys.listRoot });
    },
  });
}

export function useAcademicAssessments() {
  return useQuery({ queryKey: guruAkademikKeys.assessment, queryFn: getAcademicAssessments });
}

export function useCreateAcademicAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: AcademicAssessment) => addAcademicAssessment(item),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: guruAkademikKeys.assessment }),
  });
}
