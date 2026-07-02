
import { BrandMark } from "@/features/onboarding/presentation/components/brand-mark";
import { appAssets } from "@/shared/assets/app-assets";

export function OnboardingBackground({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="absolute inset-x-0 top-0 h-[42svh] min-h-[300px] overflow-hidden bg-alhamra-blue md:h-[43svh] md:min-h-[360px]">
      <img src={appAssets.mosqueBackground} alt="Gedung IBS Al Hamra" className="absolute inset-0 h-full w-full object-cover object-top" />
      <div className="absolute inset-0 bg-alhamra-blue/45" />
      <div className="absolute left-5 top-8 z-10 md:left-[calc(50%-280px)] md:top-10">
        <BrandMark compact />
      </div>
      <button type="button" onClick={onSkip} className="absolute right-7 top-10 z-10 text-sm font-bold text-white md:right-[calc(50%-280px)] md:text-base">
        Lewati
      </button>
    </div>
  );
}