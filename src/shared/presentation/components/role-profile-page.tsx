import type { ReactNode } from "react";
import { Briefcase, ChevronRight, HelpCircle, Key, LogOut, Mail, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { InfoRow } from "@/components/data-display/info-row";
import { clearAuthSession, initialsFromName, resolveStoredProfile } from "@/lib/storage";

interface RoleProfilePageProps {
  title: string;
  role: string;
  fallbackName: string;
  fallbackEmail?: string;
  fallbackInitial?: string;
  avatarColor?: string;
  fallbackNotice?: string;
}

export function RoleProfilePage({
  title,
  role,
  fallbackName,
  fallbackEmail = "Email belum tersedia",
  fallbackInitial = "U",
  avatarColor = "#A13A52",
  fallbackNotice = "Data session pengguna belum lengkap. Menampilkan fallback sementara.",
}: RoleProfilePageProps) {
  const navigate = useNavigate();
  const storedProfile = resolveStoredProfile();
  const name = storedProfile.name || fallbackName;
  const email = storedProfile.email || fallbackEmail;
  const roleLabel = storedProfile.role || role;
  const initials = initialsFromName(name, fallbackInitial);

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  return (
    <div className="flex flex-col bg-[#F9FAFB] pb-6">
      <div className="relative flex flex-col items-center overflow-hidden rounded-b-[28px] bg-gradient-to-b from-[#288DE5] to-[#1B6FB7] px-6 pb-8 pt-6 text-white">
        <div className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute left-4 top-1/3 h-24 w-24 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute right-8 bottom-4 h-32 w-32 rounded-full bg-white/10" />

        <h1 className="relative z-10 w-full self-start text-left text-lg font-bold">{title}</h1>
        <div
          className="relative z-10 mt-2 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white text-3xl font-medium text-white shadow-md"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        <h2 className="relative z-10 mt-4 text-xl font-bold">{name}</h2>
        <p className="relative z-10 mt-1 text-xs font-medium text-white/70">{roleLabel}</p>
      </div>

      <main className="flex-1 px-5 pt-6">
        <section className="mb-6">
          <SectionTitle>Informasi Pribadi</SectionTitle>
          <div className="mt-2 rounded-2xl border border-[#EAECF0] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="space-y-4">
              {!storedProfile.hasSessionData ? (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">{fallbackNotice}</p>
              ) : null}
              <InfoRow icon={<User className="h-5 w-5 text-[#288DE5]" />} label="Nama" value={name} />
              <InfoRow icon={<Mail className="h-5 w-5 text-[#288DE5]" />} label="Email" value={email} />
              <InfoRow icon={<Briefcase className="h-5 w-5 text-[#288DE5]" />} label="Role" value={roleLabel} />
            </div>
          </div>
        </section>

        <section className="mb-8">
          <SectionTitle>Pengaturan</SectionTitle>
          <div className="mt-2 rounded-2xl border border-[#EAECF0] bg-white px-2 py-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <SettingRow icon={<Key className="h-5 w-5 text-[#288DE5]" />} label="Ubah Password" />
            <div className="mx-4 h-px bg-gray-100" />
            <SettingRow icon={<HelpCircle className="h-5 w-5 text-[#288DE5]" />} label="Bantuan" />
          </div>
        </section>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-[#EF4444] bg-white py-3.5 text-base font-semibold text-[#EF4444] transition active:scale-[0.98] active:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          Keluar
        </button>
      </main>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      <div className="h-5 w-1 rounded bg-[#288DE5]" />
      <h3 className="text-[17px] font-bold text-[#101828]">{children}</h3>
    </div>
  );
}

function SettingRow({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button type="button" className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left transition active:bg-gray-50">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F0F9FF]">{icon}</div>
      <span className="flex-1 text-[15px] font-semibold text-[#344054]">{label}</span>
      <ChevronRight className="h-5 w-5 text-[#98A2B3]" />
    </button>
  );
}
