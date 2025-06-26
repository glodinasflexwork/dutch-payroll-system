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
        password: { label: "Password", type: "password" },
        companyId: { label: "Company", type: "text" } // Optional company selection
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
            company: true, // Legacy relationship
            companies: { // New multi-tenant relationship
              include: {
                company: {
                  include: {
                    subscription: {
                      include: {
                        plan: true
                      }
                    }
                  }
                }
              },
              where: {
                isActive: true
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

        // Determine which company to use
        let selectedCompany = null
        let selectedUserCompany = null

        if (credentials.companyId) {
          // User specified a company
          selectedUserCompany = user.companies.find(uc => uc.companyId === credentials.companyId)
          selectedCompany = selectedUserCompany?.company
        } else if (user.companies.length > 0) {
          // Use the first active company (or owner role if available)
          const ownerCompany = user.companies.find(uc => uc.role === 'owner')
          selectedUserCompany = ownerCompany || user.companies[0]
          selectedCompany = selectedUserCompany.company
        } else if (user.company) {
          // Fallback to legacy company relationship
          selectedCompany = user.company
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // Global role (legacy)
          companyId: selectedCompany?.id || user.companyId, // Legacy fallback
          company: selectedCompany,
          userCompanies: user.companies,
          currentUserCompany: selectedUserCompany,
          companyRole: selectedUserCompany?.role || user.role // Role in current company
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.companyId = user.companyId
        token.company = user.company
        token.userCompanies = user.userCompanies
        token.currentUserCompany = user.currentUserCompany
        token.companyRole = user.companyRole
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
        session.user.company = token.company as any
        session.user.userCompanies = token.userCompanies as any
        session.user.currentUserCompany = token.currentUserCompany as any
        session.user.companyRole = token.companyRole as string
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

