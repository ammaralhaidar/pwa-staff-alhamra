import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  confirmTahfidzAttendance,
  createTahfidzAttendance,
  fetchAyatList,
  fetchHalaqohList,
  fetchNilaiList,
  fetchSesiList,
  fetchSurahList,
  fetchTahfidzDraftDetail,
  fetchTahfidzHistoryDetail,
  fetchTahfidzHistorySessions,
  fetchTahfidzStudents,
  fetchUstadzList,
  submitTahfidzScore,
} from "../api/guru-quran-api";

export const guruQuranKeys = {
  all: ["guru-quran"] as const,
  master: () => [...guruQuranKeys.all, "master"] as const,
  halaqoh: () => [...guruQuranKeys.master(), "halaqoh"] as const,
  sesi: () => [...guruQuranKeys.master(), "sesi"] as const,
  ustadz: (halaqohId?: number) => [...guruQuranKeys.master(), "ustadz", halaqohId ?? "all"] as const,
  sessions: (halaqohId?: number) => [...guruQuranKeys.all, "sessions", halaqohId ?? "none"] as const,
  students: (absenId: number) => [...guruQuranKeys.all, "students", absenId] as const,
  surah: () => [...guruQuranKeys.master(), "surah"] as const,
  ayat: (surahId?: number) => [...guruQuranKeys.master(), "ayat", surahId ?? "none"] as const,
  nilai: () => [...guruQuranKeys.master(), "nilai"] as const,
  draftDetail: (params: { halaqohId?: number; sesiId?: number; tanggal?: string; tahfidzId?: number }) =>
    [...guruQuranKeys.all, "draft-detail", params.halaqohId ?? 0, params.sesiId ?? 0, params.tanggal ?? "", params.tahfidzId ?? 0] as const,
  historyDetail: (tahfidzId: number) => [...guruQuranKeys.all, "history-detail", tahfidzId] as const,
};

export function useHalaqohList() {
  return useQuery({
    queryKey: guruQuranKeys.halaqoh(),
    queryFn: fetchHalaqohList,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSesiList() {
  return useQuery({
    queryKey: guruQuranKeys.sesi(),
    queryFn: fetchSesiList,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUstadzList(halaqohId?: number) {
  return useQuery({
    queryKey: guruQuranKeys.ustadz(halaqohId),
    queryFn: () => fetchUstadzList(halaqohId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTahfidzHistorySessions(halaqohId?: number) {
  return useQuery({
    queryKey: guruQuranKeys.sessions(halaqohId),
    queryFn: () => fetchTahfidzHistorySessions({ halaqohId: halaqohId ?? 0 }),
    enabled: Boolean(halaqohId),
  });
}

export function useTahfidzStudents(absenId: number) {
  return useQuery({
    queryKey: guruQuranKeys.students(absenId),
    queryFn: () => fetchTahfidzStudents(absenId),
    enabled: absenId > 0,
  });
}

export function useSurahList() {
  return useQuery({
    queryKey: guruQuranKeys.surah(),
    queryFn: fetchSurahList,
    staleTime: 30 * 60 * 1000,
  });
}

export function useAyatList(surahId?: number) {
  return useQuery({
    queryKey: guruQuranKeys.ayat(surahId),
    queryFn: () => fetchAyatList(surahId ?? 0),
    enabled: Boolean(surahId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useNilaiList() {
  return useQuery({
    queryKey: guruQuranKeys.nilai(),
    queryFn: fetchNilaiList,
    staleTime: 30 * 60 * 1000,
  });
}

export function useTahfidzDraftDetail(params: {
  halaqohId?: number;
  sesiId?: number;
  tanggal?: string;
  tahfidzId?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: guruQuranKeys.draftDetail(params),
    queryFn: () => fetchTahfidzDraftDetail({
      halaqohId: params.halaqohId ?? 0,
      sesiId: params.sesiId ?? 0,
      tanggal: params.tanggal ?? "",
      tahfidzId: params.tahfidzId ?? 0,
    }),
    enabled: Boolean(params.enabled && params.halaqohId && params.sesiId && params.tanggal && params.tahfidzId),
  });
}

export function useTahfidzHistoryDetail(tahfidzId: number, enabled = true) {
  return useQuery({
    queryKey: guruQuranKeys.historyDetail(tahfidzId),
    queryFn: () => fetchTahfidzHistoryDetail(tahfidzId),
    enabled: enabled && tahfidzId > 0,
  });
}

export function useCreateTahfidzAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTahfidzAttendance,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: guruQuranKeys.all }),
  });
}

export function useConfirmTahfidzAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmTahfidzAttendance,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: guruQuranKeys.all }),
  });
}

export function useSubmitTahfidzScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitTahfidzScore,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: guruQuranKeys.all });
      queryClient.invalidateQueries({ queryKey: guruQuranKeys.historyDetail(variables.tahfidz_id) });
    },
  });
}
