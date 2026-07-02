export type ApiStatus = "idle" | "loading" | "success" | "error";

export type PermissionState = "Approved" | "Permission" | "Ijin_Keluar" | "rejected" | "draft" | string;

export type StudentSummary = {
  id: number;
  name: string;
  nis?: string;
  kelas?: string;
};

export type PermissionSummary = {
  id: number;
  studentName: string;
  studentNis?: string;
  state: PermissionState;
  dateStart?: string;
  dateEnd?: string;
};

export type ViolationSummary = {
  id: number;
  studentName: string;
  violationName: string;
  state: string;
  date?: string;
};
