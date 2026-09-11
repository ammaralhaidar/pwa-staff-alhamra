export type PengumumanKategori = "kesantrian" | "akademik" | "keuangan" | "umum";
export type PengumumanTarget = "semua" | "calon_ortu" | "ortu";
export type PengumumanState = "draft" | "published";


export interface Pengumuman {
  id: number;
  title: string;
  kategori: PengumumanKategori;
  kategoriLabel: string;
  targetAudience: PengumumanTarget;
  targetAudienceLabel: string;
  tanggalBuat?: string | null;
  tanggal: string | null;
  isPinned: boolean;
  authorName: string;
  publisherName?: string | null;
  coverImageUrl?: string | null;
  preview?: string;
  deskripsi?: string;
  state?: PengumumanState;
}

export interface PengumumanFormData {
  id?: number;
  name: string;
  kategori: PengumumanKategori;
  target_audience: PengumumanTarget;
  deskripsi: string;
  is_pinned: boolean;
  state: PengumumanState;
  cover_image?: string;
}

export interface PengumumanFilter {
  search: string;
  kategori: string;
  state: string; // "all" | "published" | "draft"
}
