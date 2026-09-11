import type { Pengumuman } from "../domain/pengumuman-types";

const TARGET_LABELS: Record<string, string> = {
  semua: "Semua",
  calon_ortu: "Calon Santri",
  ortu: "Santri Aktif",
};

export function mapPengumumanFromDto(dto: any): Pengumuman {
  const target = dto.target_audience || "ortu";
  return {
    id: dto.id,
    title: dto.title || dto.name || "Tanpa Judul",
    kategori: dto.kategori || "umum",
    kategoriLabel: dto.kategori_label || dto.kategori || "Umum",
    targetAudience: target,
    targetAudienceLabel: TARGET_LABELS[target] || dto.target_audience_label || "Santri Aktif",
    tanggalBuat: dto.tanggal_buat || null,
    tanggal: dto.tanggal || null,
    isPinned: Boolean(dto.is_pinned),
    authorName: dto.author_name || "Administrator",
    publisherName: dto.publisher_name || null,
    coverImageUrl: dto.cover_image_url || null,
    preview: dto.preview || "",
    deskripsi: dto.deskripsi || "",
    state: dto.state || "published",
  };
}

