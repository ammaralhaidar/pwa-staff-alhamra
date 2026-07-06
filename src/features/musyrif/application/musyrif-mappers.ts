import type {
  Mutabaah,
  MutabaahActivity,
  MutabaahSesi,
  MusyrifPerijinan,
  MusyrifPerijinanStatus,
  MusyrifStudent,
  TahfidzMasterOption,
  TahfidzMusyrif,
  WalletBalance,
  WalletHistory,
  WalletHistoryType,
} from "../domain/musyrif-types";

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown): RawRecord {
  return isRecord(value) ? value : {};
}

function nested(source: RawRecord, keys: string[]): RawRecord {
  for (const key of keys) {
    if (isRecord(source[key])) return source[key] as RawRecord;
  }
  return {};
}

function arrayFrom(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];
  const candidates = [value.data, value.result, value.records, value.items, value.list];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    if (isRecord(candidate)) {
      const nestedArray = arrayFrom(candidate);
      if (nestedArray.length) return nestedArray;
    }
  }
  return [];
}

export function unwrapOdooData(value: unknown): unknown {
  const root = record(value);
  const first = root.result ?? value;
  const second = isRecord(first) ? first.result ?? first.data ?? first.records ?? first : first;
  if (isRecord(second)) return second.result ?? second.data ?? second.records ?? second;
  return second;
}

function text(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function numberValue(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return 0;
}

function idFrom(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (Array.isArray(value) && typeof value[0] === "number") return value[0];
  if (isRecord(value)) return numberValue(value.id) || undefined;
  return undefined;
}

function labelFromRelation(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return text(value[1], value[0]);
  if (isRecord(value)) return text(value.name, value.nama, value.display_name);
  return "";
}

function boolValue(...values: unknown[]): boolean {
  for (const value of values) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value > 0;
    if (typeof value === "string" && value.trim()) {
      return ["true", "1", "yes", "ya", "set", "aktif"].includes(value.toLowerCase());
    }
  }
  return false;
}

export function normalizePerijinanStatus(value: unknown): MusyrifPerijinanStatus {
  const state = text(value).toLowerCase();
  if (["approved", "approve", "disetujui"].includes(state)) return "approve";
  if (["rejected", "reject", "ditolak"].includes(state)) return "reject";
  if (["checked", "check", "validasi"].includes(state)) return "check";
  if (["out", "keluar"].includes(state)) return "keluar";
  if (["return", "returned", "kembali"].includes(state)) return "kembali";
  if (["done", "selesai"].includes(state)) return "selesai";
  return "draft";
}

export function mapPerijinan(item: unknown): MusyrifPerijinan {
  const raw = record(item);
  const siswa = nested(raw, ["siswa", "santri", "student", "siswa_id"]);
  const detail = nested(raw, ["detail", "perizinan", "izin"]);
  const penjemputan = nested(raw, ["penjemputan", "jemput"]);
  const realisasi = nested(raw, ["realisasi", "security"]);
  const status = normalizePerijinanStatus(raw.state ?? raw.status ?? detail.state);
  const id = numberValue(raw.id, raw.izin_id, detail.id);

  return {
    id,
    name: text(raw.name, raw.nomor, raw.reference, `IZIN-${id}`),
    santriId: idFrom(raw.siswa_id ?? raw.santri_id ?? siswa.id),
    santriName: text(raw.siswa_name, raw.nama_siswa, raw.santri_name, siswa.name, siswa.nama, labelFromRelation(raw.siswa_id), "Santri"),
    nis: text(raw.nis, siswa.nis),
    kelas: text(raw.kelas, siswa.kelas, siswa.class_name),
    kamar: text(raw.kamar, raw.room, siswa.kamar),
    halaqoh: text(raw.halaqoh, siswa.halaqoh),
    status,
    statusLabel: text(raw.status_label, raw.state_label, raw.status, status),
    tanggalIzin: text(raw.tanggal_izin, raw.tanggal_ijin, raw.tgl_izin, raw.tgl_ijin, raw.date_from, detail.tanggal_izin, detail.tgl_ijin),
    tanggalKembali: text(raw.tanggal_kembali, raw.tgl_kembali, raw.date_to, detail.tanggal_kembali, detail.tgl_kembali),
    jamKeluar: text(raw.jam_keluar, raw.jam_penjemputan, penjemputan.jam_penjemputan, realisasi.jam_keluar),
    jamKembali: text(raw.jam_kembali, realisasi.jam_kembali),
    durasi: text(raw.durasi, raw.duration, detail.durasi),
    penjemput: text(raw.penjemput, raw.nama_penjemput, penjemputan.penjemput, penjemputan.nama),
    keperluan: text(raw.keperluan, raw.alasan, raw.reason, detail.keperluan),
    catatan: text(raw.catatan, raw.note, detail.catatan),
    managerNote: text(raw.manager_note, raw.catatan_manager, raw.alasan_tolak),
    waktuKeluar: text(raw.waktu_keluar, realisasi.waktu_keluar),
    waktuKembali: text(raw.waktu_kembali, realisasi.waktu_kembali),
    alasanTolak: text(raw.alasan_tolak, raw.reject_reason),
  };
}

