import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type InfoItem = {
  label: string;
  value?: string | number | null;
};

type Props = {
  title: string;
  items: InfoItem[];
};

export function DetailInfoCard({ title, items }: Props) {
  return (
    <Card className="rounded-3xl border-blue-100 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
            <span className="text-sm text-slate-500">{item.label}</span>
            <span className="max-w-[60%] text-right text-sm font-medium text-slate-900">{item.value ?? "-"}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
