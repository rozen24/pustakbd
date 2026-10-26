import { getSessionUser, toProfile } from "@/lib/auth";
import { handle, ok } from "@/lib/api-route";

// Returns the signed-in profile, or null (status 200) when logged out.
export const GET = handle(async () => {
  const user = await getSessionUser();
  return ok(user ? toProfile(user) : null);
});
