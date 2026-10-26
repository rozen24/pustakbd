// Backend-agnostic HTTP client. All data access goes through this app's own
// Next.js route handlers (src/app/api/**/route.ts), which talk to PostgreSQL via
// Prisma on the server. This file is the only place that knows the transport.
//
// Auth is cookie-based (session cookie set by the server), so the browser sends
// it automatically on same-origin requests. No tokens are handled here.

export const BASE = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api`;
// export const BASE = "/api";

async function parse(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "same-origin",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await parse(res);
  if (!res.ok) {
    const message = data?.error ?? `Request failed (${res.status})`;
    console.error(`API ${method} ${path} failed:`, message);
    throw new Error(message);
  }
  return data as T;
}

// Multipart upload (files). Do NOT set Content-Type: the browser adds the
// multipart boundary itself.
async function upload<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    credentials: "same-origin",
    body: formData,
  });
  const data = await parse(res);
  if (!res.ok) {
    const message = data?.error ?? `Upload failed (${res.status})`;
    console.error(`API POST ${path} failed:`, message);
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
  del: <T>(path: string, body?: unknown) => request<T>("DELETE", path, body),
  upload,
};