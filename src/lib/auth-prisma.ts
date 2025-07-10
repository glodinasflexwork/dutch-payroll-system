import { PrismaClient } from '@prisma/auth-client'

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

