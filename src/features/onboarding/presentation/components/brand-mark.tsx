
import { appAssets } from "@/shared/assets/app-assets";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "relative h-11 w-28" : "relative h-32 w-80 max-w-[82vw]"}>
      <img src={appAssets.brandLogo} alt="IBS Al Hamra" className="absolute inset-0 h-full w-full object-contain" />
    </div>
  );
}