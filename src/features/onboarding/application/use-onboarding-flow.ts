import { useMemo, useState } from "react";
import type { OnboardingSlide } from "@/features/onboarding/domain/onboarding-slide";

export function useOnboardingFlow(slides: OnboardingSlide[]) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];
  const isLastSlide = activeIndex === slides.length - 1;

  return useMemo(
    () => ({
      activeIndex,
      activeSlide,
      isLastSlide,
      goNext: () => setActiveIndex((index) => Math.min(index + 1, slides.length - 1)),
      skip: () => setActiveIndex(slides.length - 1),
      goTo: (index: number) => setActiveIndex(Math.max(0, Math.min(index, slides.length - 1))),
    }),
    [activeIndex, activeSlide, isLastSlide, slides.length],
  );
}
