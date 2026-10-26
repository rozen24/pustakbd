export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Adds the base path to a same-site URL such as "/logo.png". It does nothing when there is no base path.
export const withBase = (p: string) =>
  p.startsWith("/") && !p.startsWith("//") && !p.startsWith(`${BASE_PATH}/`) ? BASE_PATH + p : p;