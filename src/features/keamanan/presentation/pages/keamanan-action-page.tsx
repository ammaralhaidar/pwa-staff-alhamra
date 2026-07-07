import { ArrowLeft, CalendarDays, Clock, LogIn, LogOut, TriangleAlert } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getKeamananErrorMessage, getKeamananSuccessMessage, getPerijinanId } from "../../application/keamanan-mappers";
import { useCheckinSecurity, useCheckoutSecurity, useKeamananDetail } from "../../application/keamanan-queries";
import type { KeamananActionType, KeamananPermission } from "../../domain/keamanan-types";
import { InfoCard, InfoRow } from "../components/info-card";

function isLate(permission: KeamananPermission) {
  if (!permission.dateReturn) return { late: false, days: 0 };
  const date = new Date(permission.dateReturn);
  if (Number.isNaN(date.getTime())) return { late: false, days: 0 };
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.max(0, Math.round((today.getTime() - due.getTime()) / 86_400_000));
  return { late: days > 0, days };
}

function nowDate() {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
}

function nowTime() {
  return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function getErrorMessage(error: unknown) {
  return getKeamananErrorMessage(error, "Data perizinan tidak bisa dimuat.");
}

function StateMessage({
  actionType,
  title,
  description,
  onRetry,
}: {
  actionType: KeamananActionType;
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  const isCheckout = actionType === "checkout";
  return (
    <div className="relative mx-auto flex h-svh w-screen max-w-[430px] flex-col bg-[#F8FAFC]">
      <header className={`${isCheckout ? "bg-orange-500" : "bg-emerald-500"} shrink-0 rounded-b-[24px] px-5 py-6.5 text-white`}>
        <div className="flex items-center justify-between">
          <Button asChild size="icon" variant="ghost" className="size-9 rounded-full text-white hover:bg-white/10">
            <Link to="/keamanan">
              <ArrowLeft className="size-5 text-white" />
            </Link>
          </Button>
          <div className="text-center">
            <h2 className="text-base font-bold leading-tight">{isCheckout ? "Checkout Santri" : "Checkin Santri"}</h2>
            <p className="text-[11px] leading-normal text-white/85">Konfirmasi data perizinan</p>
          </div>
          <div className="size-9" />
        </div>
      </header>
      <section className="flex flex-1 items-center px-4">
        <Card className="w-full space-y-3 rounded-[22px] border-0 bg-white p-5 text-center shadow-sm">
          <TriangleAlert className="mx-auto size-10 text-amber-500" />
          <h1 className="text-lg font-black text-slate-900">{title}</h1>
          <p className="text-sm font-medium leading-relaxed text-slate-500">{description}</p>
          <div className="flex gap-2 pt-2">
            <Button asChild variant="outline" className="h-11 flex-1 rounded-xl">
              <Link to="/keamanan">Kembali</Link>
            </Button>
            {onRetry ? (
              <Button className="h-11 flex-1 rounded-xl bg-[#288DE5] hover:bg-[#1B6FB7]" onClick={onRetry}>
                Coba lagi
              </Button>
            ) : null}
          </div>
        </Card>
      </section>
    </div>
  );
}

export function KeamananActionPage({ actionType }: { actionType: KeamananActionType }) {
  const navigate = useNavigate();
  const location = useLocation();
  const permissionId = Number(useParams().permissionId ?? 0);
  const statePermission = (location.state as { permission?: KeamananPermission } | null)?.permission;
  const detailQuery = useKeamananDetail(permissionId);
  const checkoutMutation = useCheckoutSecurity();
  const checkinMutation = useCheckinSecurity();
  const detailPermission = detailQuery.data && detailQuery.data.permissionId > 0 ? detailQuery.data : undefined;
  const permission = detailPermission ?? statePermission;
  const isCheckout = actionType === "checkout";
  const isInvalidId = !Number.isFinite(permissionId) || permissionId <= 0;
  const isMissingPermission = !isInvalidId && !detailQuery.isLoading && !detailQuery.isError && !permission;
  const late = permission ? isLate(permission) : { late: false, days: 0 };
  const mutationPending = checkoutMutation.isPending || checkinMutation.isPending;

  const confirm = () => {
    if (!permission) {
      toast.error("Data perizinan belum tersedia.");
      return;
    }
    const targetId = getPerijinanId(permission);
    if (!targetId) {
      toast.error("ID perizinan tidak valid.");
      return;
    }
    if (isCheckout) {
      checkoutMutation.mutate({ permissionId: permission.permissionId, perijinanId: targetId, permission }, {
        onSuccess: (response) => {
          toast.success(getKeamananSuccessMessage(response, "Checkout berhasil."));
          navigate("/keamanan", { state: { tab: "outside" } });
        },
        onError: (error) => toast.error(getKeamananErrorMessage(error, "Gagal checkout.")),
      });
      return;
    }
    checkinMutation.mutate({ permissionId: permission.permissionId, perijinanId: targetId, permission }, {
      onSuccess: (response) => {
        const fallback = late.late ? `Checkin berhasil, terlambat ${late.days} hari.` : "Checkin berhasil.";
        toast.success(getKeamananSuccessMessage(response, fallback));
        navigate("/keamanan");
      },
      onError: (error) => toast.error(getKeamananErrorMessage(error, "Gagal checkin.")),
    });
  };

  if (isInvalidId) {
    return (
      <StateMessage
        actionType={actionType}
        title="ID perizinan tidak valid"
        description="Halaman ini membutuhkan ID perizinan yang benar dari hasil scan atau input manual."
      />
    );
  }

  if (!permission && detailQuery.isLoading) {
    return (
      <StateMessage
        actionType={actionType}
        title="Memuat data perizinan"
        description="Sebentar, data santri sedang diambil dari API Keamanan."
      />
    );
  }

  if (!permission && detailQuery.isError) {
    return (
      <StateMessage
        actionType={actionType}
        title="Gagal memuat perizinan"
        description={getErrorMessage(detailQuery.error)}
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  if (isMissingPermission) {
    return (
      <StateMessage
        actionType={actionType}
        title="Data perizinan tidak ditemukan"
        description="API tidak mengembalikan data untuk ID ini. Coba scan ulang atau gunakan input manual."
      />
    );
  }

  if (!permission) {
    return (
      <StateMessage
        actionType={actionType}
        title="Data perizinan belum tersedia"
        description="Coba kembali ke halaman keamanan lalu buka ulang data santri."
      />
    );
  }

  return (
    <div className="relative mx-auto flex h-svh w-screen max-w-[430px] flex-col bg-[#F8FAFC]">
      {/* Sticky Header */}
      <header className={`${isCheckout ? "bg-orange-500" : "bg-emerald-500"} px-5 py-6.5 text-white shrink-0 z-40 rounded-b-[24px]`}>
        <div className="flex items-center justify-between">
          <Button asChild size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/10 size-9">
            <Link to="/keamanan">
              <ArrowLeft className="size-5 text-white" />
            </Link>
          </Button>
          <div className="text-center">
            <h2 className="text-base font-bold leading-tight">{isCheckout ? "Checkout Santri" : "Checkin Santri"}</h2>
            <p className="text-[11px] text-white/85 leading-normal">{isCheckout ? "Konfirmasi keluar santri" : "Konfirmasi kembali santri"}</p>
          </div>
          <div className="size-9" />
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <section className="space-y-4 px-4 py-6">
          <Card className={`rounded-[22px] border-0 p-4 shadow-sm ${isCheckout ? "bg-orange-50 text-orange-700" : "bg-emerald-50 text-emerald-700"}`}>
            <div className="grid gap-3">
              <div className="flex items-center gap-3"><CalendarDays className="size-5" /><span className="font-bold">{nowDate()}</span></div>
              <div className="flex items-center gap-3"><Clock className="size-5" /><span className="font-bold">{isCheckout ? "Jam Keluar" : "Jam Kembali"}: {nowTime()}</span></div>
            </div>
          </Card>
          {!isCheckout && late.late ? (
            <Card className="flex items-center gap-3 rounded-[22px] border border-red-100 bg-red-50 p-4 text-red-700 shadow-sm">
              <TriangleAlert className="size-6" />
              <div>
                <p className="font-black">Terlambat Kembali</p>
                <p className="text-sm">{late.days} hari dari jadwal yang ditentukan</p>
              </div>
            </Card>
          ) : null}
          <InfoCard title="Informasi Santri">
            <InfoRow label="Nama" value={permission.studentName} />
            <InfoRow label="NIS" value={permission.studentNis} />
            <InfoRow label="Kelas" value={permission.className} />
            <InfoRow label="Kamar" value={permission.kamar} />
            <InfoRow label="Halaqoh" value={permission.halaqoh} />
            <InfoRow label="Musyrif" value={permission.musyrif} />
          </InfoCard>
          <InfoCard title="Informasi Perizinan">
            <InfoRow label="Keperluan" value={permission.reason} />
            <InfoRow label="Tanggal Izin" value={permission.dateStart} />
            <InfoRow label="Tanggal Kembali" value={permission.dateReturn} />
            <InfoRow label="Lama Izin" value={permission.lamaIzin} />
            <InfoRow label="Penjemput" value={permission.penjemput} />
            {isCheckout ? <InfoRow label="Jam Penjemputan" value={permission.jamPenjemputan} /> : null}
          </InfoCard>
        </section>
      </div>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-0 left-1/2 z-30 w-screen max-w-[430px] -translate-x-1/2 border-t border-slate-100 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur">
        <div>
          <Button className={`h-14 w-full rounded-2xl text-base font-black ${isCheckout ? "bg-orange-500 hover:bg-orange-600" : "bg-emerald-500 hover:bg-emerald-600"}`} disabled={mutationPending} onClick={confirm}>
            {isCheckout ? <LogOut className="mr-2 size-5" /> : <LogIn className="mr-2 size-5" />}
            {mutationPending ? "Memproses..." : isCheckout ? "Konfirmasi Checkout" : "Konfirmasi Checkin"}
          </Button>
        </div>
      </div>
    </div>
  );
}
