
import type { ReactNode } from "react";
import { appAssets } from "@/shared/assets/app-assets";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth-stage relative min-h-svh overflow-hidden bg-white">
      <img
        src={appAssets.loginBackground}
        alt=""
        className="absolute inset-0 h-full w-full object-cover md:hidden"
      />

      <div className="auth-desktop-bg absolute inset-0 hidden md:block" aria-hidden="true" />
      <div className="auth-desktop-accent auth-desktop-accent-top hidden md:block" aria-hidden="true" />
      <div className="auth-desktop-accent auth-desktop-accent-bottom hidden md:block" aria-hidden="true" />

      <section className="relative z-10 flex min-h-svh items-center justify-center px-7 py-10 md:px-10">
        <div className="auth-form-surface w-full max-w-[360px] md:max-w-[420px]">{children}</div>
      </section>
    </main>
  );
}