import React, { useState, useRef } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Info,
  AlertTriangle,
  HeartHandshake,
  Eye,
  Edit3,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  whatsappToHtml,
  SALAM_PEMBUKA_WA,
  SALAM_PENUTUP_WA,
  KONTAK_RESMI_WA,
} from "../utils/whatsapp-format";

interface RichPengumumanEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichPengumumanEditor({
  value,
  onChange,
  placeholder = "Tuliskan isi pengumuman di sini... (Format ala WhatsApp seperti *teks tebal*, _teks miring_, - poin daftar, atau !info)",
}: RichPengumumanEditorProps) {
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [showTutorial, setShowTutorial] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper untuk menerapkan format di posisi kursor / teks yang diblok
  const applyFormat = (type: string, payload?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      if (payload) {
        onChange(value ? `${value}\n\n${payload}` : payload);
      }
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);

    let newText = "";
    let newCursorPos = start;

    switch (type) {
      case "bold":
        if (selected) {
          newText = `${before}*${selected}*${after}`;
          newCursorPos = end + 2;
        } else {
          newText = `${before}*teks tebal*${after}`;
          newCursorPos = start + 1;
        }
        break;

      case "italic":
        if (selected) {
          newText = `${before}_${selected}_${after}`;
          newCursorPos = end + 2;
        } else {
          newText = `${before}_teks miring_${after}`;
          newCursorPos = start + 1;
        }
        break;

      case "strike":
        if (selected) {
          newText = `${before}~${selected}~${after}`;
          newCursorPos = end + 2;
        } else {
          newText = `${before}~teks coret~${after}`;
          newCursorPos = start + 1;
        }
        break;

      case "bullet":
        if (selected) {
          const lines = selected.split("\n").map((l) => (l.startsWith("- ") ? l : `- ${l}`));
          newText = `${before}${lines.join("\n")}${after}`;
          newCursorPos = start + lines.join("\n").length;
        } else {
          const prefix = before.length > 0 && !before.endsWith("\n") ? "\n- " : "- ";
          newText = `${before}${prefix}Poin rincian...${after}`;
          newCursorPos = before.length + prefix.length;
        }
        break;

      case "number":
        if (selected) {
          let idx = 1;
          const lines = selected.split("\n").map((l) => `${idx++}. ${l.replace(/^\d+[.)]\s*/, "")}`);
          newText = `${before}${lines.join("\n")}${after}`;
          newCursorPos = start + lines.join("\n").length;
        } else {
          const prefix = before.length > 0 && !before.endsWith("\n") ? "\n1. " : "1. ";
          newText = `${before}${prefix}Langkah rincian...${after}`;
          newCursorPos = before.length + prefix.length;
        }
        break;

      case "info":
        {
          const prefix = before.length > 0 && !before.endsWith("\n") ? "\n!info " : "!info ";
          const body = selected ? selected : "Tuliskan keterangan informasi penting di sini...";
          newText = `${before}${prefix}${body}${after}`;
          newCursorPos = before.length + prefix.length;
        }
        break;

      case "penting":
        {
          const prefix = before.length > 0 && !before.endsWith("\n") ? "\n!penting " : "!penting ";
          const body = selected ? selected : "Catatan atau perhatian khusus bagi wali santri...";
          newText = `${before}${prefix}${body}${after}`;
          newCursorPos = before.length + prefix.length;
        }
        break;

      case "insert":
        if (payload) {
          const prefix = before.length > 0 && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
          newText = `${before}${prefix}${payload}${after}`;
          newCursorPos = before.length + prefix.length + payload.length;
        }
        break;

      default:
        return;
    }

    onChange(newText);

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 20);
  };

  // Smart keyboard Enter handling (Auto continuation for - bullet and 1. numbering)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const cursor = textarea.selectionStart;
      const textBefore = value.substring(0, cursor);
      const textAfter = value.substring(cursor);

      // Cari baris terakhir sebelum kursor
      const lastLineStart = textBefore.lastIndexOf("\n") + 1;
      const currentLine = textBefore.substring(lastLineStart);

      // 1. Cek apakah baris saat ini adalah Bullet List: "- " atau "• "
      const bulletMatch = currentLine.match(/^([-•*])\s*(.*)$/);
      if (bulletMatch) {
        const bulletSymbol = bulletMatch[1];
        const content = bulletMatch[2];

        // Jika baris kosong (hanya ada "- " tanpa teks), tekan Enter menghapus bullet dan keluar dari list
        if (!content.trim()) {
          e.preventDefault();
          const cleanBefore = textBefore.substring(0, lastLineStart);
          const newValue = `${cleanBefore}\n${textAfter}`;
          onChange(newValue);
          setTimeout(() => {
            textarea.setSelectionRange(lastLineStart + 1, lastLineStart + 1);
          }, 10);
          return;
        }

        // Jika ada teks, otomatis sambung bullet baru pada baris berikutnya
        e.preventDefault();
        const continuation = `\n${bulletSymbol} `;
        const newValue = `${textBefore}${continuation}${textAfter}`;
        onChange(newValue);
        setTimeout(() => {
          const newPos = cursor + continuation.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 10);
        return;
      }

      // 2. Cek apakah baris saat ini adalah Numbered List: "1. ", "2. ", dst.
      const numberMatch = currentLine.match(/^(\d+)[.)]\s*(.*)$/);
      if (numberMatch) {
        const currentNum = parseInt(numberMatch[1], 10);
        const content = numberMatch[2];

        // Jika baris kosong (hanya nomor tanpa teks), tekan Enter keluar dari numbering
        if (!content.trim()) {
          e.preventDefault();
          const cleanBefore = textBefore.substring(0, lastLineStart);
          const newValue = `${cleanBefore}\n${textAfter}`;
          onChange(newValue);
          setTimeout(() => {
            textarea.setSelectionRange(lastLineStart + 1, lastLineStart + 1);
          }, 10);
          return;
        }

        // Otomatis lanjut ke nomor berikutnya
        e.preventDefault();
        const continuation = `\n${currentNum + 1}. `;
        const newValue = `${textBefore}${continuation}${textAfter}`;
        onChange(newValue);
        setTimeout(() => {
          const newPos = cursor + continuation.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 10);
        return;
      }
    }
  };

  // Preview HTML
  const renderedHtml = whatsappToHtml(value);
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div className="w-full space-y-2">
      {/* Top Header: Tab Switcher & Quick Tutorial Button */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === "editor"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Edit3 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Tulis (Ala WhatsApp)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === "preview"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="h-3.5 w-3.5 text-blue-600" />
            <span>Pratinjau Tampilan</span>
            {value.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Tombol Toggle Petunjuk Cara Ketik */}
        <button
          type="button"
          onClick={() => setShowTutorial(!showTutorial)}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition ${
            showTutorial
              ? "bg-amber-50 text-amber-900 border-amber-300"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5 text-amber-600" />
          <span className="hidden sm:inline">Petunjuk Format</span>
          <span className="sm:hidden">Petunjuk</span>
          {showTutorial ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Tutorial / Petunjuk Lengkap Ala WhatsApp (Collapsible) */}
      {showTutorial && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs space-y-3 shadow-sm transition animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>Cara Mengetik Format Cepat (Persis Seperti WhatsApp)</span>
            </div>
            <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
              Bebas Kode HTML
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
            {/* 1. Format Teks Dasar */}
            <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200/80 space-y-1.5">
              <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider text-amber-900">
                1. Huruf Tebal, Miring & Coret
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <code>*Teks Tebal*</code>
                  <span className="font-bold text-slate-900">Teks Tebal</span>
                </div>
                <div className="flex items-center justify-between">
                  <code>_Teks Miring_</code>
                  <span className="italic text-slate-700">Teks Miring</span>
                </div>
                <div className="flex items-center justify-between">
                  <code>~Teks Coret~</code>
                  <span className="line-through text-slate-500">Teks Coret</span>
                </div>
              </div>
            </div>

            {/* 2. Daftar & Urutan */}
            <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200/80 space-y-1.5">
              <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider text-amber-900">
                2. Daftar Otomatis (Auto Enter)
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <code>- Poin 1</code>
                  <span>• Poin 1 <em className="text-[10px] text-emerald-600">(Enter sambung otomatis)</em></span>
                </div>
                <div className="flex items-center justify-between">
                  <code>1. Langkah 1</code>
                  <span>1. Langkah 1 <em className="text-[10px] text-emerald-600">(Enter jadi 2.)</em></span>
                </div>
                <div className="text-[10px] text-slate-500 italic mt-0.5">
                  *Tekan Enter 2x untuk keluar dari daftar.
                </div>
              </div>
            </div>

            {/* 3. Kotak Highlight Pesantren */}
            <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200/80 space-y-1.5">
              <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider text-amber-900">
                3. Kotak Highlight Pengumuman
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <code>!info [teks]</code>
                  <span className="text-blue-600 font-semibold">📌 Kotak Info Biru</span>
                </div>
                <div className="flex items-center justify-between">
                  <code>!penting [teks]</code>
                  <span className="text-amber-600 font-semibold">⚠️ Kotak Perhatian Kuning</span>
                </div>
                <div className="flex items-center justify-between">
                  <code>!sukses [teks]</code>
                  <span className="text-emerald-600 font-semibold">✅ Kotak Berita Baik Hijau</span>
                </div>
                <div className="flex items-center justify-between">
                  <code>!larangan [teks]</code>
                  <span className="text-red-600 font-semibold">⛔ Kotak Larangan Merah</span>
                </div>
              </div>
            </div>

            {/* 4. Template Resmi Pesantren */}
            <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200/80 space-y-1.5">
              <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider text-amber-900">
                4. Shortcut Teks Resmi Pesantren
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <code>!salam</code>
                  <button
                    type="button"
                    onClick={() => applyFormat("insert", SALAM_PEMBUKA_WA)}
                    className="text-emerald-700 underline font-medium hover:text-emerald-900"
                  >
                    + Sisipkan Salam Pembuka
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <code>!wassalam</code>
                  <button
                    type="button"
                    onClick={() => applyFormat("insert", SALAM_PENUTUP_WA)}
                    className="text-emerald-700 underline font-medium hover:text-emerald-900"
                  >
                    + Sisipkan Salam Penutup
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <code>!kontak</code>
                  <button
                    type="button"
                    onClick={() => applyFormat("insert", KONTAK_RESMI_WA)}
                    className="text-blue-700 underline font-medium hover:text-blue-900"
                  >
                    + Sisipkan Narahubung
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor Tab vs Preview Tab */}
      {activeTab === "editor" ? (
        <div className="space-y-2">
          {/* Quick Toolbar Horisontal di atas Keyboard */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none text-xs">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyFormat("bold")}
              className="h-8 px-2.5 rounded-lg border-slate-200 hover:bg-slate-100 font-bold"
              title="Tebal (*teks*)"
            >
              <Bold className="h-3.5 w-3.5 mr-1" />
              <span>Tebal</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyFormat("italic")}
              className="h-8 px-2.5 rounded-lg border-slate-200 hover:bg-slate-100 italic"
              title="Miring (_teks_)"
            >
              <Italic className="h-3.5 w-3.5 mr-1" />
              <span>Miring</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyFormat("strike")}
              className="h-8 px-2 rounded-lg border-slate-200 hover:bg-slate-100"
              title="Coret (~teks~)"
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </Button>

            <div className="h-4 w-px bg-slate-300 mx-0.5" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyFormat("bullet")}
              className="h-8 px-2.5 rounded-lg border-slate-200 hover:bg-slate-100"
              title="Daftar Poin (- teks)"
            >
              <List className="h-3.5 w-3.5 mr-1 text-indigo-600" />
              <span>Poin</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyFormat("number")}
              className="h-8 px-2.5 rounded-lg border-slate-200 hover:bg-slate-100"
              title="Daftar Nomor (1. teks)"
            >
              <ListOrdered className="h-3.5 w-3.5 mr-1 text-indigo-600" />
              <span>Nomor</span>
            </Button>

            <div className="h-4 w-px bg-slate-300 mx-0.5" />

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyFormat("info")}
              className="h-8 px-2.5 rounded-lg border-blue-200 bg-blue-50/70 text-blue-800 hover:bg-blue-100"
              title="Kotak Info (!info)"
            >
              <Info className="h-3.5 w-3.5 mr-1 text-blue-600" />
              <span>Kotak Info</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyFormat("penting")}
              className="h-8 px-2.5 rounded-lg border-amber-200 bg-amber-50/70 text-amber-800 hover:bg-amber-100"
              title="Kotak Perhatian (!penting)"
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1 text-amber-600" />
              <span>Penting</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyFormat("insert", SALAM_PEMBUKA_WA)}
              className="h-8 px-2.5 rounded-lg border-emerald-200 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 whitespace-nowrap"
              title="Sisipkan Salam Islami"
            >
              <HeartHandshake className="h-3.5 w-3.5 mr-1 text-emerald-600" />
              <span>+ Salam</span>
            </Button>
          </div>

          {/* Kotak Teks Bersih (Zero HTML) */}
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={11}
              className="w-full text-[14px] leading-relaxed font-sans rounded-xl border-slate-200 bg-white p-3.5 focus:border-slate-800 focus:ring-slate-800 transition"
            />
          </div>

          {/* Bottom stats & quick hint */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <div className="flex items-center gap-2">
              <span>{wordCount} kata</span>
              <span>•</span>
              <span>{charCount} karakter</span>
            </div>
            <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              💡 Tekan Enter pada daftar otomatis sambung
            </div>
          </div>
        </div>
      ) : (
        /* Live Preview Tab: Tampilan Persis di HP Orang Tua */
        <div className="space-y-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 min-h-[260px] shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pratinjau Tampilan di Aplikasi Wali Santri
              </span>
              <span className="text-[11px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md">
                Format Resmi Al Hamra
              </span>
            </div>

            {value.trim() ? (
              <div
                className="prose prose-sm max-w-none text-slate-800 leading-relaxed font-sans"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
                <Edit3 className="h-8 w-8 mb-2 stroke-1 text-slate-300" />
                <p className="text-xs">Belum ada teks yang ditulis.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Kembali ke tab "Tulis" untuk mulai menyusun pengumuman.
                </p>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Pratinjau ini menggunakan styling standar yang sama dengan yang tampil di PWA Orangtua.
          </div>
        </div>
      )}
    </div>
  );
}
