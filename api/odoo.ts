import type { IncomingMessage, ServerResponse } from "node:http";

const skippedRequestHeaders = new Set(["host", "connection", "content-length", "accept-encoding"]);
const skippedResponseHeaders = new Set(["connection", "content-encoding", "content-length", "transfer-encoding"]);

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

  for (const [key, value] of Object.entries(request.headers)) {
    if (skippedRequestHeaders.has(key.toLowerCase()) || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
      continue;
    }
    headers.set(key, value);
  }

  return headers;
}

function copyResponseHeaders(upstream: Response, response: ServerResponse) {
  upstream.headers.forEach((value, key) => {
    if (skippedResponseHeaders.has(key.toLowerCase())) return;
    response.setHeader(key, value);
  });
}

function getTargetUrl(request: IncomingMessage, odooTarget: string) {
  const requestUrl = new URL(request.url ?? "/", "https://pwa.invalid");
  const apiPath = requestUrl.searchParams.get("path") ?? "";

  if (!apiPath.startsWith("v2/")) {
    return null;
  }

  const targetUrl = new URL(`/api/${apiPath}`, odooTarget);

  requestUrl.searchParams.forEach((value, key) => {
    if (key !== "path") targetUrl.searchParams.append(key, value);
  });

  return targetUrl;
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  const odooTarget = process.env.ODOO_PROXY_TARGET;

  if (!odooTarget) {
    response.statusCode = 500;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ error: { message: "ODOO_PROXY_TARGET belum dikonfigurasi." } }));
    return;
  }

  const targetUrl = getTargetUrl(request, odooTarget);

  if (!targetUrl) {
    response.statusCode = 404;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ error: { message: "Endpoint API tidak ditemukan." } }));
    return;
  }

  const method = request.method ?? "GET";

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
  } catch {
    response.statusCode = 502;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ error: { message: "Proxy production gagal terhubung ke Odoo." } }));
  }
}
