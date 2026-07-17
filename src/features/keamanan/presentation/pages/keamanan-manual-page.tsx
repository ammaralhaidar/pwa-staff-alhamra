import { useState } from "react";
import { LogIn, LogOut, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getPerijinanId } from "../../application/keamanan-mappers";
import { useKeamananDetail, useScanSecurityStudent, useSearchSecurityManual } from "../../application/keamanan-queries";
import type { KeamananPermission, KeamananScanResult } from "../../domain/keamanan-types";
import { KeamananHeader } from "../components/keamanan-header";
import { DetailPerizinanModal } from "../components/detail-perizinan-modal";

function goToAction(navigate: ReturnType<typeof useNavigate>, result: KeamananScanResult) {
  const target = result.actionType === "checkin" ? "checkin" : "checkout";
  const permissionId = result.permission.permissionId || getPerijinanId(result.permission);
  if (!permissionId) {
    toast.error("Data perizinan tidak lengkap. Coba cari ulang dengan nama atau NIS.");
    return;
  }
  navigate(`/keamanan/${target}/${permissionId}`, { state: { permission: result.permission } });
}

export function KeamananManualPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<KeamananScanResult[]>([]);
  const [emptyMessage, setEmptyMessage] = useState("");
  const [selectedPermission, setSelectedPermission] = useState<KeamananPermission | null>(null);

  const scanMutation = useScanSecurityStudent();
  const searchMutation = useSearchSecurityManual();
  const selectedPermissionId = selectedPermission ? (selectedPermission.permissionId || getPerijinanId(selectedPermission)) : 0;
  const detailQuery = useKeamananDetail(selectedPermissionId);
  const detailPermission = detailQuery.data ?? selectedPermission;
  const isLoading = scanMutation.isPending || searchMutation.isPending;

  const submit = () => {
    const value = keyword.trim();
    if (!value) {
      toast.error("Masukkan Nama atau NIS Santri.");
      return;
    }
    setResults([]);
    setEmptyMessage("");
    if (/^\d+$/.test(value)) {
      scanMutation.mutate(value, {
        onSuccess: (result) => goToAction(navigate, result),
        onError: (error) => {
          const message = error instanceof Error ? error.message : "Data perizinan tidak ditemukan atau izin tidak aktif.";
          setEmptyMessage(message);
          toast.error(message);
        },
      });
      return;
    }
    searchMutation.mutate(value, {
      onSuccess: (result) => {
        if (result.matchType === "single" && result.result) {
          goToAction(navigate, result.result);
        } else if (result.matchType === "multiple") {
          setResults(result.list);
          if (!result.list.length) setEmptyMessage("Data santri tidak ditemukan.");
        } else {
          setEmptyMessage("Data santri tidak ditemukan.");
          toast.error("Data santri tidak ditemukan.");
        }
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : "Gagal mencari santri.";
        setEmptyMessage(message);
        toast.error(message);
      },
    });
  };

  const handleClear = () => {
    setKeyword("");
    setResults([]);
    setEmptyMessage("");
  };

  return (
    <div className="relative mx-auto flex h-svh w-screen max-w-[430px] flex-col bg-white">
      {/* Sticky Header */}
      <div className="shrink-0 z-40">
        <KeamananHeader
          title="Input Keyword"
          onBack={() => navigate("/keamanan/scan")}
        />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-28 px-5 py-6 space-y-6">
        <p className="text-[15px] font-medium text-slate-600 leading-relaxed">
          Masukkan Nama atau NIS Santri untuk proses perizinan
        </p>

        {/* Input area */}
        <div className="space-y-2">
          <label className="text-[15px] font-bold text-slate-700 block">
            Pencarian:
          </label>
          <div className="relative flex items-center rounded-2xl bg-[#F8FAFC] border border-slate-200 px-4">
            <Input
              className="border-0 bg-transparent py-7 pl-0 pr-10 text-[16px] font-medium text-slate-800 placeholder-slate-400 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Masukkan Nama atau NIS"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submit()}
            />
            {keyword && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 flex size-6 items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition active:scale-90"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        {results.length ? (
          <div className="space-y-3 pt-2">
            <p className="text-[15px] font-bold text-slate-800">
              Ditemukan {results.length} Santri:
            </p>
            <div className="space-y-4">
              {results.map((result) => {
                const isCheckout = result.actionType === "checkout";
                
                // Color mapping matching the screenshots
                const iconColor = isCheckout ? "text-orange-500 bg-orange-50" : "text-emerald-500 bg-emerald-50";
                const btnColor = isCheckout
                  ? "border-orange-500 text-orange-500 bg-white hover:bg-orange-50"
                  : "border-emerald-500 text-emerald-500 bg-white hover:bg-emerald-50";

                return (
                  <div
                    key={result.permission.permissionId}
                    onClick={() => setSelectedPermission(result.permission)}
                    className="flex w-full cursor-pointer items-start justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition active:scale-[0.99] select-none text-left"
                  >
                    {/* Left Icon */}
                    <div className={`flex size-14 shrink-0 items-center justify-center rounded-full ${iconColor} mt-1`}>
                      {isCheckout ? <LogOut className="size-6 rotate-180" /> : <LogIn className="size-6" />}
                    </div>

                    {/* Middle Info */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="text-[16px] font-bold text-slate-800 leading-snug">
                        {result.permission.studentName}
                      </h3>
                      <div className="space-y-0.5 text-[13px] font-medium text-slate-400">
                        {result.permission.studentNis && (
                          <p>NIS: {result.permission.studentNis}</p>
                        )}
                        {result.permission.className && (
                          <p>
                            {/^kelas\b/i.test(result.permission.className)
                              ? result.permission.className
                              : `Kelas ${result.permission.className}`}
                          </p>
                        )}
                        {result.permission.kamar && (
                          <p>Kamar: {result.permission.kamar}</p>
                        )}
                      </div>
                    </div>

                    {/* Right Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToAction(navigate, result);
                      }}
                      className={`shrink-0 rounded-full border px-5 py-2 text-[13px] font-bold transition active:scale-95 ${btnColor}`}
                    >
                      {isCheckout ? "Check Out" : "Check In"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {emptyMessage ? (
          <Card className="rounded-[24px] border-0 bg-slate-50 p-5 text-center shadow-sm">
            <p className="text-[15px] font-bold text-slate-700">Belum ada hasil</p>
            <p className="mt-1 text-[13px] font-medium leading-relaxed text-slate-500">{emptyMessage}</p>
          </Card>
        ) : null}
      </div>

      {/* Sticky Bottom Action Button */}
      <div className="fixed bottom-0 left-1/2 z-30 w-screen max-w-[430px] -translate-x-1/2 border-t border-slate-100 bg-white px-4 py-4">
        <div>
          <Button
            className="h-14 w-full rounded-2xl text-[16px] font-bold bg-[#288DE5] hover:bg-[#1B6FB7] text-white shadow-md active:scale-95 transition"
            disabled={isLoading}
            onClick={submit}
          >
            {isLoading ? "Mencari..." : "Cari"}
          </Button>
        </div>
      </div>

      {/* Modal Detail Perizinan */}
      <DetailPerizinanModal
        open={!!selectedPermission}
        onOpenChange={(open) => !open && setSelectedPermission(null)}
        permission={detailPermission}
      />
    </div>
  );
}
