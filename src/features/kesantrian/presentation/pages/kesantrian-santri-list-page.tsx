import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, RefreshCw, Search, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { KesantrianHeader } from "../components/kesantrian-header";
import { KesantrianSantriCard } from "../components/kesantrian-santri-card";
import { SantriActionSheet } from "../components/santri-action-sheet";
import { MoneyActionDialog } from "@/features/musyrif/presentation/components/money-action-dialog";
import { PinDialog } from "@/features/musyrif/presentation/components/pin-dialog";
import {
  useChangeKesantrianPin,
  useKesantrianStudents,
  useTopupKesantrianWallet,
} from "../../application/kesantrian-queries";
import type { KesantrianStudent, SaldoFilter } from "../../domain/kesantrian-types";

export function KesantrianSantriListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedKamar, setSelectedKamar] = useState("all");
  const [selectedKelas, setSelectedKelas] = useState("all");
  const [saldoFilter, setSaldoFilter] = useState<SaldoFilter>("all");

  // Selected student for Action Sheet & Dialogs
  const [activeStudent, setActiveStudent] = useState<KesantrianStudent | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [topupOpen, setTopupOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);

  // Queries & Mutations
  const { data: responseData, isLoading, isError, error, refetch } = useKesantrianStudents();
  const topupMutation = useTopupKesantrianWallet();
  const pinMutation = useChangeKesantrianPin();

  const allStudents = useMemo(() => responseData?.siswa ?? [], [responseData?.siswa]);
  const kamarOptions = useMemo(() => responseData?.kamarOptions ?? [], [responseData?.kamarOptions]);
  const kelasOptions = useMemo(() => responseData?.kelasOptions ?? [], [responseData?.kelasOptions]);

  // Counts for pills
  const lowCount = useMemo(
    () => allStudents.filter((s) => s.saldoDompet > 0 && s.saldoDompet < 20000).length,
    [allStudents],
  );
  const emptyCount = useMemo(
    () => allStudents.filter((s) => s.saldoDompet === 0).length,
    [allStudents],
  );

  // Filtered List
  const filteredStudents = useMemo(() => {
    let list = allStudents;

    if (selectedKamar !== "all") {
      list = list.filter((s) => s.kamar === selectedKamar);
    }

    if (selectedKelas !== "all") {
      list = list.filter((s) => s.kelas === selectedKelas);
    }

    if (saldoFilter === "low") {
      list = list.filter((s) => s.saldoDompet > 0 && s.saldoDompet < 20000);
    } else if (saldoFilter === "empty") {
      list = list.filter((s) => s.saldoDompet === 0);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.nis.toLowerCase().includes(q) ||
          s.kelas.toLowerCase().includes(q) ||
          s.kamar.toLowerCase().includes(q),
      );
    }

    return list;
  }, [allStudents, selectedKamar, selectedKelas, saldoFilter, search]);

  // Handlers for card tap & actions
  function handleCardClick(student: KesantrianStudent) {
    setActiveStudent(student);
    setActionSheetOpen(true);
  }

  function handleStartTopup() {
    setTopupOpen(true);
  }

  function handleStartPin() {
    setPinOpen(true);
  }

  function handleViewDetail() {
    if (activeStudent) {
      navigate(`/kesantrian/santri/${activeStudent.id}`);
    }
  }

  function handleSubmitTopup(amount: number) {
    if (!activeStudent) return;
    topupMutation.mutate(
      { siswa_id: activeStudent.id, amount },
      {
        onSuccess: () => {
          toast.success(`Top-up Rp ${amount.toLocaleString("id-ID")} berhasil disimpan.`);
          setTopupOpen(false);
          void refetch();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Top-up gagal. Periksa saldo uang saku.");
        },
      },
    );
  }

  function handleSubmitPin(pin: string) {
    if (!activeStudent) return;
    pinMutation.mutate(
      { siswa_id: activeStudent.id, new_pin: pin },
      {
        onSuccess: () => {
          toast.success("PIN Dompet berhasil diubah.");
          setPinOpen(false);
          void refetch();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Gagal mengubah PIN.");
        },
      },
    );
  }

  return (
    <main className="mx-auto w-full max-w-[430px] min-h-svh bg-[#EFF6FF] flex flex-col">
      <KesantrianHeader
        title="Data Santri"
        description="Kelola informasi & keuangan santri"
      />

      <section className="w-full flex-1 flex flex-col gap-3 px-4 pt-3 pb-24">
        {/* Smart Search Bar */}
        <Card hasRing={false} className="rounded-2xl border border-slate-100 bg-white p-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Search className="size-4.5 text-slate-400 shrink-0" />
            <Input
              className="border-0 shadow-none focus-visible:ring-0 text-sm h-auto p-0 placeholder:text-slate-400"
              placeholder="Cari nama, kelas, atau kamar santri..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </Card>

        {/* Dropdown Filters (Kamar & Kelas) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Kamar Dropdown */}
          <div className="relative">
            <select
              value={selectedKamar}
              onChange={(e) => setSelectedKamar(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs outline-none pr-8 truncate"
            >
              <option value="all">Semua Kamar</option>
              {kamarOptions.map((kamar) => (
                <option key={kamar} value={kamar}>
                  {kamar}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          </div>

          {/* Kelas Dropdown */}
          <div className="relative">
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs outline-none pr-8 truncate"
            >
              <option value="all">Semua Kelas</option>
              {kelasOptions.map((kelas) => (
                <option key={kelas} value={kelas}>
                  {kelas}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          </div>
        </div>

        {/* Quick Saldo Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => setSaldoFilter("all")}
            className={`shrink-0 rounded-full px-3 py-1.5 font-bold transition-all ${
              saldoFilter === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Semua ({allStudents.length})
          </button>
          <button
            type="button"
            onClick={() => setSaldoFilter("low")}
            className={`shrink-0 rounded-full px-3 py-1.5 font-bold transition-all ${
              saldoFilter === "low"
                ? "bg-amber-500 text-white shadow-xs"
                : "border border-amber-200 bg-amber-50/70 text-amber-700 hover:bg-amber-100"
            }`}
          >
            ⚠️ Saldo Menipis ({lowCount})
          </button>
          <button
            type="button"
            onClick={() => setSaldoFilter("empty")}
            className={`shrink-0 rounded-full px-3 py-1.5 font-bold transition-all ${
              saldoFilter === "empty"
                ? "bg-red-600 text-white shadow-xs"
                : "border border-red-200 bg-red-50/70 text-red-700 hover:bg-red-100"
            }`}
          >
            🚫 Saldo Habis ({emptyCount})
          </button>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between px-1 text-xs font-semibold text-slate-500">
          <span>
            Menampilkan <strong className="text-slate-800">{filteredStudents.length}</strong> dari {allStudents.length} santri
          </span>
          {(selectedKamar !== "all" || selectedKelas !== "all" || saldoFilter !== "all" || search) && (
            <button
              type="button"
              onClick={() => {
                setSelectedKamar("all");
                setSelectedKelas("all");
                setSaldoFilter("all");
                setSearch("");
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Content State: Loading, Error, or Cards */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 rounded-2xl bg-white/70" />
            <Skeleton className="h-24 rounded-2xl bg-white/70" />
            <Skeleton className="h-24 rounded-2xl bg-white/70" />
          </div>
        ) : isError ? (
          <Card hasRing={false} className="rounded-2xl border-0 bg-white p-5 text-center shadow-xs">
            <p className="text-sm font-semibold text-red-600">
              {error instanceof Error ? error.message : "Gagal memuat data santri."}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition"
            >
              <RefreshCw className="size-3.5" />
              Coba Lagi
            </button>
          </Card>
        ) : filteredStudents.length === 0 ? (
          <Card hasRing={false} className="rounded-2xl border-0 bg-white p-8 text-center shadow-xs">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
              <Users className="size-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">Tidak ada santri ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter yang dipilih.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredStudents.map((student) => (
              <KesantrianSantriCard
                key={student.id}
                student={student}
                onClick={() => handleCardClick(student)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Action Sheet Pop-up */}
      <SantriActionSheet
        student={activeStudent}
        open={actionSheetOpen}
        onOpenChange={setActionSheetOpen}
        onTopup={handleStartTopup}
        onChangePin={handleStartPin}
        onViewDetail={handleViewDetail}
      />

      {/* Topup Dialog */}
      <MoneyActionDialog
        open={topupOpen}
        onOpenChange={setTopupOpen}
        isLoading={topupMutation.isPending}
        studentName={activeStudent?.name ?? "-"}
        uangSaku={activeStudent?.saldoUangSaku ?? 0}
        dompet={activeStudent?.saldoDompet ?? 0}
        onSubmit={handleSubmitTopup}
      />

      {/* PIN Dialog */}
      <PinDialog
        open={pinOpen}
        onOpenChange={setPinOpen}
        isLoading={pinMutation.isPending}
        onSubmit={handleSubmitPin}
      />
    </main>
  );
}
