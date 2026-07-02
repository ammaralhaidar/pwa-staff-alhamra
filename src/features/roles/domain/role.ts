export type RoleKey =
  | "is_guru_quran"
  | "is_musyrif"
  | "is_petugas_keamanan"
  | "is_petugas_pelanggaran"
  | "is_petugas_pelanggaran_pendidik"
  | "is_manajer_kesantrian";

export type RoleIconName =
  | "book"
  | "graduation"
  | "users"
  | "shield"
  | "trophy"
  | "alert"
  | "heart"
  | "admin";

export type AppRole = {
  title: string;
  subtitle: string;
  gradient: [string, string];
  icon: RoleIconName;
  route: string;
  odooKey: RoleKey;
  alternateOdooKeys?: RoleKey[];
};

export type UserRoleFlags = Partial<Record<RoleKey, boolean>>;
