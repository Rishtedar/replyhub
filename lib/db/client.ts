import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  // The pg driver adapter connects with plain node-postgres, which (unlike
  // Prisma's own query engine) does not honor a `?schema=` query param on the
  // connection string — it must be passed explicitly here or every query
  // silently falls back to the `public` schema.
  const schema = new URL(databaseUrl).searchParams.get("schema") ?? undefined;

  return new PrismaClient({
    adapter: new PrismaPg(databaseUrl, schema ? { schema } : undefined),
  });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getPrisma(), prop, receiver);
  },
});
