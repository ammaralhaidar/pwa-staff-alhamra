import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelPelanggaran,
  createPerijinan,
  decidePelanggaran,
  decidePerijinan,
  fetchPelanggaranDetail,
  fetchPelanggaranList,
  fetchPerijinanDetail,
  fetchPerijinanList,
  fetchTindakanOptions,
  processPelanggaran,
  searchPelanggaranStudents,
} from "../api/kesantrian-api";
import type { PelanggaranListParams, PerijinanListParams, StudentSearchParams } from "../domain/kesantrian-types";

export const kesantrianKeys = {
  all: ["kesantrian"] as const,
  perijinan: () => [...kesantrianKeys.all, "perijinan"] as const,
  perijinanList: (params?: PerijinanListParams) => [...kesantrianKeys.perijinan(), "list", params ?? {}] as const,
  perijinanDetail: (id: number) => [...kesantrianKeys.perijinan(), "detail", id] as const,
  pelanggaran: () => [...kesantrianKeys.all, "pelanggaran"] as const,
  pelanggaranList: (params?: PelanggaranListParams) => [...kesantrianKeys.pelanggaran(), "list", params ?? {}] as const,
  pelanggaranDetail: (id: number) => [...kesantrianKeys.pelanggaran(), "detail", id] as const,
  tindakan: () => [...kesantrianKeys.pelanggaran(), "tindakan"] as const,
  students: (params?: StudentSearchParams) => [...kesantrianKeys.all, "students", params ?? {}] as const,
};

function normalizeListParams<T extends { state?: string }>(params?: string | T): T | undefined {
  if (typeof params === "string") return { state: params === "all" ? undefined : params } as T;
  if (params?.state === "all") return { ...params, state: undefined };
  return params;
}

function normalizeStudentParams(params?: string | StudentSearchParams): StudentSearchParams | undefined {
  if (typeof params === "string") return { search: params };
  return params;
}

export function usePerijinanList(params?: string | PerijinanListParams) {
  const normalizedParams = normalizeListParams<PerijinanListParams>(params);
  return useQuery({
    queryKey: kesantrianKeys.perijinanList(normalizedParams),
    queryFn: () => fetchPerijinanList(normalizedParams),
  });
}

export function usePerijinanDetail(izinId: number) {
  return useQuery({
    queryKey: kesantrianKeys.perijinanDetail(izinId),
    queryFn: () => fetchPerijinanDetail(izinId),
    enabled: izinId > 0,
  });
}

export function useCreatePerijinan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPerijinan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: kesantrianKeys.perijinan() }),
  });
}

export function useDecidePerijinan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: decidePerijinan,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: kesantrianKeys.perijinan() });
      queryClient.invalidateQueries({ queryKey: kesantrianKeys.perijinanDetail(variables.izinId) });
    },
  });
}

export function usePelanggaranList(params?: string | PelanggaranListParams) {
  const normalizedParams = normalizeListParams<PelanggaranListParams>(params);
  return useQuery({
    queryKey: kesantrianKeys.pelanggaranList(normalizedParams),
    queryFn: () => fetchPelanggaranList(normalizedParams),
  });
}

export function usePelanggaranDetail(pelanggaranId: number) {
  return useQuery({
    queryKey: kesantrianKeys.pelanggaranDetail(pelanggaranId),
    queryFn: () => fetchPelanggaranDetail(pelanggaranId),
    enabled: pelanggaranId > 0,
  });
}

export function useTindakanOptions() {
  return useQuery({
    queryKey: kesantrianKeys.tindakan(),
    queryFn: fetchTindakanOptions,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProcessPelanggaran() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: processPelanggaran,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: kesantrianKeys.pelanggaran() });
      queryClient.invalidateQueries({ queryKey: kesantrianKeys.pelanggaranDetail(variables.pelanggaranId) });
    },
  });
}

export function useDecidePelanggaran() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: decidePelanggaran,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: kesantrianKeys.pelanggaran() });
      queryClient.invalidateQueries({ queryKey: kesantrianKeys.pelanggaranDetail(variables.pelanggaranId) });
    },
  });
}

export function useCancelPelanggaran() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelPelanggaran,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: kesantrianKeys.pelanggaran() });
      queryClient.invalidateQueries({ queryKey: kesantrianKeys.pelanggaranDetail(variables.pelanggaranId) });
    },
  });
}

export function useStudentSearch(params?: string | StudentSearchParams) {
  const normalizedParams = normalizeStudentParams(params);
  return useQuery({
    queryKey: kesantrianKeys.students(normalizedParams),
    queryFn: () => searchPelanggaranStudents(normalizedParams),
    enabled: true,
    staleTime: 60 * 1000,
  });
}
