import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changeStudentPin,
  checkMusyrifPerijinan,
  createMusyrifPerijinan,
  createMutabaah,
  createTahfidzMusyrif,
  fetchMusyrifPegawai,
  fetchMusyrifPerijinanDetail,
  fetchMusyrifPerijinanList,
  fetchMusyrifStudentDetail,
  fetchMusyrifStudents,
  fetchMutabaahActivities,
  fetchMutabaahList,
  fetchMutabaahSesi,
  fetchTahfidzAyat,
  fetchTahfidzMusyrifList,
  fetchTahfidzNilai,
  fetchTahfidzSesi,
  fetchTahfidzSurah,
  fetchWalletBalance,
  fetchWalletHistory,
  topupWallet,
} from "../api/musyrif-api";
import type { WalletHistoryType } from "../domain/musyrif-types";

export const musyrifKeys = {
  all: ["musyrif"] as const,
  perijinan: () => [...musyrifKeys.all, "perijinan"] as const,
  perijinanList: (state?: string) => [...musyrifKeys.perijinan(), "list", state ?? "all"] as const,
  perijinanDetail: (id: number) => [...musyrifKeys.perijinan(), "detail", id] as const,
  students: () => [...musyrifKeys.all, "students"] as const,
  studentList: (search?: string) => [...musyrifKeys.students(), "list", search ?? ""] as const,
  studentDetail: (id: number) => [...musyrifKeys.students(), "detail", id] as const,
  balance: (id: number) => [...musyrifKeys.students(), "balance", id] as const,
  history: (id: number, type: WalletHistoryType) => [...musyrifKeys.students(), "history", id, type] as const,
  mutabaah: () => [...musyrifKeys.all, "mutabaah"] as const,
  mutabaahSesi: () => [...musyrifKeys.mutabaah(), "sesi"] as const,
  mutabaahActivities: (sesiId?: number) => [...musyrifKeys.mutabaah(), "activities", sesiId ?? "all"] as const,
  tahfidz: () => [...musyrifKeys.all, "tahfidz"] as const,
  tahfidzSesi: () => [...musyrifKeys.tahfidz(), "sesi"] as const,
  tahfidzSurah: () => [...musyrifKeys.tahfidz(), "surah"] as const,
  tahfidzAyat: (surahId?: number) => [...musyrifKeys.tahfidz(), "ayat", surahId ?? "all"] as const,
  tahfidzNilai: () => [...musyrifKeys.tahfidz(), "nilai"] as const,
  pegawai: () => [...musyrifKeys.all, "pegawai"] as const,
};

export function useMusyrifPerijinanList(state?: string) {
  return useQuery({
    queryKey: musyrifKeys.perijinanList(state),
    queryFn: () => fetchMusyrifPerijinanList({ state: state === "all" ? undefined : state }),
  });
}

export function useMusyrifPerijinanDetail(izinId: number) {
  return useQuery({
    queryKey: musyrifKeys.perijinanDetail(izinId),
    queryFn: () => fetchMusyrifPerijinanDetail(izinId),
    enabled: izinId > 0,
  });
}

export function useCreateMusyrifPerijinan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMusyrifPerijinan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: musyrifKeys.perijinan() }),
  });
}

export function useCheckMusyrifPerijinan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkMusyrifPerijinan,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: musyrifKeys.perijinan() });
      queryClient.invalidateQueries({ queryKey: musyrifKeys.perijinanDetail(variables.izin_id) });
    },
  });
}

export function useMusyrifStudents(search?: string) {
  return useQuery({
    queryKey: musyrifKeys.studentList(search),
    queryFn: () => fetchMusyrifStudents(search),
  });
}

export function useMusyrifStudentDetail(santriId: number) {
  return useQuery({
    queryKey: musyrifKeys.studentDetail(santriId),
    queryFn: () => fetchMusyrifStudentDetail(santriId),
    enabled: santriId > 0,
  });
}

export function useWalletBalance(santriId: number) {
  return useQuery({
    queryKey: musyrifKeys.balance(santriId),
    queryFn: () => fetchWalletBalance(santriId),
    enabled: santriId > 0,
  });
}

export function useWalletHistory(santriId: number, type: WalletHistoryType) {
  return useQuery({
    queryKey: musyrifKeys.history(santriId, type),
    queryFn: () => fetchWalletHistory(santriId, type),
    enabled: santriId > 0,
  });
}

export function useTopupWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: topupWallet,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: musyrifKeys.balance(variables.siswa_id) });
      queryClient.invalidateQueries({ queryKey: musyrifKeys.history(variables.siswa_id, "dompet") });
    },
  });
}

export function useChangeStudentPin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: changeStudentPin,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: musyrifKeys.balance(variables.siswa_id) });
      queryClient.invalidateQueries({ queryKey: musyrifKeys.studentDetail(variables.siswa_id) });
    },
  });
}

export function useMutabaahList() {
  return useQuery({ queryKey: musyrifKeys.mutabaah(), queryFn: fetchMutabaahList });
}

export function useMutabaahSesi() {
  return useQuery({ queryKey: musyrifKeys.mutabaahSesi(), queryFn: fetchMutabaahSesi, staleTime: 5 * 60 * 1000 });
}

export function useMutabaahActivities(sesiId?: number) {
  return useQuery({
    queryKey: musyrifKeys.mutabaahActivities(sesiId),
    queryFn: () => fetchMutabaahActivities(sesiId),
    enabled: Boolean(sesiId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMutabaah() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMutabaah,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: musyrifKeys.mutabaah() }),
  });
}

export function useTahfidzMusyrifList() {
  return useQuery({ queryKey: musyrifKeys.tahfidz(), queryFn: fetchTahfidzMusyrifList });
}

export function useCreateTahfidzMusyrif() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTahfidzMusyrif,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: musyrifKeys.tahfidz() }),
  });
}

export function useTahfidzSesi() {
  return useQuery({ queryKey: musyrifKeys.tahfidzSesi(), queryFn: fetchTahfidzSesi, staleTime: 5 * 60 * 1000 });
}

export function useTahfidzSurah() {
  return useQuery({ queryKey: musyrifKeys.tahfidzSurah(), queryFn: fetchTahfidzSurah, staleTime: 5 * 60 * 1000 });
}

export function useTahfidzAyat(surahId?: number) {
  return useQuery({
    queryKey: musyrifKeys.tahfidzAyat(surahId),
    queryFn: () => fetchTahfidzAyat(surahId),
    enabled: Boolean(surahId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTahfidzNilai() {
  return useQuery({ queryKey: musyrifKeys.tahfidzNilai(), queryFn: fetchTahfidzNilai, staleTime: 5 * 60 * 1000 });
}

export function useMusyrifPegawai() {
  return useQuery({ queryKey: musyrifKeys.pegawai(), queryFn: fetchMusyrifPegawai, staleTime: 5 * 60 * 1000 });
}
