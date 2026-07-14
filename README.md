# Alhamra PWA

Frontend PWA Alhamra berbasis React, TypeScript, Vite, Tailwind CSS, dan TanStack Query.

## Development

```bash
npm install
npm run dev
```

Copy `.env.example` menjadi `.env`, lalu isi nilai yang dibutuhkan.

```env
VITE_ODOO_BASE_URL=
VITE_ODOO_DATABASE=your_odoo_database
ODOO_PROXY_TARGET=https://example-odoo-host.test
VITE_AUTH_BYPASS=false
VITE_ENABLE_FALLBACK_DATA=true
VITE_API_DEBUG=true
VITE_PWA_DEV=false
```

Saat development, request `/api/*` diproxy oleh `vite.config.ts` ke Odoo agar tidak terkena CORS browser.

## Environment Strategy

Frontend selalu memanggil endpoint relatif:

```txt
/api/v2/...
```

Nilai server dan database dibedakan lewat environment, bukan hardcode source code.

| Environment | ODOO_PROXY_TARGET | VITE_ODOO_DATABASE | Catatan |
| --- | --- | --- | --- |
| Local Development | Odoo dev host | Database dev | Diisi di `.env` lokal, tidak di-commit |
| Vercel Preview | Odoo dev/staging host | Database dev/staging | Diisi di Vercel Preview Environment Variables |
| Vercel Production | Odoo production host | Database production | Diisi di Vercel Production Environment Variables |

Jangan upload `.env`. Gunakan `.env.example` sebagai template saja.

## Build

```bash
npm run build
```

Output build ada di `dist`.

## Vercel

Project ini memakai `vercel.json`.

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Environment variables yang disarankan di Vercel:

```env
VITE_ODOO_BASE_URL=
VITE_ODOO_DATABASE=
ODOO_PROXY_TARGET=
VITE_AUTH_BYPASS=false
VITE_ENABLE_FALLBACK_DATA=false
VITE_API_DEBUG=false
VITE_PWA_DEV=false
```

Production proxy berada di `api/odoo.ts`. Route Vercel meneruskan request `/api/*` ke Function tersebut, lalu ke `ODOO_PROXY_TARGET`. Dengan pola ini, browser tidak request langsung ke Odoo dan tidak terkena CORS.

Pastikan environment variable Vercel dipisah antara Preview dan Production agar database dev dan production tidak tercampur.

## Git Safety

File `.env` tidak boleh di-commit. Gunakan `.env.example` untuk template konfigurasi.