export function mapPerijinanList(value: unknown): MusyrifPerijinan[] {
  return arrayFrom(unwrapOdooData(value)).map(mapPerijinan).filter((item) => item.id > 0);
}

export function mapStudent(item: unknown): MusyrifStudent {
  const raw = record(item);
  const data = record(raw.data ?? raw.result ?? raw);
  const source = Object.keys(data).length ? data : raw;
  const siswa = nested(raw, ["siswa", "santri", "student"]);
  const header = nested(source, ["header", "siswa", "santri"]);
  const akademik = nested(source, ["akademik", "academic"]);
  const biodata = nested(source, ["biodata", "bio"]);
  const alamat = nested(source, ["alamat", "address"]);
  const keuangan = nested(source, ["keuangan", "finance", "wallet"]);
  const orangTua = nested(source, ["orang_tua", "orangTua", "parents"]);
  const ayah = nested(orangTua, ["ayah", "father"]);
  const ibu = nested(orangTua, ["ibu", "mother"]);
  const wali = nested(orangTua, ["wali", "guardian"]);
  const id = numberValue(source.id, raw.id, source.siswa_id, raw.siswa_id, header.id, siswa.id);
  const name = text(source.name, source.nama, source.siswa_name, header.name, header.nama, siswa.name, "Santri");
  const finance = {
    virtualAccount: text(source.virtual_account, source.virtualAccount, keuangan.virtual_account),
    noVaUangSaku: text(source.va_saku, source.no_va_uang_saku, keuangan.va_saku),
    saldoUangSaku: numberValue(source.saldo_uang_saku, source.uang_saku, source.saldoSaku, keuangan.saldo_uang_saku),
    saldoDompet: numberValue(source.saldo_dompet, source.wallet_balance, source.dompet, source.saldoDompet, keuangan.wallet_balance),
    pinDompet: text(source.pin_dompet, keuangan.pin_dompet) || null,
    hasPinSet: boolValue(source.has_pin, source.hasPinSet, keuangan.has_pin) || Boolean(text(source.pin_dompet, keuangan.pin_dompet)),
  };

  return {
    id,
    name,
    nis: text(source.nis, akademik.nis, siswa.nis),
    kelas: text(source.kelas, source.class_name, akademik.kelas, siswa.kelas),
    kamar: text(source.kamar, source.room, akademik.kamar, siswa.kamar),
    wali: text(source.wali, source.wali_santri, source.parent_name, wali.name, wali.nama),
    phone: text(source.phone, source.no_hp, source.mobile, wali.phone, ayah.phone, ibu.phone),
    avatar: text(source.avatar, source.image_url),
    saldoUangSaku: finance.saldoUangSaku,
    saldoDompet: finance.saldoDompet,
    virtualAccount: finance.virtualAccount,
    noVaUangSaku: finance.noVaUangSaku,
    pinDompet: finance.pinDompet,
    hasPinSet: finance.hasPinSet,
    detail: {
      academic: {
        nis: text(source.nis, akademik.nis),
        nisn: text(source.nisn, akademik.nisn),
        kelas: text(source.kelas, akademik.kelas),
        kamar: text(source.kamar, akademik.kamar),
        halaqoh: text(source.halaqoh, akademik.halaqoh),
        musyrif: text(source.musyrif, source.musyrif_name, akademik.musyrif),
        tahunAjaran: text(source.tahun_ajaran, akademik.tahun_ajaran),
        jenjang: text(source.jenjang, akademik.jenjang),
        tingkat: text(source.tingkat, akademik.tingkat),
        jurusan: text(source.jurusan, akademik.jurusan),
      },
      biodata: {
        namaLengkap: name,
        namaPanggilan: text(source.nama_panggilan, biodata.nama_panggilan, biodata.panggilan),
        tempatLahir: text(source.tempat_lahir, source.tmp_lahir, biodata.tempat_lahir, biodata.tmp_lahir),
        tanggalLahir: text(source.tanggal_lahir, source.tgl_lahir, biodata.tanggal_lahir, biodata.tgl_lahir),
        jenisKelamin: text(source.jenis_kelamin, source.jk, biodata.jenis_kelamin, biodata.jk),
        golonganDarah: text(source.golongan_darah, biodata.gol_darah, biodata.golongan_darah),
        agama: text(source.agama, biodata.agama),
        anakKe: text(source.anak_ke, biodata.anak_ke),
        jumlahSaudara: text(source.jumlah_saudara, biodata.jml_saudara, biodata.jumlah_saudara),
        hobi: text(source.hobi, biodata.hobi),
        citaCita: text(source.cita_cita, biodata.cita_cita),
      },
      address: {
        alamat: text(source.alamat, source.alamat_rumah, alamat.alamat, alamat.jalan),
        rtRw: text(source.rt_rw, alamat.rt_rw),
        kelurahan: text(source.kelurahan, alamat.kelurahan),
        kecamatan: text(source.kecamatan, alamat.kecamatan),
        kota: text(source.kota, alamat.kota),
        provinsi: text(source.provinsi, source.propinsi, alamat.provinsi, alamat.propinsi),
        kodePos: text(source.kode_pos, source.kodepos, alamat.kode_pos, alamat.kodepos),
      },
      parents: {
        ayah: text(ayah.name, ayah.nama, source.nama_ayah),
        ibu: text(ibu.name, ibu.nama, source.nama_ibu),
        wali: text(wali.name, wali.nama, source.nama_wali),
        hubunganWali: text(wali.hubungan, source.hubungan_wali),
        phone: text(wali.phone, ayah.phone, ibu.phone, source.phone),
      },
      finance,
      tahfidz: {
        text: text(source.tahfidz_terakhir, akademik.tahfidz_terakhir),
      },
    },
  };
}

