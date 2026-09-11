/**
 * WhatsApp Format Parser for Pesantren IBS Al Hamra Pengumuman
 * 
 * Mengonversi format penulisan ala WhatsApp (*teks*, _teks_, ~teks~, list -, list 1., callout !info, dll)
 * menjadi HTML resmi standar Al Hamra yang rapi, responsive, dan aman untuk disimpan di Odoo.
 * Serta mengonversi kembali HTML lama ke teks WhatsApp bersih saat mode edit.
 */

// Salam Resmi Pembuka
export const SALAM_PEMBUKA_WA = `*Assalamu\'alaikum Warahmatullahi Wabarakatuh,*

Segala puji bagi Allah SWT yang senantiasa melimpahkan rahmat dan hidayah-Nya kepada kita semua. Shalawat serta salam semoga senantiasa tercurahkan kepada Baginda Nabi Muhammad SAW.`;

// Salam Resmi Penutup
export const SALAM_PENUTUP_WA = `Demikian pemberitahuan ini kami sampaikan. Atas perhatian, dukungan, dan kerja sama Bapak/Ibu Wali Santri sekalian, kami haturkan terima kasih. _Jazakumullahu Khairan Katsiran._

*Wassalamu\'alaikum Warahmatullahi Wabarakatuh.*`;

// Kontak Resmi
export const KONTAK_RESMI_WA = `!info *Narahubung Layanan Resmi IBS Al Hamra:*
- Layanan Kesantrian (Musyrif): 0812-3456-7890
- Layanan Administrasi & Keuangan: 0813-9876-5432
- Email: info@ibsalhamra.sch.id`;

/**
 * Mengonversi inline formatting WhatsApp:
 * *bold* -> <strong>...</strong>
 * _italic_ -> <em>...</em>
 * ~strike~ -> <del>...</del>
 */
export function formatInlineWA(text: string): string {
  let res = text;
  // Escape raw HTML tags entered by user to ensure clean text
  res = res
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold: *teks*
  res = res.replace(/(^|[^\*\w])\*([^\*\n]+)\*(?!\w)/g, '$1<strong style="font-weight: 700; color: #0F172A;">$2</strong>');

  // Italic: _teks_
  res = res.replace(/(^|[^_\w])_([^_\n]+)_(?!\w)/g, '$1<em style="font-style: italic; color: #334155;">$2</em>');

  // Strike: ~teks~
  res = res.replace(/(^|[^~\w])~([^~\n]+)~(?!\w)/g, '$1<del style="text-decoration: line-through; opacity: 0.75;">$2</del>');


  return res;

}

/**
 * Mengonversi teks penulisan ala WhatsApp menjadi HTML lengkap Al Hamra
 */
