import type { LoginCredentials } from "@/features/auth/domain/auth-credentials";
import { authApi } from "@/features/auth/infrastructure/auth-api";
import { persistAuthSession } from "@/lib/storage";

export async function loginUseCase(input: LoginCredentials) {
  const isBypassEnabled = import.meta.env.VITE_AUTH_BYPASS === "true";

  if (!isBypassEnabled) {
    const result = await authApi.login(input);
    return persistAuthSession(result);
  }

  await new Promise((resolve) => window.setTimeout(resolve, 250));

  return persistAuthSession({
    session: {
      userId: 1,
      name: "Development User",
      login: "dev",
      roleFlags: {
        is_guru_quran: true,
        is_musyrif: true,
        is_petugas_keamanan: true,
        is_petugas_pelanggaran: true,
        is_petugas_pelanggaran_pendidik: true,
        is_manajer_kesantrian: true,
      },
      roles: [
        "is_guru_quran",
        "is_musyrif",
        "is_petugas_keamanan",
        "is_petugas_pelanggaran",
        "is_petugas_pelanggaran_pendidik",
        "is_manajer_kesantrian",
      ],
    },
  });
}
