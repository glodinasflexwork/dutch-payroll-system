import { PrismaClient } from '@prisma/client'

// Direct auth client for immediate use (non-async)
// This is needed for NextAuth and other synchronous contexts
const globalForAuthClient = globalThis as unknown as {
  authClient: PrismaClient | undefined
}

export const authClient = globalForAuthClient.authClient ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.AUTH_DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForAuthClient.authClient = authClient
