import { RolePageSkeleton } from "@/components/feedback/page-skeletons";

interface PageLoadingStateProps {
  label?: string;
}

export function PageLoadingState({ label = "Memuat data..." }: PageLoadingStateProps) {
  return <RolePageSkeleton label={label} />;
}
