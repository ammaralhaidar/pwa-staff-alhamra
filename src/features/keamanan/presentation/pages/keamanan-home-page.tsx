import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { CalendarDays, LogIn, LogOut, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { fallbackKeamananDashboard } from "../../application/keamanan-fallback-data";
import { getPerijinanId, isCheckoutPermission, isOutsidePermission } from "../../application/keamanan-mappers";
import { mergeLocalPermissionState } from "../../application/keamanan-storage";
import { useKeamananDashboard, useKeamananDetail } from "../../application/keamanan-queries";
import type { KeamananPermission, KeamananTab, KeamananTimeRange } from "../../domain/keamanan-types";
import { KeamananHeader } from "../components/keamanan-header";
import { PermissionCard } from "../components/permission-card";
import { DetailPerizinanModal } from "../components/detail-perizinan-modal";

function withinRange(permission: KeamananPermission, range: KeamananTimeRange) {
  if (range === "all") return true;
  if (!permission.dateStart) return true;
  const date = new Date(permission.dateStart);
  if (Number.isNaN(date.getTime())) return true;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.round((start.getTime() - current.getTime()) / 86_400_000);
  if (range === "today") return diff === 0;
  if (range === "7days") return diff >= 0 && diff <= 7;
  return diff >= 0 && diff <= 30;
}

export function KeamananHomePage() {
  const location = useLocation();
  const initialTab = ((location.state as { tab?: KeamananTab } | null)?.tab === "outside" ? "outside" : "checkout") satisfies KeamananTab;
  const [tab, setTab] = useState<KeamananTab>(initialTab);
  const [search, setSearch] = useState("");
  const [range, setRange] = useState<KeamananTimeRange>("today");
  const [selectedPermission, setSelectedPermission] = useState<KeamananPermission | null>(null);

  const query = useKeamananDashboard();
  const selectedPermissionId = selectedPermission ? (selectedPermission.permissionId || getPerijinanId(selectedPermission)) : 0;
  const detailQuery = useKeamananDetail(selectedPermissionId);
  const selectedIsLocalOutside = selectedPermission?.status === "outside";
  const detailPermission = selectedIsLocalOutside ? selectedPermission : detailQuery.data ?? selectedPermission;
  const isUsingFallback = query.isError && isDemoFallbackEnabled();
  const dashboard = query.data ?? (isUsingFallback ? fallbackKeamananDashboard : {
    summary: { totalPerijinan: 0, disetujui: 0, ijinKeluar: 0 },
    permissions: [],
  });
  const permissions = mergeLocalPermissionState(dashboard.permissions);

  const checkoutItems = permissions.filter((item) => isCheckoutPermission(item) && withinRange(item, range));
  const outsideItems = permissions.filter((item) => isOutsidePermission(item) && withinRange(item, range));
  const source = tab === "checkout" ? checkoutItems : outsideItems;
  const items = useMemo(() => {
    const keyword = search.toLowerCase();
    return source.filter((item) => [item.studentName, item.studentNis, item.className].some((value) => value?.toLowerCase().includes(keyword)));
  }, [search, source]);

  return (
    <main className="mx-auto w-full max-w-[430px]">
      <KeamananHeader title="Beranda Keamanan" />
      <section className="space-y-4 px-4 py-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTab("checkout")}
            className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-black shadow-sm ${tab === "checkout" ? "bg-orange-500 text-white" : "bg-white text-slate-500"}`}
          >
            <LogOut className="size-5" />
            Checkout <span className="rounded-full bg-black/20 px-2">{checkoutItems.length}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("outside")}
            className={`flex items-center justify-center gap-2 rounded-2xl px-3 py-3 text-sm font-black shadow-sm ${tab === "outside" ? "bg-emerald-500 text-white" : "bg-white text-slate-500"}`}
          >
            <LogIn className="size-5" />
            Di Luar <span className="rounded-full bg-black/20 px-2">{outsideItems.length}</span>
          </button>
        </div>

        <div className="flex">
          <Select value={range} onValueChange={(value) => setRange(value as KeamananTimeRange)}>
            <SelectTrigger className="w-32 rounded-xl border-slate-100 bg-white font-semibold text-blue-500 shadow-sm">
              <CalendarDays className="mr-2 size-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="7days">7 Hari</SelectItem>
              <SelectItem value="30days">30 Hari</SelectItem>
              <SelectItem value="all">Semua</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="rounded-[22px] border-0 bg-white p-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Search className="size-5 text-slate-400" />
            <Input
              className="border-0 text-base shadow-none focus-visible:ring-0"
              placeholder="Cari nama atau NIS..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </Card>

        {query.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-36 rounded-[22px]" />
            <Skeleton className="h-36 rounded-[22px]" />
          </div>
        ) : (
          <div className="space-y-3">
            {query.isError ? (
              <Card className="space-y-3 rounded-[22px] border-0 bg-white p-4 text-sm text-amber-700 shadow-sm">
                <p className="font-semibold">{isUsingFallback ? "API belum bisa dimuat, data contoh ditampilkan khusus untuk pengecekan UI." : "API belum bisa dimuat."}</p>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => query.refetch()}>
                  Coba lagi
                </Button>
              </Card>
            ) : null}
            {items.map((item) => (
              <PermissionCard
                key={`${tab}-${item.permissionId}`}
                permission={item}
                tab={tab}
                onDetailClick={setSelectedPermission}
              />
            ))}
            {!items.length ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                {tab === "checkout" ? (
                  <LogOut className="mb-4 size-16 stroke-slate-300" strokeWidth={1.5} />
                ) : (
                  <LogIn className="mb-4 size-16 stroke-slate-300" strokeWidth={1.5} />
                )}
                <p className="text-center text-base font-medium">
                  Tidak ada santri yang menunggu {tab === "checkout" ? "checkout" : "di luar"}
                </p>
                <p className="mt-1 text-center text-sm">Tarik ke bawah untuk refresh</p>
              </div>
            ) : null}
          </div>
        )}
      </section>

      {/* Modal Detail Perizinan */}
      <DetailPerizinanModal
        open={!!selectedPermission}
        onOpenChange={(open) => !open && setSelectedPermission(null)}
        permission={detailPermission}
      />
    </main>
  );
}
