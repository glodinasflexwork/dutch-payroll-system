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
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            company: true,
            companies: {
              where: {
                isActive: true
              },
              include: {
                company: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              },
              orderBy: {
                createdAt: 'asc'
              }
            }
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Get the user's primary company (first one they joined)
        const primaryUserCompany = user.companies[0]
        const currentCompany = primaryUserCompany?.company || user.company

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: primaryUserCompany?.role || user.role || 'owner', // Use company-specific role or fallback to global role
          companyId: currentCompany?.id || user.companyId,
          company: currentCompany
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
        token.companyId = user.companyId
        token.company = user.company
      }
      
      // Handle company switching by refreshing user data from database
      if (trigger === "update" && session?.companyId) {
        // Fetch fresh user data with new company context
        const freshUser = await prisma.user.findUnique({
          where: { id: token.sub! },
          include: {
            companies: {
              where: {
                companyId: session.companyId,
                isActive: true
              },
              include: {
                company: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        })

        if (freshUser && freshUser.companies[0]) {
          const userCompany = freshUser.companies[0]
          token.role = userCompany.role
          token.companyId = userCompany.company.id
          token.company = userCompany.company
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
        session.user.company = token.company as any
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup"
  },
  secret: process.env.NEXTAUTH_SECRET
}

