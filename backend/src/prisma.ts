import { PrismaClient } from "@prisma/client";

// In dev, ts-node-dev restarts the module on every file save, which would
// spawn a new PrismaClient (and new DB connections) each time. Caching it
// on globalThis avoids exhausting Neon's connection pool during development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}