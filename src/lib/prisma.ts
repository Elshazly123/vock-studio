import { PrismaClient } from "@prisma/client";

// نمط الـ singleton عشان منفتحش اتصالات كتير بقاعدة البيانات
// في وضع التطوير مع Hot Reload الخاص بـ Next.js.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
