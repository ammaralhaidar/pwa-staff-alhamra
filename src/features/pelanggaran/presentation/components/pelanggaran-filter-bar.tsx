import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PelanggaranFilter } from "../../domain/pelanggaran-types";

type Props = {
  filter: PelanggaranFilter;
  onChange: (filter: PelanggaranFilter) => void;
};

export function PelanggaranFilterBar({ filter, onChange }: Props) {
  return (
    <div className="space-y-3">
      <Card className="rounded-[22px] border-0 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Search className="size-4 text-slate-400" />
          <Input
            className="border-0 shadow-none focus-visible:ring-0"
            placeholder="Cari nama atau nomor referensi"
            value={filter.search}
            onChange={(event) => onChange({ ...filter, search: event.target.value })}
          />
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Select value={filter.timeRange} onValueChange={(value) => onChange({ ...filter, timeRange: value as PelanggaranFilter["timeRange"] })}>
          <SelectTrigger className="rounded-2xl bg-white"><SelectValue placeholder="Waktu" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hari Ini</SelectItem>
            <SelectItem value="7days">7 Hari</SelectItem>
            <SelectItem value="30days">30 Hari</SelectItem>
            <SelectItem value="all">Semua</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.status} onValueChange={(value) => onChange({ ...filter, status: value as PelanggaranFilter["status"] })}>
          <SelectTrigger className="rounded-2xl bg-white"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="proses">Proses</SelectItem>
            <SelectItem value="validasi">Validasi</SelectItem>
            <SelectItem value="selesai">Selesai</SelectItem>
            <SelectItem value="batal">Batal</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
