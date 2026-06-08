import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { resolveDirectDatabaseUrl } from "@/lib/pg-url";

// HMR-safe singleton: Next dev re-imports modules on every change, which would
// otherwise open a new connection pool each time and exhaust the database.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  // Prisma 7 connects through a driver adapter. `resolveDirectDatabaseUrl()`
  // returns DATABASE_URL as-is for a plain postgres:// URL (and still decodes a
  // legacy prisma+postgres:// URL, if one is ever set, for backward compat).
  const adapter = new PrismaPg({ connectionString: resolveDirectDatabaseUrl() });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
