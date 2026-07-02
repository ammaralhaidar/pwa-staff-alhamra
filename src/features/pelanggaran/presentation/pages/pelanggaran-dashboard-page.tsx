import type { PelanggaranAccessType } from "../../domain/pelanggaran-types";
import { PelanggaranShell } from "../components/pelanggaran-shell";

export function PelanggaranDashboardPage({ accessType }: { accessType: PelanggaranAccessType }) {
  return <PelanggaranShell accessType={accessType} />;
}
