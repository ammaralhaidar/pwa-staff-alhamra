import { useEffect, useId, useRef, useState } from "react";
import { Camera, Keyboard, QrCode, VideoOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPerijinanId } from "../../application/keamanan-mappers";
import { useScanSecurityStudent } from "../../application/keamanan-queries";
import type { KeamananScanResult } from "../../domain/keamanan-types";
import { KeamananHeader } from "../components/keamanan-header";

type Html5ScannerInstance = {
  start: (
    cameraConfig: { facingMode: string },
    config: { fps: number },
    onSuccess: (decodedText: string) => void,
    onError: (errorMessage: string) => void,
  ) => Promise<void>;
  stop: () => Promise<void>;
  clear: () => void;
};

type Html5QrcodeConstructor = new (
  elementId: string,
  config?: { formatsToSupport?: unknown[] },
) => Html5ScannerInstance;

type NativeBarcode = {
  rawValue?: string;
  format?: string;
};

type NativeBarcodeDetector = {
  detect: (source: HTMLVideoElement) => Promise<NativeBarcode[]>;
};

type NativeBarcodeDetectorConstructor = {
  new (options?: { formats?: string[] }): NativeBarcodeDetector;
  getSupportedFormats?: () => Promise<string[]>;
};

type WindowWithBarcodeDetector = Window & {
  BarcodeDetector?: NativeBarcodeDetectorConstructor;
};

function navigateByResult(navigate: ReturnType<typeof useNavigate>, result: KeamananScanResult) {
  const permissionId = result.permission.permissionId || getPerijinanId(result.permission);
  if (!permissionId) {
    toast.error("Data perizinan dari barcode tidak lengkap. Coba scan ulang atau gunakan input manual.");
    return;
  }
  const path = result.actionType === "checkin" ? `/keamanan/checkin/${permissionId}` : `/keamanan/checkout/${permissionId}`;
  navigate(path, { state: { permission: result.permission } });
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return "Tidak diketahui";
}

async function waitForReaderSize(element: HTMLElement, attempts = 12) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const width = element.clientWidth;
    const height = element.clientHeight;
    if (width > 0 && height > 0) return { width, height };
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve());
    });
  }
  return { width: element.clientWidth, height: element.clientHeight };
}

function forceScannerPreviewLayout(element: HTMLElement) {
  const nodes = element.querySelectorAll<HTMLElement>("video, canvas, img, div");
  nodes.forEach((node) => {
    node.style.maxWidth = "100%";
  });

  element.querySelectorAll<HTMLElement>("video, canvas").forEach((node) => {
    node.style.width = "100%";
    node.style.height = "100%";
    node.style.objectFit = "cover";
    node.style.display = "block";
    node.style.borderRadius = "1.5rem";
  });
}

async function safeStopScanner(scanner: Html5ScannerInstance | null) {
  if (!scanner) return;
  try {
    await scanner.stop();
  } catch {
    // html5-qrcode throws when stop is called before the camera is fully running.
  }
  try {
    scanner.clear();
  } catch {
    // Ignore DOM cleanup errors from the scanner; React owns the page shell.
  }
}

function clearReaderHost(element: HTMLElement | null) {
  try {
    element?.replaceChildren();
  } catch {
    // Ignore cleanup errors from scanner-owned DOM.
  }
}

