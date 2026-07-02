export type RoleKey =
  | "is_guru_quran"
  | "is_petugas_keamanan"
  | "is_musyrif"
  | "is_petugas_pelanggaran"
  | "is_manajer_kesantrian";

export type AuthUser = {
  id: number;
  name: string;
  login: string;
  roles: RoleKey[];
};

export type LoginResponse = {
  user: AuthUser;
};
