import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  title?: string;
};

export function ManagerNoteCard({ value, onChange, readOnly, title = "Catatan Manager" }: Props) {
  return (
    <Card className="rounded-3xl border-blue-100 bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          readOnly={readOnly}
          placeholder="Tuliskan catatan atau keterangan..."
          className="min-h-24 rounded-2xl border-blue-100"
        />
        {!readOnly ? <p className="mt-2 text-xs text-slate-500">Catatan ini dikirim bersama keputusan.</p> : null}
      </CardContent>
    </Card>
  );
}
