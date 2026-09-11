import { Skeleton } from "@/components/ui/skeleton";

export function RolePageSkeleton({ label = "Memuat halaman..." }: { label?: string }) {
  return (
    <div className="mx-auto min-h-svh w-full max-w-[430px] overflow-hidden bg-[#EFF6FF]" role="status" aria-label={label}>
      <div className="h-[116px] rounded-b-[28px] bg-[#288DE5] px-5 pt-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl bg-white/20" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-36 bg-white/25" />
              <Skeleton className="h-3 w-24 bg-white/20" />
            </div>
          </div>
          <Skeleton className="size-10 rounded-full bg-white/20" />
        </div>
      </div>
      <div className="space-y-4 px-5 py-5">
        <Skeleton className="h-11 w-full rounded-2xl bg-white" />
        <ListCardSkeleton />
        <ListCardSkeleton />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function ListCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={`rounded-[22px] bg-white p-4 shadow-sm ${className ?? ""}`}>
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-px w-full" />
      <div className="mt-3 flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Memuat detail">
      <Skeleton className="h-24 rounded-[22px] bg-white" />
      {[0, 1, 2].map((item) => (
        <div key={item} className="space-y-4 rounded-[22px] bg-white p-5 shadow-sm">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
        </div>
      ))}
    </div>
  );
}

export function HistoryListSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Memuat riwayat transaksi">
      <ListCardSkeleton />
      <ListCardSkeleton />
      <ListCardSkeleton />
    </div>
  );
}
