import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { HistoryListSkeleton } from "@/components/feedback/page-skeletons";
import { isDemoFallbackEnabled } from "@/lib/helpers";
import { fallbackWalletHistory } from "../../application/musyrif-fallback-data";
import { useWalletHistory } from "../../application/musyrif-queries";
import { MusyrifHeader } from "../components/musyrif-header";
import { TransactionCard } from "../components/transaction-card";
import { TransactionDetailDialog } from "../components/transaction-detail-dialog";
import type { WalletHistory } from "../../domain/musyrif-types";

export function UangSakuHistoryPage() {
  const navigate = useNavigate();
  const santriId = Number(useParams().santriId ?? 0);
  const [selectedTx, setSelectedTx] = useState<WalletHistory | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const query = useWalletHistory(santriId, "uang_saku");
  const isInvalidId = !Number.isFinite(santriId) || santriId <= 0;
  const isFallbackMode = query.isError && isDemoFallbackEnabled();
  const items = query.data ?? (isFallbackMode ? fallbackWalletHistory.filter((item) => item.type === "uang_saku") : []);

  return (
    <div className="relative mx-auto flex h-svh max-w-[430px] flex-col bg-[#EFF6FF]">
      <div className="shrink-0 z-40">
        <MusyrifHeader
          title="Riwayat Uang Saku"
          subtitle="Informasi transaksi uang saku"
          onBack={() => navigate(`/musyrif/santri/${santriId}`)}
        />
      </div>
      <div className="flex-1 overflow-y-auto pb-6">
        <section className="space-y-3 px-4 py-6">
          {query.isError ? <Card className="rounded-[22px] border-0 bg-white p-4 text-sm text-amber-700 shadow-sm">{isFallbackMode ? "Riwayat contoh ditampilkan karena API belum tersedia." : "Gagal memuat riwayat uang saku dari API."}</Card> : null}
          {isInvalidId ? <Card className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-red-600 shadow-sm">ID santri tidak valid.</Card> : null}
          {query.isLoading ? <HistoryListSkeleton /> : null}
          {items.map((item) => (
            <div 
              key={item.id} 
              className="cursor-pointer active:scale-[0.98] transition duration-150" 
              onClick={() => { setSelectedTx(item); setDetailOpen(true); }}
            >
              <TransactionCard item={item} />
            </div>
          ))}
          {!query.isLoading && !items.length ? <Card className="rounded-[22px] border-0 bg-white p-6 text-center font-semibold text-slate-500 shadow-sm">Tidak ada transaksi uang saku.</Card> : null}
        </section>
      </div>
      <TransactionDetailDialog 
        item={selectedTx} 
        open={detailOpen} 
        onOpenChange={setDetailOpen} 
      />
    </div>
  );
}