export function whatsappToHtml(waText: string): string {
  if (!waText || !waText.trim()) return "";

  // Replace salam macros jika ada
  let content = waText;
  content = content.replace(/^!salam\b/gim, SALAM_PEMBUKA_WA);
  content = content.replace(/^!wassalam\b/gim, SALAM_PENUTUP_WA);
  content = content.replace(/^!kontak\b/gim, KONTAK_RESMI_WA);

  const lines = content.split(/\r?\n/);
  const htmlBlocks: string[] = [];

  let currentListType: "ul" | "ol" | null = null;
  let listItems: string[] = [];

  const flushList = () => {
    if (currentListType && listItems.length > 0) {
      if (currentListType === "ul") {
        htmlBlocks.push(
          `<ul style="padding-left: 20px; margin: 10px 0 16px; line-height: 1.7; color: #334155; list-style-type: disc;">\n` +
            listItems.map((li) => `  <li style="margin-bottom: 6px;">${li}</li>`).join("\n") +
            `\n</ul>`
        );
      } else {
        htmlBlocks.push(
          `<ol style="padding-left: 20px; margin: 10px 0 16px; line-height: 1.7; color: #334155;">\n` +
            listItems.map((li) => `  <li style="margin-bottom: 6px;">${li}</li>`).join("\n") +
            `\n</ol>`
        );
      }
      currentListType = null;
      listItems = [];
    }
  };

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // 1. Empty Line
    if (!line) {
      flushList();
      i++;
      continue;
    }

    // 2. Callouts: !info, !penting, !sukses, !larangan
    const calloutMatch = line.match(/^!(info|penting|warning|sukses|larangan)\s*(.*)$/i);
    if (calloutMatch) {
      flushList();
      const type = calloutMatch[1].toLowerCase();
      let calloutText = calloutMatch[2];

      // Ambil baris lanjutan dari callout sampai baris kosong atau blok lain
      i++;
      const subLines: string[] = [];
      if (calloutText) subLines.push(calloutText);
      while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith("!")) {
        subLines.push(lines[i].trim());
        i++;
      }

      const formattedBody = subLines
        .map((sl) => {
          if (sl.startsWith("- ") || sl.startsWith("• ") || sl.startsWith("* ")) {
            return `• ${formatInlineWA(sl.replace(/^[-•*]\s+/, ""))}`;
          }
          return formatInlineWA(sl);
        })
        .join("<br/>\n    ");

      if (type === "info") {
        htmlBlocks.push(
          `<div style="background: #EFF6FF; border-left: 4px solid #2563EB; padding: 14px 18px; border-radius: 8px; margin: 16px 0; font-size: 13.5px; line-height: 1.65; color: #1E3A8A;">\n` +
          `  <div style="font-weight: 700; color: #1E40AF; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">📌 INFORMASI PENTING</div>\n` +
          `  <div style="color: #1E3A8A;">\n    ${formattedBody}\n  </div>\n` +
          `</div>`
        );
      } else if (type === "penting" || type === "warning") {
        htmlBlocks.push(
          `<div style="background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 14px 18px; border-radius: 8px; margin: 16px 0; font-size: 13.5px; line-height: 1.65; color: #92400E;">\n` +
          `  <div style="font-weight: 700; color: #B45309; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">⚠️ PERHATIAN / CATATAN KHUSUS</div>\n` +
          `  <div style="color: #92400E;">\n    ${formattedBody}\n  </div>\n` +
          `</div>`
        );
      } else if (type === "sukses") {
        htmlBlocks.push(
          `<div style="background: #F0FDF4; border-left: 4px solid #16A34A; padding: 14px 18px; border-radius: 8px; margin: 16px 0; font-size: 13.5px; line-height: 1.65; color: #166534;">\n` +
          `  <div style="font-weight: 700; color: #15803D; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">✅ PEMBERITAHUAN RESMI</div>\n` +
          `  <div style="color: #166534;">\n    ${formattedBody}\n  </div>\n` +
          `</div>`
        );
      } else if (type === "larangan") {
        htmlBlocks.push(
          `<div style="background: #FEF2F2; border-left: 4px solid #DC2626; padding: 14px 18px; border-radius: 8px; margin: 16px 0; font-size: 13.5px; line-height: 1.65; color: #991B1B;">\n` +
          `  <div style="font-weight: 700; color: #B91C1C; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">⛔ LARANGAN & KETENTUAN KETAT</div>\n` +
          `  <div style="color: #991B1B;">\n    ${formattedBody}\n  </div>\n` +
          `</div>`
        );
      }
      continue;
    }

    // 3. Bullet list item: "- " or "• " or "* "
    if (/^[-•]\s+/.test(line) || (/^\*\s+/.test(line) && !/\*.*\*/.test(line))) {
      const itemText = line.replace(/^[-•*]\s+/, "");
      if (currentListType !== "ul") {
        flushList();
        currentListType = "ul";
      }
      listItems.push(formatInlineWA(itemText));
      i++;
      continue;
    }

    // 4. Numbered list item: "1. ", "2. ", etc.
    const numMatch = line.match(/^(\d+)[.)]\s+(.*)$/);
    if (numMatch) {
      const itemText = numMatch[2];
      if (currentListType !== "ol") {
        flushList();
        currentListType = "ol";
      }
      listItems.push(formatInlineWA(itemText));
      i++;
      continue;
    }

    // 5. Quote: "> ..."
    if (line.startsWith(">")) {
      flushList();
      const quoteText = line.replace(/^>\s*/, "");
      htmlBlocks.push(
        `<blockquote style="border-left: 4px solid #3B82F6; padding: 10px 16px; margin: 16px 0; background: #F8FAFC; color: #475569; font-style: italic; border-radius: 0 8px 8px 0; line-height: 1.6;">${formatInlineWA(quoteText)}</blockquote>`
      );
      i++;
      continue;
    }

    // 6. Normal Paragraph or Heading
    flushList();

    if (line.startsWith("# ")) {
      const hText = line.replace(/^#\s+/, "");
      htmlBlocks.push(
        `<h2 style="color: #0F172A; font-size: 18px; font-weight: 800; margin: 20px 0 10px; border-bottom: 2px solid #E2E8F0; padding-bottom: 6px;">${formatInlineWA(hText)}</h2>`
      );
    } else if (line.startsWith("## ")) {
      const hText = line.replace(/^##\s+/, "");
      htmlBlocks.push(
        `<h3 style="color: #1E293B; font-size: 16px; font-weight: 700; margin: 16px 0 8px;">${formatInlineWA(hText)}</h3>`
      );
    } else {
      htmlBlocks.push(
        `<p style="font-size: 14px; line-height: 1.7; color: #334155; margin-bottom: 12px;">${formatInlineWA(line)}</p>`
      );
    }

    i++;
  }

  flushList();

  return htmlBlocks.join("\n\n");
}

