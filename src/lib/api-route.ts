// Small helpers shared by the route handlers in src/app/api.
import { NextResponse } from "next/server";

export const ok = (data: unknown, init?: ResponseInit) => NextResponse.json(data ?? null, init);
export const fail = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

// Your ids are PostgreSQL UUIDs. Passing anything else to Prisma throws, so
// check first and treat malformed ids as "not found".
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string) => UUID.test(v);

// Reads a JSON body as a plain object ({} when missing or invalid).
export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

// Trimmed, length-limited string ("" when the value is not a string).
export const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Wraps a handler so unexpected errors become a JSON 500 instead of an HTML page.
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      console.error("API error:", err);
      return fail("Internal server error", 500);
    }
  };
}
