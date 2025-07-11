import { PrismaClient } from '@prisma/client'

// Create a Prisma client specifically for auth operations
// This uses the default @prisma/client but with AUTH_DATABASE_URL
const globalForAuthPrisma = globalThis as unknown as {
  authPrisma: PrismaClient | undefined
}

export const authPrisma = globalForAuthPrisma.authPrisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForAuthPrisma.authPrisma = authPrisma

