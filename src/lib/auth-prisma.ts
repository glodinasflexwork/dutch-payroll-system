import { PrismaClient } from '@prisma/auth-client'

const globalForAuthPrisma = globalThis as unknown as {
  authPrisma: PrismaClient | undefined
}

// Create a simple auth Prisma client that uses AUTH_DATABASE_URL
export const authPrisma = globalForAuthPrisma.authPrisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForAuthPrisma.authPrisma = authPrisma