/**
 * Mengonversi HTML kembali ke teks bersih WhatsApp (untuk mode edit pengumuman lama)
 * Menghilangkan tag HTML mentah seperti <h1 style="...">, <div style="..."> dsb.
 */
export function htmlToWhatsapp(html: string): string {
  if (!html || !html.trim()) return "";

  // Jika input sama sekali tidak mengandung tag HTML, kembalikan langsung
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return html.trim();
  }

  let text = html;

  // 1. Decode entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // 2. Convert Callout boxes to !info, !penting, !sukses, !larangan
  text = text.replace(/<div[^>]*border-left:\s*4px\s*solid\s*#2563EB[^>]*>[\s\S]*?📌[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>[\s\S]*?<\/div>/gi, (_, body) => {
    const clean = body.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
    return `\n!info ${clean}\n`;
  });

  text = text.replace(/<div[^>]*border-left:\s*4px\s*solid\s*#F59E0B[^>]*>[\s\S]*?⚠️[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>[\s\S]*?<\/div>/gi, (_, body) => {
    const clean = body.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
    return `\n!penting ${clean}\n`;
  });

  text = text.replace(/<div[^>]*border-left:\s*4px\s*solid\s*#16A34A[^>]*>[\s\S]*?✅[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>[\s\S]*?<\/div>/gi, (_, body) => {
    const clean = body.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
    return `\n!sukses ${clean}\n`;
  });

  text = text.replace(/<div[^>]*border-left:\s*4px\s*solid\s*#DC2626[^>]*>[\s\S]*?⛔[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>[\s\S]*?<\/div>/gi, (_, body) => {
    const clean = body.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
    return `\n!larangan ${clean}\n`;
  });

  // 3. Convert Headings
  text = text.replace(/<h[1-2][^>]*>(.*?)<\/h[1-2]>/gi, "\n# $1\n");
  text = text.replace(/<h[3-6][^>]*>(.*?)<\/h[3-6]>/gi, "\n## $1\n");

  // 4. Convert Quotes
  text = text.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, "\n> $1\n");

  // 5. Convert Lists
  text = text.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, listContent) => {
    const items = listContent.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    const formatted = items.map((item: string) => {
      const clean = item.replace(/<li[^>]*>/i, "").replace(/<\/li>/i, "").trim();
      return `- ${clean}`;
    });
    return `\n${formatted.join("\n")}\n`;
  });

  text = text.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, listContent) => {
    const items = listContent.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
    let idx = 1;
    const formatted = items.map((item: string) => {
      const clean = item.replace(/<li[^>]*>/i, "").replace(/<\/li>/i, "").trim();
      return `${idx++}. ${clean}`;
    });
    return `\n${formatted.join("\n")}\n`;
  });

  // 6. Convert inline formatting: <strong>/<b> -> *teks*, <em>/<i> -> _teks_, <del>/<s> -> ~teks~
  text = text.replace(/<(strong|b)[^>]*>(.*?)<\/(strong|b)>/gi, "*$2*");
  text = text.replace(/<(em|i)[^>]*>(.*?)<\/(em|i)>/gi, "_$2_");
  text = text.replace(/<(del|s|strike)[^>]*>(.*?)<\/(del|s|strike)>/gi, "~$2~");

  // 7. Paragraphs & Line Breaks
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");

  // 8. Strip any remaining HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // 9. Normalize multiple blank lines
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}
