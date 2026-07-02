export type KeamananActionType = "checkout" | "checkin";

export type KeamananTab = "checkout" | "outside";

export type KeamananTimeRange = "today" | "7days" | "30days" | "all";

export type KeamananPermissionStatus = "approved" | "outside" | "returned" | "rejected" | "cancelled" | "unknown";

export type KeamananDashboardParams = {
  states?: string[];
  search?: string;
  limit?: number;
  offset?: number;
};

export type KeamananSummary = {
  totalPerijinan: number;
  disetujui: number;
  ijinKeluar: number;
};

export type KeamananPermission = {
  id: number;
  permissionId: number;
  perijinanId?: number;
  reference?: string;
  studentName: string;
  studentNis?: string;
  nis?: string;
  className?: string;
  kelas?: string;
  kamar?: string;
  halaqoh?: string;
  musyrif?: string;
  state: string;
  stateLabel: string;
  status?: KeamananPermissionStatus;
  statusLabel?: string;
  reason?: string;
  keperluan?: string;
  dateStart?: string;
  tglIjin?: string;
  dateReturn?: string;
  tglKembali?: string;
  lamaIzin?: string;
  duration?: string;
  durasi?: string;
  penjemput?: string;
  jamPenjemputan?: string;
  waktuKeluar?: string;
  waktuKembali?: string;
  terlambatHari?: number;
  note?: string;
  catatan?: string;
  avatarUrl?: string;
  raw?: Record<string, unknown>;
};

export type KeamananDashboard = {
  summary: KeamananSummary;
  permissions: KeamananPermission[];
};

export type KeamananScanResult = {
  actionType: KeamananActionType;
  permission: KeamananPermission;
  message?: string;
};

export type KeamananManualSearch = {
  matchType: "single" | "multiple" | "none";
  result?: KeamananScanResult;
  list: KeamananScanResult[];
};

export type KeamananUpdatePayload = {
  permissionId: number;
  actionType: KeamananActionType;
};

export type KeamananActionPayload = {
  permissionId: number;
  perijinanId?: number;
  permission?: KeamananPermission;
};

export type KeamananProfile = {
  name: string;
  email: string;
  role: string;
  initials: string;
  hasSessionData: boolean;
};
