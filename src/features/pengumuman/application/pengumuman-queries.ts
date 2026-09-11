import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPengumuman, fetchPengumumanDetail, fetchPengumumanList, publishPengumuman } from "../api/pengumuman-api";
import type { PengumumanFormData } from "../domain/pengumuman-types";

export const PENGUMUMAN_QUERY_KEY = "pengumuman";

export function usePengumumanList(filter?: { kategori?: string; state?: string }) {
  return useQuery({
    queryKey: [PENGUMUMAN_QUERY_KEY, filter?.kategori ?? "semua", filter?.state ?? "all"],
    queryFn: () => fetchPengumumanList(filter),
  });
}

export function usePengumumanDetail(id: number) {
  return useQuery({
    queryKey: [PENGUMUMAN_QUERY_KEY, id],
    queryFn: () => fetchPengumumanDetail(id),
    enabled: Boolean(id),
  });
}

export function useCreatePengumuman() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: PengumumanFormData) => createPengumuman(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PENGUMUMAN_QUERY_KEY] });
    },
  });
}

export function usePublishPengumuman() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => publishPengumuman(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PENGUMUMAN_QUERY_KEY] });
    },
  });
}