export function mapStudentList(value: unknown): MusyrifStudent[] {
  return arrayFrom(unwrapOdooData(value)).map(mapStudent).filter((item) => item.id > 0);
}

export function mapWalletBalance(value: unknown, santriId: number): WalletBalance {
  const raw = record(unwrapOdooData(value));
  const pinDompet = text(raw.pin_dompet) || null;
  return {
    santriId,
    uangSaku: numberValue(raw.uang_saku, raw.saldo_uang_saku, raw.saku, raw.sisa_uang_saku),
    dompet: numberValue(raw.dompet, raw.saldo_dompet, raw.wallet, raw.wallet_balance, raw.saldo_dompet_baru),
    pinDompet,
    hasPinSet: boolValue(raw.has_pin) || Boolean(pinDompet),
  };
}

export function mapWalletHistory(value: unknown, type: WalletHistoryType): WalletHistory[] {
  return arrayFrom(unwrapOdooData(value)).map((item) => {
    const raw = record(item);
    const amount = numberValue(raw.amount, raw.nominal, raw.debit, raw.credit);
    const typeText = text(raw.type, raw.jenis, raw.direction).toLowerCase();
    const kind = typeText.includes("keluar") || typeText.includes("out") || amount < 0 ? "out" : "in";
    return {
      id: numberValue(raw.id) || Math.abs(amount),
      type,
      title: text(raw.name, raw.title, raw.ket, raw.keterangan, kind === "in" ? "Dana masuk" : "Dana keluar"),
      description: text(raw.description, raw.note, raw.catatan, raw.ket),
      amount: Math.abs(amount),
      date: text(raw.date, raw.tanggal, raw.create_date),
      kind,
      reference: text(raw.reference, raw.ref, raw.no_transaksi),
    };
  });
}

export function mapSesiList(value: unknown): MutabaahSesi[] {
  return arrayFrom(unwrapOdooData(value)).map((item) => {
    const raw = record(item);
    return {
      id: numberValue(raw.id),
      name: text(raw.name, raw.nama, raw.sesi, "Sesi"),
      jamMulai: text(raw.jam_mulai, raw.jamMulai),
      jamSelesai: text(raw.jam_selesai, raw.jamSelesai),
    };
  }).filter((item) => item.id > 0);
}

