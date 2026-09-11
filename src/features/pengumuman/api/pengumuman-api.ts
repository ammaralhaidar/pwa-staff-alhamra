import { getOdooConfig, getSessionId, postOdoo } from "@/lib/api/odoo-server";
import { mapPengumumanFromDto } from "../application/pengumuman-mappers";
import type { Pengumuman, PengumumanFormData } from "../domain/pengumuman-types";

export async function fetchPengumumanList(filter?: { kategori?: string; state?: string }): Promise<Pengumuman[]> {
  const { baseUrl } = getOdooConfig();
  const params = new URLSearchParams();
  if (filter?.kategori && filter.kategori !== "semua") {
    params.append("kategori", filter.kategori);
  }
  if (filter?.state) {
    params.append("state", filter.state);
  } else {
    params.append("state", "all");
  }

  const sessionId = getSessionId();
  const response = await fetch(`${baseUrl}/api/v1/pengumuman?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(sessionId ? { "X-Session-Id": sessionId } : {}),
    },
    credentials: "include",
  });

  const body = await response.json();
  const rawList = body.data || body.result?.data || [];
  return rawList.map(mapPengumumanFromDto);
}

export async function fetchPengumumanDetail(id: number): Promise<Pengumuman> {
  const { baseUrl } = getOdooConfig();
  const sessionId = getSessionId();
  const response = await fetch(`${baseUrl}/api/v1/pengumuman/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(sessionId ? { "X-Session-Id": sessionId } : {}),
    },
    credentials: "include",
  });

  const body = await response.json();
  const rawData = body.data || body.result?.data;
  return mapPengumumanFromDto(rawData);
}

export async function createPengumuman(formData: PengumumanFormData): Promise<{ id: number; message: string }> {
  const response = await postOdoo<{ result?: { success: boolean; id: number; message: string }; success?: boolean; id?: number; message?: string }>(
    "/api/v1/pegawai/pengumuman",
    formData as unknown as Record<string, unknown>
  );

  return {
    id: response.result?.id ?? response.id ?? 0,
    message: response.result?.message ?? response.message ?? "Pengumuman berhasil disimpan",
  };
}

export async function publishPengumuman(id: number): Promise<{ id: number; message: string }> {
  const response = await postOdoo<{ result?: { success: boolean; id: number; message: string }; success?: boolean; id?: number; message?: string }>(
    `/api/v1/pegawai/pengumuman/${id}/publish`,
    {}
  );

  return {
    id: response.result?.id ?? response.id ?? id,
    message: response.result?.message ?? response.message ?? "Pengumuman berhasil dipublikasikan",
  };
}
