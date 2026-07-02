import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { appAssets } from "@/shared/assets/app-assets";

export function HelpHeader() {
  const navigate = useNavigate();

  return (
    <header className="relative h-[118px] overflow-hidden text-white shadow-[0_7px_14px_rgba(15,23,42,0.24)] md:h-[180px]">
      <img
        src={appAssets.helpHeader}
        alt=""
        className="absolute inset-0 h-full w-full pointer-events-none select-none object-cover saturate-[1.28] contrast-[1.12] brightness-[0.96]"
      />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[#2fa7d6]/18" aria-hidden="true" />
      <button
        type="button"
        onClick={() => navigate("/login")}
        aria-label="Kembali ke login"
        className="absolute left-5 top-[38px] z-30 flex h-10 w-10 items-center justify-center rounded-full text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.28)] transition active:scale-95 md:left-[calc(50%-300px)] md:top-[64px] md:h-14 md:w-14"
      >
        <ArrowLeft className="h-6 w-6 stroke-[2.8] md:h-12 md:w-12" aria-hidden="true" />
      </button>
      <h1 className="pointer-events-none relative z-20 pt-[45px] text-center text-[24px] font-extrabold leading-none tracking-normal text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.24)] md:pt-[82px] md:text-[42px]">
        Bantuan
      </h1>
    </header>
  );
}