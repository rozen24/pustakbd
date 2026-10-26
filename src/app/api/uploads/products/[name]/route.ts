import { readFile } from "node:fs/promises";
import path from "node:path";
import { fail, handle } from "@/lib/api-route";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

// Serves uploaded images. Only names produced by the upload route are accepted,
// which also rules out path tricks like "../".
export const GET = handle(async (_req: Request, { params }: { params: Promise<{ name: string }> }) => {
  const { name } = await params;
  const match = /^[0-9a-f-]{36}\.(jpg|png|gif|webp)$/.exec(name);
  if (!match) return fail("Not found", 404);
  try {
    const data = await readFile(path.join(process.cwd(), "uploads", "products", name));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[match[1]],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return fail("Not found", 404);
  }
});
