import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboardingFlow } from "@/features/onboarding/application/use-onboarding-flow";
import { onboardingSlides } from "@/features/onboarding/infrastructure/onboarding-slides";
import { DotIndicator } from "@/features/onboarding/presentation/components/dot-indicator";
import { OnboardingBackground } from "@/features/onboarding/presentation/components/onboarding-background";
import { SlideIllustration } from "@/features/onboarding/presentation/components/slide-illustration";

const FROM_SPLASH_KEY = "alhamra:from-splash";
const ONBOARDING_RELOAD_KEY = "alhamra:onboarding-before-unload";

export function OnboardingScreen() {
  const navigate = useNavigate();
  const flow = useOnboardingFlow(onboardingSlides);

  useEffect(() => {
    if (sessionStorage.getItem(FROM_SPLASH_KEY) === "1") {
      sessionStorage.removeItem(FROM_SPLASH_KEY);
      sessionStorage.removeItem(ONBOARDING_RELOAD_KEY);
      return;
    }

    if (sessionStorage.getItem(ONBOARDING_RELOAD_KEY) === "1") {
      sessionStorage.removeItem(ONBOARDING_RELOAD_KEY);
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const markBeforeUnload = () => {
      sessionStorage.setItem(ONBOARDING_RELOAD_KEY, "1");
    };

    window.addEventListener("beforeunload", markBeforeUnload);
    return () => window.removeEventListener("beforeunload", markBeforeUnload);
  }, []);

  function handlePrimaryAction() {
    if (flow.isLastSlide) {
      navigate("/login");
      return;
    }

    flow.goNext();
  }

  return (
    <main className="phone-stage relative min-h-[760px]">
      <OnboardingBackground onSkip={() => navigate("/login")} />

      <div className="absolute left-1/2 top-[36svh] z-30 -translate-x-1/2 -translate-y-1/2 md:top-[35svh]">
        <SlideIllustration src={flow.activeSlide.imageSrc} alt={flow.activeSlide.imageAlt} />
      </div>

      <section className="onboarding-curve absolute inset-x-0 top-[29svh] z-10 min-h-[75svh] bg-white px-8 pb-8 pt-[210px] md:top-[28svh] md:px-10 md:pt-[220px]">
        <div className="mx-auto min-h-[188px] max-w-[430px] px-1 text-center text-[15px] font-bold leading-[1.55] text-[#171717] md:max-w-[560px] md:text-[18px] md:leading-[1.6]">
          {flow.activeSlide.body}
        </div>
        <div className="mt-11 md:mt-12">
          <DotIndicator count={onboardingSlides.length} activeIndex={flow.activeIndex} onSelect={flow.goTo} />
        </div>
        <div className="absolute bottom-20 right-8 md:left-1/2 md:right-auto md:-translate-x-1/2">
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="h-11 min-w-32 rounded-3xl bg-alhamra-blue px-7 text-sm font-bold text-white shadow-sm transition active:scale-[0.98] md:h-12 md:min-w-40 md:text-base"
          >
            {flow.isLastSlide ? "Login" : "Lanjutkan"}
          </button>
        </div>
      </section>
    </main>
  );
}