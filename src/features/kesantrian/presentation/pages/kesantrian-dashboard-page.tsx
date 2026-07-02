import { Navigate } from "react-router-dom";
import { KesantrianShell } from "../components/kesantrian-shell";

export function KesantrianDashboardPage() {
  return <KesantrianShell />;
}

export function KesantrianIndexRedirect() {
  return <Navigate to="/kesantrian/perijinan" replace />;
}
