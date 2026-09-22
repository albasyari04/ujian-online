import { PrismaClient } from "@prisma/client"

// Mencegah pembuatan banyak instance PrismaClient saat hot-reload di
// development (Next.js me-reload module setiap ada perubahan file).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}