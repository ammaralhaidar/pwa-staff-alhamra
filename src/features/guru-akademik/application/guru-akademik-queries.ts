import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addAcademicAssessment, addAcademicAttendance, deleteAcademicAttendance, getAcademicAssessments, getAcademicAttendance, updateAcademicAttendance } from "./guru-akademik-storage";
import type { AcademicAssessment, AcademicAttendance } from "../domain/guru-akademik-types";

const keys = { attendance: ["guru-akademik", "attendance"] as const, assessment: ["guru-akademik", "assessment"] as const };
export function useAcademicAttendance() { return useQuery({ queryKey: keys.attendance, queryFn: getAcademicAttendance }); }
export function useAcademicAssessments() { return useQuery({ queryKey: keys.assessment, queryFn: getAcademicAssessments }); }
export function useCreateAcademicAttendance() { const queryClient = useQueryClient(); return useMutation({ mutationFn: async (item: AcademicAttendance) => addAcademicAttendance(item), onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.attendance }) }); }
export function useCreateAcademicAssessment() { const queryClient = useQueryClient(); return useMutation({ mutationFn: async (item: AcademicAssessment) => addAcademicAssessment(item), onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.assessment }) }); }
export function useUpdateAcademicAttendance() { const queryClient = useQueryClient(); return useMutation({ mutationFn: async (item: AcademicAttendance) => updateAcademicAttendance(item), onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.attendance }) }); }
export function useDeleteAcademicAttendance() { const queryClient = useQueryClient(); return useMutation({ mutationFn: async (id: string | number) => deleteAcademicAttendance(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.attendance }) }); }
