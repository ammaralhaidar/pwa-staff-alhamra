export type ApiEnvelope<T> = {
  data?: T;
  error?: string;
};

export async function apiFetch<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!response.ok) {
    throw new Error(payload.error || `Request gagal (${response.status})`);
  }

  return (payload.data ?? payload) as T;
}
