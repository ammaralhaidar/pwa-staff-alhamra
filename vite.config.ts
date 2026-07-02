import type { IncomingMessage, ServerResponse } from "node:http";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

function readRequestBody(request: IncomingMessage) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on("data", (chunk: Buffer) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function copyRequestHeaders(request: IncomingMessage) {
  const headers = new Headers();
  const skippedHeaders = new Set(["host", "connection", "content-length", "accept-encoding"]);

  for (const [key, value] of Object.entries(request.headers)) {
    if (skippedHeaders.has(key.toLowerCase()) || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
      continue;
    }
    headers.set(key, value);
  }

  return headers;
}

function copyResponseHeaders(upstream: Response, response: ServerResponse) {
  const skippedHeaders = new Set(["connection", "content-encoding", "content-length", "transfer-encoding"]);

  upstream.headers.forEach((value, key) => {
    if (skippedHeaders.has(key.toLowerCase())) return;
    response.setHeader(key, value);
  });
}

function alhamraApiProxy(isDebugEnabled: boolean, odooTarget: string): Plugin {
  console.log("[alhamra-api-proxy] plugin registered");

  return {
    name: "alhamra-api-proxy",
    configureServer(server) {
      console.log("[alhamra-api-proxy] middleware mounted");

      server.middlewares.use(async (request, response, next) => {
        if (!request.url?.startsWith("/api/")) {
          next();
          return;
        }

        if (!odooTarget) {
          response.statusCode = 500;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ error: { message: "ODOO_PROXY_TARGET belum dikonfigurasi di .env lokal." } }));
          return;
        }

        const targetUrl = new URL(request.url, odooTarget).toString();
        const method = request.method ?? "GET";

        if (isDebugEnabled) {
          console.log(`[alhamra-api-proxy] ${method} ${request.url}`);
          console.log(`[alhamra-api-proxy] -> ${targetUrl}`);
        }

        try {
          const hasBody = !["GET", "HEAD"].includes(method.toUpperCase());
          const body = hasBody ? await readRequestBody(request) : undefined;
          const upstream = await fetch(targetUrl, {
            method,
            headers: copyRequestHeaders(request),
            body,
            redirect: "manual",
          });
          const responseBody = Buffer.from(await upstream.arrayBuffer());

          copyResponseHeaders(upstream, response);
          response.statusCode = upstream.status;
          response.end(responseBody);

          if (isDebugEnabled) {
            console.log(`[alhamra-api-proxy] <- ${upstream.status} ${request.url}`);
          }
        } catch (error) {
          console.error(`[alhamra-api-proxy] error for ${method} ${request.url}:`, error);
          response.statusCode = 502;
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ error: { message: "Proxy API development gagal terhubung ke Odoo." } }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isApiDebugEnabled = env.VITE_API_DEBUG === "true";
  const isPwaDevEnabled = env.VITE_PWA_DEV === "true";
  const odooTarget = env.ODOO_PROXY_TARGET ?? "";

  console.log("[vite-config] alhamra vite.config.ts loaded");
  console.log("[vite-config] mode:", mode);
  console.log("[vite-config] VITE_API_DEBUG:", env.VITE_API_DEBUG ?? "(empty)");
  console.log("[vite-config] VITE_PWA_DEV:", env.VITE_PWA_DEV ?? "(empty)");
  console.log("[vite-config] ODOO_PROXY_TARGET:", odooTarget ? "(configured)" : "(empty)");

  return {
    plugins: [
      alhamraApiProxy(isApiDebugEnabled, odooTarget),
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        devOptions: {
          enabled: isPwaDevEnabled,
        },
        manifest: {
          name: "Alhamra PWA",
          short_name: "Alhamra",
          description: "Aplikasi Alhamra PWA",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          display: "standalone",
          icons: [
            {
              src: "pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
