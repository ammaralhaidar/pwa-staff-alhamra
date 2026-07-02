import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelPelanggaran,
  confirmPelanggaran,
  createPelanggaran,
  decidePelanggaran,
  fetchMasterPelanggaran,
  fetchPelanggaranDetail,
  fetchPelanggaranList,
  fetchTindakanOptions,
  processPelanggaran,
  searchPelanggaranStudents,
} from "../api/pelanggaran-api";
import type { MasterJenisParams, PelanggaranListParams, SearchSiswaParams } from "../domain/pelanggaran-types";

function normalizeListParams(params?: PelanggaranListParams | string, isMySantri?: boolean): PelanggaranListParams | undefined {
  if (typeof params === "string") {
    return {
      state: params === "all" ? undefined : params,
      isMySantri,
    };
  }
  if (!params && isMySantri === undefined) return undefined;
  return {
    ...params,
    isMySantri: params?.isMySantri ?? isMySantri,
  };
}

function normalizeListKey(params?: PelanggaranListParams) {
  return {
    siswaId: params?.siswaId ?? null,
    state: !params?.state || params.state === "all" ? "all" : params.state,
    limit: params?.limit ?? null,
    offset: params?.offset ?? null,
    isMySantri: params?.isMySantri ?? false,
  };
}

function normalizeSearchKey(params?: string | SearchSiswaParams | MasterJenisParams) {
  if (typeof params === "string") return params;
  return params?.search ?? "";
}

export const pelanggaranKeys = {
  all: ["pelanggaran"] as const,
  list: (params?: PelanggaranListParams) => [...pelanggaranKeys.all, "list", normalizeListKey(params)] as const,
  detail: (id: number) => [...pelanggaranKeys.all, "detail", id] as const,
  students: (params?: string | SearchSiswaParams) => [...pelanggaranKeys.all, "students", normalizeSearchKey(params)] as const,
  master: (params?: string | MasterJenisParams) => [...pelanggaranKeys.all, "master", normalizeSearchKey(params)] as const,
  tindakan: () => [...pelanggaranKeys.all, "tindakan"] as const,
};

export function usePelanggaranList(paramsOrState?: PelanggaranListParams | string, isMySantri?: boolean) {
  const params = normalizeListParams(paramsOrState, isMySantri);
  return useQuery({
    queryKey: pelanggaranKeys.list(params),
    queryFn: () => fetchPelanggaranList(params),
  });
}

export function usePelanggaranDetail(pelanggaranId: number) {
  return useQuery({
    queryKey: pelanggaranKeys.detail(pelanggaranId),
    queryFn: () => fetchPelanggaranDetail(pelanggaranId),
    enabled: pelanggaranId > 0,
  });
}

export function usePelanggaranStudents(params?: string | SearchSiswaParams) {
  return useQuery({
    queryKey: pelanggaranKeys.students(params),
    queryFn: () => searchPelanggaranStudents(params),
    staleTime: 60 * 1000,
  });
}

export function useMasterPelanggaran(params?: string | MasterJenisParams) {
  return useQuery({
    queryKey: pelanggaranKeys.master(params),
    queryFn: () => fetchMasterPelanggaran(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTindakanOptions() {
  return useQuery({
    queryKey: pelanggaranKeys.tindakan(),
    queryFn: fetchTindakanOptions,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePelanggaran() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPelanggaran,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pelanggaranKeys.all }),
  });
}

export function useConfirmPelanggaran() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmPelanggaran,
    onSuccess: (_data, pelanggaranId) => {
      queryClient.invalidateQueries({ queryKey: pelanggaranKeys.all });
      queryClient.invalidateQueries({ queryKey: pelanggaranKeys.detail(pelanggaranId) });
    },
  });
}

export function useProcessPelanggaran() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: processPelanggaran,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: pelanggaranKeys.all });
      queryClient.invalidateQueries({ queryKey: pelanggaranKeys.detail(variables.pelanggaranId) });
    },
  });
}

export function useCancelPelanggaran() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelPelanggaran,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: pelanggaranKeys.all });
      queryClient.invalidateQueries({ queryKey: pelanggaranKeys.detail(variables.pelanggaranId) });
    },
  });
}

export function useDecidePelanggaran() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: decidePelanggaran,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: pelanggaranKeys.all });
      queryClient.invalidateQueries({ queryKey: pelanggaranKeys.detail(variables.pelanggaranId) });
    },
  });
}
