import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BrandMark } from "@/features/onboarding/presentation/components/brand-mark";

export function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      sessionStorage.setItem("alhamra:from-splash", "1");
      navigate("/onboarding", { replace: true });
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="phone-stage grid place-items-center">
      <div className="splash-logo-motion" aria-label="IBS Al Hamra loading">
        <BrandMark />
      </div>
    </main>
  );
}