export function KeamananScanPage() {
  const navigate = useNavigate();
  const readerId = `keamanan-reader-${useId().replace(/:/g, "")}`;
  const readerHostRef = useRef<HTMLDivElement | null>(null);
  const scannerRef = useRef<Html5ScannerInstance | null>(null);
  const nativeBarcodeIntervalRef = useRef<number | null>(null);
  const nativeDetectInFlightRef = useRef(false);
  const lastScanRef = useRef<{ value: string; time: number } | null>(null);
  const isProcessingRef = useRef(false);
  const isStartingRef = useRef(false);
  const isRunningRef = useRef(false);
  const [cameraError, setCameraError] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scanMutation = useScanSecurityStudent();
  const scanMutationRef = useRef(scanMutation);
  const handleDecodedBarcodeRef = useRef<(decodedText: string, source: string) => void>(() => undefined);

  useEffect(() => {
    scanMutationRef.current = scanMutation;
  }, [scanMutation]);

  useEffect(() => {
    handleDecodedBarcodeRef.current = (decodedText) => {
      const now = Date.now();
      const lastScan = lastScanRef.current;
      if (isProcessingRef.current || (lastScan?.value === decodedText && now - lastScan.time < 2_000)) return;
      isProcessingRef.current = true;
      lastScanRef.current = { value: decodedText, time: now };
      scanMutationRef.current.mutate(decodedText, {
        onSuccess: (result) => {
          setIsCameraActive(false);
          navigateByResult(navigate, result);
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : "Barcode tidak ditemukan atau izin tidak aktif.");
        },
        onSettled: () => {
          isProcessingRef.current = false;
        },
      });
    };
  }, [navigate]);

  const stopNativeBarcodeLoop = () => {
    if (nativeBarcodeIntervalRef.current !== null) {
      window.clearInterval(nativeBarcodeIntervalRef.current);
      nativeBarcodeIntervalRef.current = null;
    }
    nativeDetectInFlightRef.current = false;
  };

  useEffect(() => {
    const readerHost = readerHostRef.current;
    if (!isCameraActive) {
      stopNativeBarcodeLoop();
      // Clean up camera if deactivated
      const scanner = scannerRef.current;
      if (scanner) {
        scannerRef.current = null;
        isRunningRef.current = false;
        isStartingRef.current = false;
        void safeStopScanner(scanner).finally(() => clearReaderHost(readerHost));
      } else {
        clearReaderHost(readerHost);
      }
      return;
    }

    let active = true;
    async function startNativeBarcodeLoop() {
      stopNativeBarcodeLoop();
      const BarcodeDetector = (window as WindowWithBarcodeDetector).BarcodeDetector;
      if (!BarcodeDetector) return;

      const requestedFormats = ["code_128", "qr_code"];
      let supportedFormats: string[] = [];
      try {
        supportedFormats = (await BarcodeDetector.getSupportedFormats?.()) ?? [];
      } catch {
        supportedFormats = [];
      }

      const formats = supportedFormats.length
        ? requestedFormats.filter((format) => supportedFormats.includes(format))
        : requestedFormats;

      if (!formats.length) return;

      const detector = new BarcodeDetector({ formats });
      const detect = async () => {
        if (!active || !isRunningRef.current || isProcessingRef.current || nativeDetectInFlightRef.current) return;
        const video = readerHostRef.current?.querySelector("video");
        if (!video || video.readyState < 2 || video.videoWidth <= 0 || video.videoHeight <= 0) {
          return;
        }

        nativeDetectInFlightRef.current = true;
        try {
          const results = await detector.detect(video);
          if (results.length) {
            const rawValue = results.find((item) => item.rawValue)?.rawValue;
            if (rawValue) handleDecodedBarcodeRef.current(rawValue, "barcode-detector");
            return;
          }
        } catch {
          // Native BarcodeDetector can fail per frame; html5-qrcode remains active.
        } finally {
          nativeDetectInFlightRef.current = false;
        }
      };

      nativeBarcodeIntervalRef.current = window.setInterval(() => {
        void detect();
      }, 350);
      void detect();
    }

    async function startScanner() {
      if (isStartingRef.current || isRunningRef.current) return;
      isStartingRef.current = true;
      try {
        setCameraError("");
        await new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => resolve());
        });
        const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
        if (!active) return;
        if (!readerHostRef.current) throw new Error("Container scanner belum tersedia.");
        const readerSize = await waitForReaderSize(readerHostRef.current);
        if (readerSize.width <= 0 || readerSize.height <= 0) {
          throw new Error("Area scanner belum punya ukuran. Coba refresh halaman lalu aktifkan kamera lagi.");
        }
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.QR_CODE,
        ];
        clearReaderHost(readerHostRef.current);
        const ScannerConstructor = Html5Qrcode as unknown as Html5QrcodeConstructor;
        const scanner = new ScannerConstructor(readerId, {
          formatsToSupport,
        });
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 12 },
          (decodedText) => {
            handleDecodedBarcodeRef.current(decodedText, "html5-qrcode");
          },
          () => undefined,
        );
        isRunningRef.current = true;
        if (readerHostRef.current) {
          forceScannerPreviewLayout(readerHostRef.current);
          window.setTimeout(() => {
            if (readerHostRef.current) forceScannerPreviewLayout(readerHostRef.current);
          }, 250);
        }
        await startNativeBarcodeLoop();
      } catch (error) {
        if (active) {
          const secureHint = window.isSecureContext ? "" : " Browser perlu HTTPS atau localhost untuk membuka kamera.";
          setCameraError(`Kamera tidak bisa dibuka. ${getErrorMessage(error)}.${secureHint} Pakai input manual untuk melanjutkan.`);
          setIsCameraActive(false);
        }
      } finally {
        isStartingRef.current = false;
      }
    }

    startScanner();

    return () => {
      active = false;
      stopNativeBarcodeLoop();
      const scanner = scannerRef.current;
      if (scanner) {
        scannerRef.current = null;
        isRunningRef.current = false;
        isStartingRef.current = false;
        void safeStopScanner(scanner).finally(() => clearReaderHost(readerHost));
      } else {
        clearReaderHost(readerHost);
      }
    };
  }, [isCameraActive, navigate, readerId]);

  return (
    <div className="relative mx-auto flex min-h-svh w-screen max-w-[430px] flex-col bg-white">
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

      {/* Main Content */}
      <div className="flex-1 space-y-5 px-5 py-6 pb-40">
        {/* Info Card */}
        <Card className="rounded-[24px] border-none bg-[#F5F9FD] p-5 shadow-sm text-left relative overflow-hidden">
          <div className="absolute left-0 top-4 bottom-4 w-1 bg-[#288DE5] rounded-r-md" />
          <h4 className="text-[15px] font-bold text-[#288DE5] ml-2">Otomatis Deteksi:</h4>
          <p className="mt-1.5 text-[13px] font-medium text-slate-500 leading-relaxed ml-2">
            Sistem akan otomatis mendeteksi apakah santri akan checkout atau checkin berdasarkan status perizinan.
          </p>
        </Card>

        {/* Scanner Container Card */}
        <Card className="relative overflow-hidden rounded-[32px] border border-slate-100 bg-[#F8FAFC] p-6 shadow-sm mt-4">
          <div className="relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#F8FAFC]">
            <div
              id={readerId}
              ref={readerHostRef}
              aria-hidden={!isCameraActive}
              className={`absolute inset-0 min-h-full min-w-full overflow-hidden rounded-3xl bg-slate-950 transition-opacity [&_canvas]:!h-full [&_canvas]:!w-full [&_canvas]:!object-cover [&_video]:!h-full [&_video]:!w-full [&_video]:!object-cover ${isCameraActive ? "opacity-100" : "pointer-events-none opacity-0"}`}
            />

            {/* Placeholder scanner saat kamera mati */}
            {!isCameraActive ? (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center space-y-4 px-6 text-center">
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
      <div className="fixed bottom-0 left-1/2 z-30 w-screen max-w-[430px] -translate-x-1/2 border-t border-slate-100 bg-white px-4 py-4">
        <div className="space-y-3">
          <Button
            onClick={() => {
              setCameraError("");
              setIsCameraActive((prev) => !prev);
            }}
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
