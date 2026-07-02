
import { AlertCircle, BookOpen, GraduationCap, Heart, Shield, ShieldCheck, Trophy, Users } from "lucide-react";
import type { AppRole, RoleIconName } from "@/features/roles/domain/role";

const roleIcons: Record<RoleIconName, typeof BookOpen> = {
  book: BookOpen,
  graduation: GraduationCap,
  users: Users,
  shield: Shield,
  trophy: Trophy,
  alert: AlertCircle,
  heart: Heart,
  admin: ShieldCheck,
};

type RoleCardProps = {
  role: AppRole;
  onSelect: (role: AppRole) => void;
};

export function RoleCard({ role, onSelect }: RoleCardProps) {
  const Icon = roleIcons[role.icon];

  return (
    <button
      type="button"
      onClick={() => onSelect(role)}
      className="group flex min-h-[76px] w-full items-center rounded-2xl px-4 py-4 text-left text-white shadow-[0_8px_16px_rgba(15,23,42,0.16)] transition duration-200 active:scale-[0.985] md:min-h-[86px] md:px-5"
      style={{
        background: `linear-gradient(135deg, ${role.gradient[0]}, ${role.gradient[1]})`,
        boxShadow: `0 8px 16px ${role.gradient[0]}55`,
      }}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 md:h-12 md:w-12">
        <Icon className="h-6 w-6 stroke-[2.1]" aria-hidden="true" />
      </span>
      <span className="ml-4 min-w-0">
        <span className="block text-[15px] font-bold leading-tight md:text-base">{role.title}</span>
        <span className="mt-1 block text-[12px] font-medium leading-tight text-white/90 md:text-[13px]">{role.subtitle}</span>
      </span>
    </button>
  );
}