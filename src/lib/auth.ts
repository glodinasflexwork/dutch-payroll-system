import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { authPrisma } from "@/lib/auth-prisma"
import { prisma } from "@/lib/prisma"
import { getAuthClient } from "@/lib/database-clients"
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

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
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

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || 'user'
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On initial sign in, fetch and cache company information
      if (user) {
        token.role = user.role
        
        // Fetch user's current company and cache it in the token
        try {
          const authClient = await getAuthClient()
          const userWithCompany = await authClient.user.findUnique({
            where: { id: user.id },
            select: { companyId: true }
          })

          if (userWithCompany?.companyId) {
            // Get company details and user role
            const userCompany = await authClient.userCompany.findUnique({
              where: {
                userId_companyId: {
                  userId: user.id,
                  companyId: userWithCompany.companyId
                }
              },
              include: {
                Company: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            })

            if (userCompany && userCompany.isActive) {
              token.companyId = userCompany.Company.id
              token.companyName = userCompany.Company.name
              token.companyRole = userCompany.role
              token.hasCompany = true
            }
          } else {
            // Check if user has any companies
            const firstUserCompany = await getAuthClient().userCompany.findFirst({
              where: {
                userId: user.id,
                isActive: true
              },
              include: {
                Company: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              },
              orderBy: {
                createdAt: 'asc'
              }
            })

            if (firstUserCompany) {
              // Update user's companyId and cache in token
              await authClient.user.update({
                where: { id: user.id },
                data: { companyId: firstUserCompany.Company.id }
              })

              token.companyId = firstUserCompany.Company.id
              token.companyName = firstUserCompany.Company.name
              token.companyRole = firstUserCompany.role
              token.hasCompany = true
            } else {
              token.hasCompany = false
            }
          }
        } catch (error) {
          console.error('Error fetching company info during login:', error)
          token.hasCompany = false
        }
      }

      // Handle session updates (e.g., when switching companies or getting first company)
      if (trigger === "update" && session) {
        console.log('Session update triggered:', session)
        
        // Refresh company information from database
        try {
          const authClient = await getAuthClient()
          const userWithCompany = await authClient.user.findUnique({
            where: { id: token.sub! },
            select: { companyId: true }
          })

          if (userWithCompany?.companyId) {
            // Get company details and user role
            const userCompany = await authClient.userCompany.findUnique({
              where: {
                userId_companyId: {
                  userId: token.sub!,
                  companyId: userWithCompany.companyId
                }
              },
              include: {
                Company: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            })

            if (userCompany && userCompany.isActive) {
              token.companyId = userCompany.Company.id
              token.companyName = userCompany.Company.name
              token.companyRole = userCompany.role
              token.hasCompany = true
              
              console.log('Updated token with company:', {
                companyId: token.companyId,
                companyName: token.companyName,
                companyRole: token.companyRole,
                hasCompany: token.hasCompany
              })
            }
          } else {
            // Check if user has any companies (in case companyId is not set but user has companies)
            const firstUserCompany = await authClient.userCompany.findFirst({
              where: {
                userId: token.sub!,
                isActive: true
              },
              include: {
                Company: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              },
              orderBy: {
                createdAt: 'asc'
              }
            })

            if (firstUserCompany) {
              // Update user's companyId and cache in token
              await authClient.user.update({
                where: { id: token.sub! },
                data: { companyId: firstUserCompany.Company.id }
              })

              token.companyId = firstUserCompany.Company.id
              token.companyName = firstUserCompany.Company.name
              token.companyRole = firstUserCompany.role
              token.hasCompany = true
              
              console.log('Found and set first company for user:', {
                companyId: token.companyId,
                companyName: token.companyName,
                companyRole: token.companyRole,
                hasCompany: token.hasCompany
              })
            } else {
              // User has no companies
              token.companyId = undefined
              token.companyName = undefined
              token.companyRole = undefined
              token.hasCompany = false
              
              console.log('User has no companies, cleared company data from token')
            }
          }
        } catch (error) {
          console.error('Error refreshing company info during session update:', error)
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
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
  secret: process.env.NEXTAUTH_SECRET
}

