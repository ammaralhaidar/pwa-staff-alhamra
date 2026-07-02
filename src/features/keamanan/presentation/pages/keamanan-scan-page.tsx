import { useEffect, useRef, useState } from "react";
import { Camera, Keyboard, QrCode, VideoOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useScanSecurityStudent } from "../../application/keamanan-queries";
import type { KeamananScanResult } from "../../domain/keamanan-types";
import { KeamananHeader } from "../components/keamanan-header";

function navigateByResult(navigate: ReturnType<typeof useNavigate>, result: KeamananScanResult) {
  const path = result.actionType === "checkin" ? `/keamanan/checkin/${result.permission.permissionId}` : `/keamanan/checkout/${result.permission.permissionId}`;
  navigate(path, { state: { permission: result.permission } });
}

export function KeamananScanPage() {
  const navigate = useNavigate();
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const lastScanRef = useRef<{ value: string; time: number } | null>(null);
  const isProcessingRef = useRef(false);
  const [cameraError, setCameraError] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scanMutation = useScanSecurityStudent();

  useEffect(() => {
    if (!isCameraActive) {
      // Clean up camera if deactivated
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().then(() => scanner.clear()).catch(() => undefined);
        scannerRef.current = null;
      }
      return;
    }

    let active = true;
    async function startScanner() {
      try {
        setCameraError("");
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!active) return;
        const scanner = new Html5Qrcode("keamanan-reader");
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            const now = Date.now();
            const lastScan = lastScanRef.current;
            if (isProcessingRef.current || (lastScan?.value === decodedText && now - lastScan.time < 2_000)) return;
            isProcessingRef.current = true;
            lastScanRef.current = { value: decodedText, time: now };
            scanMutation.mutate(decodedText, {
              onSuccess: (result) => {
                // Turn off camera before navigation
                setIsCameraActive(false);
                navigateByResult(navigate, result);
              },
              onError: (error) => toast.error(error instanceof Error ? error.message : "QR tidak ditemukan atau izin tidak aktif."),
              onSettled: () => {
                isProcessingRef.current = false;
              },
            });
          },
          () => undefined,
        );
      } catch {
        if (active) {
          const secureHint = window.isSecureContext ? "" : " Browser perlu HTTPS atau localhost untuk membuka kamera.";
          setCameraError(`Kamera tidak bisa dibuka.${secureHint} Pakai input manual untuk melanjutkan.`);
          setIsCameraActive(false);
        }
      }
    }

    startScanner();

    return () => {
      active = false;
      const scanner = scannerRef.current;
      if (scanner) {
        scanner.stop().then(() => scanner.clear()).catch(() => undefined);
      }
    };
  }, [isCameraActive, navigate, scanMutation]);

  return (
    <div className="relative mx-auto flex h-svh w-full max-w-[430px] flex-col bg-white">
      {/* Sticky Header */}
      <div className="shrink-0 z-40">
        <KeamananHeader
          title="Scan QR Code"
          onBack={() => navigate("/keamanan")}
          bottom={
            <p className="text-center text-sm font-medium text-white/95 pb-2 px-6 leading-relaxed">
              Pindai Kartu Tanda Santri untuk checkout atau checkin
            </p>
          }
        />
      </div>

      {/* Main Content (Non-scrollable) */}
      <div className="flex-1 overflow-hidden px-5 py-6 space-y-5">
        {/* Info Card */}
        <Card className="rounded-[24px] border-none bg-[#F5F9FD] p-5 shadow-sm text-left relative overflow-hidden">
          <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#288DE5] rounded-r-md" />
          <h4 className="text-[15px] font-bold text-[#288DE5] ml-2">Otomatis Deteksi:</h4>
          <p className="mt-1.5 text-[13px] font-medium text-slate-500 leading-relaxed ml-2">
            Sistem akan otomatis mendeteksi apakah santri akan checkout atau checkin berdasarkan status perizinan.
          </p>
          {import.meta.env.DEV ? (
            <div className="flex gap-2 mt-3 ml-2 border-t border-blue-100/50 pt-3">
              <Button
                size="sm"
                variant="secondary"
                className="text-[11px] font-bold h-8 px-3 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 border-none"
                onClick={() => navigate("/keamanan/checkout/1")}
              >
                Dev: Go Checkout
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="text-[11px] font-bold h-8 px-3 rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none"
                onClick={() => navigate("/keamanan/checkin/1")}
              >
                Dev: Go Checkin
              </Button>
            </div>
          ) : null}
        </Card>

        {/* Scanner Container Card */}
        <Card className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-[#F8FAFC] p-6 shadow-sm mt-4">
          <div
            id="keamanan-reader"
            className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#F8FAFC]"
          >
            {/* Custom overlays for scan area when inactive */}
            {!isCameraActive ? (
              <div className="flex flex-col items-center justify-center px-6 text-center space-y-4">
                <QrCode className="size-28 text-slate-300 stroke-[1.2]" />
                <p className="text-[14px] font-medium text-slate-400 max-w-[240px]">
                  Arahkan kamera ke QR Code pada Kartu Tanda Santri
                </p>
              </div>
            ) : null}

            {/* Corner highlights overlay */}
            <div className="absolute inset-2 pointer-events-none rounded-xl">
              <div className="absolute left-0 top-0 h-10 w-10 border-l-[3px] border-t-[3px] border-[#288DE5] rounded-tl-3xl" />
              <div className="absolute right-0 top-0 h-10 w-10 border-r-[3px] border-t-[3px] border-[#288DE5] rounded-tr-3xl" />
              <div className="absolute left-0 bottom-0 h-10 w-10 border-l-[3px] border-b-[3px] border-[#288DE5] rounded-bl-3xl" />
              <div className="absolute right-0 bottom-0 h-10 w-10 border-r-[3px] border-b-[3px] border-[#288DE5] rounded-br-3xl" />
            </div>
          </div>
        </Card>

        {cameraError ? (
          <Card className="rounded-[22px] border-0 bg-red-950/40 border border-red-500/20 p-4 text-sm font-semibold text-red-300 shadow-sm text-center">
            {cameraError}
          </Card>
        ) : null}
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed inset-x-0 bottom-0 bg-white border-t border-slate-100 px-4 py-4 z-30">
        <div className="mx-auto max-w-[430px] space-y-3">
          <Button
            onClick={() => setIsCameraActive((prev) => !prev)}
            className={`h-14 w-full rounded-2xl text-base font-extrabold transition shadow-md ${
              isCameraActive
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-[#288DE5] hover:bg-[#1B6FB7] text-white"
            }`}
          >
            {isCameraActive ? (
              <>
                <VideoOff className="mr-2 size-5" />
                Matikan Kamera
              </>
            ) : (
              <>
                <Camera className="mr-2 size-5" />
                Aktifkan Kamera untuk Scan
              </>
            )}
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-14 w-full rounded-2xl border-[#288DE5] bg-white text-[#288DE5] hover:bg-blue-50 font-extrabold transition"
          >
            <Link to="/keamanan/manual">
              <Keyboard className="mr-2 size-5" />
              Input Manual
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
