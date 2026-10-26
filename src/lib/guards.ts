import { getSessionUser, type UserRecord } from "@/lib/auth";
import { fail } from "@/lib/api-route";

type Guard = { user: UserRecord; error?: undefined } | { user?: undefined; error: Response };

// Usage:  const auth = await requireRole("ADMIN"); if (auth.error) return auth.error;
export async function requireRole(...roles: string[]): Promise<Guard> {
  const user = await getSessionUser();
  if (!user) return { error: fail("Please sign in", 401) };
  if (!roles.includes(user.role)) return { error: fail("You do not have permission to do this", 403) };
  return { user };
}