export function mapActivityList(value: unknown): MutabaahActivity[] {
  return arrayFrom(unwrapOdooData(value)).map((item) => {
    const raw = record(item);
    return {
      id: numberValue(raw.id),
      name: text(raw.name, raw.nama, raw.aktivitas, "Aktivitas"),
      kategori: text(raw.kategori, raw.category),
      skor: numberValue(raw.skor, raw.score, 1) || 1,
    };
  }).filter((item) => item.id > 0);
}

export function mapMutabaahList(value: unknown): Mutabaah[] {
  return arrayFrom(unwrapOdooData(value)).map((item) => {
    const raw = record(item);
    const siswa = nested(raw, ["siswa", "santri"]);
    const scoreDisplay = text(raw.skor_display, raw.score_display);
    const scoreParts = scoreDisplay.match(/(\d+)\s*(?:dari|\/)\s*(\d+)/i);
    return {
      id: numberValue(raw.id, raw.mutabaah_id),
      name: text(raw.name, raw.reference, raw.no_ref, raw.nomor, raw.mutabaah_id ? `PR/${raw.mutabaah_id}` : "Mutabaah"),
      santriId: idFrom(raw.siswa_id ?? siswa.id),
      santriName: text(raw.siswa_name, raw.santri_name, siswa.name, labelFromRelation(raw.siswa_id), "Santri"),
      kelas: text(raw.kelas, raw.class_name, siswa.kelas, siswa.class_name),
      sesiName: text(raw.sesi_name, labelFromRelation(raw.sesi_id)),
      tanggal: text(raw.tgl, raw.tanggal, raw.date),
      totalSkor: numberValue(raw.total_skor, raw.skor, raw.score, scoreParts?.[1]),
      maxSkor: numberValue(raw.max_skor, raw.total_max, raw.max_score, scoreParts?.[2], raw.total_skor, 100),
      catatan: text(raw.catatan, raw.note),
    };
  }).filter((item) => item.id > 0);
}

export function mapTahfidzOptionList(value: unknown): TahfidzMasterOption[] {
  return arrayFrom(unwrapOdooData(value)).map((item) => {
    const raw = record(item);
    const number = numberValue(raw.number);
    const ayatNumber = numberValue(raw.ayat, raw.nomor_ayat);
    const rawName = text(
      raw.name,
      raw.nama,
      raw.display_name,
      ayatNumber ? `Ayat ${ayatNumber}` : undefined,
      number ? `Pilihan ${number}` : undefined,
      "Pilihan",
    );
    return {
      id: numberValue(raw.id),
      name: number && raw.name ? `${number}. ${rawName}` : rawName,
      halaman: numberValue(raw.halaman, raw.page) || undefined,
      ayat: numberValue(raw.jml_ayat, raw.jumlah_ayat, raw.total_ayat, raw.ayat, raw.nomor_ayat) || undefined,
    };
  }).filter((item) => item.id > 0);
}

export function mapTahfidzList(value: unknown): TahfidzMusyrif[] {
  return arrayFrom(unwrapOdooData(value)).map((item) => {
    const raw = record(item);
    return {
      id: numberValue(raw.id),
      name: text(raw.name, raw.reference, "Tahfidz"),
      santriName: text(raw.siswa_name, raw.santri_name, labelFromRelation(raw.siswa_id)),
      tanggal: text(raw.tanggal, raw.date),
      sesiName: text(raw.sesi_name, labelFromRelation(raw.sesi_id)),
      ustadzName: text(raw.ustadz_name, labelFromRelation(raw.ustadz_id)),
      surahName: text(raw.surah, raw.surah_name, labelFromRelation(raw.surah_id)),
      ayat: text(raw.ayat, raw.ayat_range, raw.range_ayat),
      ayatAwal: text(raw.ayat_awal, labelFromRelation(raw.ayat_awal_id)),
      ayatAkhir: text(raw.ayat_akhir, labelFromRelation(raw.ayat_akhir_id)),
      nilai: text(raw.nilai, labelFromRelation(raw.nilai_id)),
      status: text(raw.state, raw.status),
      keterangan: text(raw.keterangan, raw.catatan),
    };
  }).filter((item) => item.id > 0);
}
