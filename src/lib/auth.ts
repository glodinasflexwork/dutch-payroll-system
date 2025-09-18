import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { authPrisma } from "@/lib/auth-prisma"
import { authClient } from "@/lib/auth-client"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(authPrisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await authClient.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: {
            UserCompany: {
              include: { Company: true }
            }
          }
        })

        if (!user || !user.password) {
          return null
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // User just logged in - fetch their company context
        const userWithCompany = await authClient.user.findUnique({
          where: { id: user.id },
          include: {
            UserCompany: {
              include: { Company: true }
            }
          }
        })

        if (userWithCompany?.UserCompany?.[0]) {
          const userCompany = userWithCompany.UserCompany[0]
          token.companyId = userCompany.Company.id
          token.companyName = userCompany.Company.name
          token.companyRole = userCompany.role
          token.hasCompany = true
        } else {
          token.hasCompany = false
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.companyId = token.companyId as string
        session.user.companyName = token.companyName as string
        session.user.companyRole = token.companyRole as string
        session.user.hasCompany = token.hasCompany as boolean
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup"
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET
}
