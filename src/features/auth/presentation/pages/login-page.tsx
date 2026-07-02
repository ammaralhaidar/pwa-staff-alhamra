import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, HelpCircle, X } from "lucide-react";
import { loginUseCase } from "@/features/auth/application/login-use-case";
import type { LoginCredentials } from "@/features/auth/domain/auth-credentials";
import { AuthPrimaryButton } from "@/features/auth/presentation/components/auth-primary-button";
import { AuthShell } from "@/features/auth/presentation/components/auth-shell";
import { AuthTextField } from "@/features/auth/presentation/components/auth-text-field";
import { loginSchema } from "@/lib/validators/auth";
import { appAssets } from "@/shared/assets/app-assets";

export function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const usernameValue = useWatch({
    control: form.control,
    name: "username",
  });

  async function handleSubmit(credentials: LoginCredentials) {
    setSubmitError(null);

    try {
      await loginUseCase(credentials);
      navigate("/roles");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Login belum bisa diproses.");
    }
  }

  return (
    <AuthShell>
      <form className="flex w-full flex-col items-center" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <img
          src={appAssets.brandLogo}
          alt="IBS Al Hamra"
          className="h-auto w-[200px] md:w-[230px]"
        />

        <div className="mt-12 w-full space-y-5 md:mt-14">
          <AuthTextField
            label="Email"
            type="text"
            inputMode="email"
            autoComplete="username"
            placeholder="Masukkan email atau username"
            error={form.formState.errors.username?.message}
            rightSlot={
              usernameValue ? (
                <button
                  type="button"
                  aria-label="Hapus email"
                  className="ml-3 rounded-full p-1 text-[#9ca3af] transition hover:text-[#4b5563]"
                  onClick={() => form.setValue("username", "", { shouldValidate: true })}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              ) : null
            }
            {...form.register("username")}
          />

          <AuthTextField
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Masukkan password"
            error={form.formState.errors.password?.message}
            rightSlot={
              <button
                type="button"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="ml-3 rounded-full p-1 text-[#9ca3af] transition hover:text-[#4b5563]"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
              </button>
            }
            {...form.register("password")}
          />
        </div>

        {submitError ? (
          <p className="mt-5 w-full rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
            {submitError}
          </p>
        ) : null}

        <div className="mt-10 flex w-full justify-center">
          <AuthPrimaryButton type="submit" isLoading={form.formState.isSubmitting}>
            Login
          </AuthPrimaryButton>
        </div>

        <button
          type="button"
          onClick={() => navigate("/help")}
          className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-500 underline-offset-4 transition hover:text-alhamra-blue hover:underline"
        >
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
          Bantuan
        </button>
      </form>
    </AuthShell>
  );
}
