import { prismaRepositories } from "@/services/prisma-repositories";
import { handle, ok } from "@/lib/api-route";

export const GET = handle(async () => ok(await prismaRepositories.catalog.sellers()));
