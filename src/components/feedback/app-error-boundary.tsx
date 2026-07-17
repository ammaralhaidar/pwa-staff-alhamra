import { Component, type ErrorInfo, type ReactNode } from "react";
import { ArrowLeft, Home, RefreshCw, TriangleAlert } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { getLastActiveRoleRoute } from "@/lib/storage";

interface ErrorBoundaryState {
  error: Error | null;
}

interface ErrorBoundaryCoreProps {
  children: ReactNode;
  renderFallback: (error: Error, reset: () => void) => ReactNode;
}

class ErrorBoundaryCore extends Component<ErrorBoundaryCoreProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[app-error-boundary] Halaman gagal dirender", error, info.componentStack);
    }
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return this.props.renderFallback(this.state.error, this.reset);
    }

    return this.props.children;
  }
}

export function AppErrorBoundary({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <ErrorBoundaryCore
      key={location.key}
      renderFallback={(error, reset) => (
        <main className="mx-auto flex min-h-svh w-full max-w-[430px] items-center justify-center bg-[#EFF6FF] px-5 py-10">
          <section className="w-full rounded-[28px] border border-red-100 bg-white px-6 py-8 text-center shadow-sm">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <TriangleAlert className="size-7" aria-hidden="true" />
            </span>

            <h1 className="mt-5 text-lg font-bold text-slate-900">Halaman gagal ditampilkan</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Terjadi kendala saat membuka halaman ini. Silakan muat ulang web atau kembali ke halaman sebelumnya.
            </p>

            {import.meta.env.DEV ? (
              <pre className="mt-4 max-h-28 overflow-auto rounded-xl bg-slate-50 p-3 text-left text-[11px] leading-4 text-red-600">
                {error.message}
              </pre>
            ) : null}

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#288DE5] text-sm font-semibold text-white shadow-sm active:scale-[0.99]"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Muat Ulang
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 active:scale-[0.99]"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    navigate(getLastActiveRoleRoute() ?? "/roles", { replace: true });
                  }}
                  className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 active:scale-[0.99]"
                >
                  <Home className="size-4" aria-hidden="true" />
                  Halaman Utama
                </button>
              </div>
            </div>
          </section>
        </main>
      )}
    >
      {children}
    </ErrorBoundaryCore>
  );
}
