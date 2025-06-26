import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials")
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              company: true, // Legacy relationship
              companies: { // New multi-tenant relationship
                include: {
                  company: true
                },
                where: {
                  isActive: true
                }
              }
            }
          })

          if (!user || !user.password) {
            console.log("User not found or no password")
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log("Invalid password")
            return null
          }

          // Simplified company selection logic with better error handling
          let primaryCompanyId = null
          let primaryRole = user.role || 'user'

          try {
            if (user.companies && user.companies.length > 0) {
              // Use the first active company or owner role if available
              const ownerCompany = user.companies.find(uc => uc.role === 'owner')
              const selectedUserCompany = ownerCompany || user.companies[0]
              primaryCompanyId = selectedUserCompany.companyId
              primaryRole = selectedUserCompany.role
            } else if (user.company) {
              // Fallback to legacy company relationship
              primaryCompanyId = user.company.id
            } else if (user.companyId) {
              // Fallback to direct companyId
              primaryCompanyId = user.companyId
            }
          } catch (companyError) {
            console.error('Company selection error:', companyError)
            // Continue with basic user data even if company selection fails
          }

          console.log(`User ${user.email} authenticated successfully with company ${primaryCompanyId}`)

          // Return minimal user data for JWT
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: primaryRole,
            companyId: primaryCompanyId,
            hasMultipleCompanies: user.companies ? user.companies.length > 1 : false
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // Only store essential data in JWT to avoid size issues
      if (user) {
        token.role = user.role
        token.companyId = user.companyId
        token.hasMultipleCompanies = user.hasMultipleCompanies
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
        session.user.hasMultipleCompanies = token.hasMultipleCompanies as boolean
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development" || process.env.NEXTAUTH_DEBUG === "true",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".vercel.app" : undefined
      }
    }
  }
}

