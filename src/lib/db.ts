import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

function createPrismaClient() {
  return new PrismaClient({ adapter }).$extends({
    query: {
      $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        return query(args).finally(() => {
          const ms = (performance.now() - start).toFixed(1);
          console.log(`[DB] ${model}.${operation} ${ms}ms`);
        });
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
  prismaBase?: PrismaClient;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();
export const dbBase = globalForPrisma.prismaBase ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaBase = dbBase;
}
