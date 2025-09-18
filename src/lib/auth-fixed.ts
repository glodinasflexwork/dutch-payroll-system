import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authClient } from "@/lib/auth-client"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // Use the default id "credentials" - don't override it
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('[AUTH] Authorize function called with:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password
        })

        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing credentials')
          return null
        }

        try {
          console.log('[AUTH] Attempting to find user:', credentials.email)

          const user = await authClient.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: {
              Company: true,
              UserCompany: {
                include: {
                  Company: true
                }
              }
            }
          })

          if (!user || !user.password) {
            console.log('[AUTH] User not found or no password')
            return null
          }

          // Check if email is verified
          if (!user.emailVerified) {
            console.log('[AUTH] Email not verified')
            return null
          }

          console.log('[AUTH] User found, verifying password...')
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('[AUTH] Invalid password')
            return null
          }

          console.log('[AUTH] Password valid, determining company information...')

          // Determine company information
          let companyId = null
          let companyName = null
          let companyRole = null
          let hasCompany = false

          // First, check if user has a direct company reference
          if (user.companyId && user.Company) {
            companyId = user.Company.id
            companyName = user.Company.name
            companyRole = "owner"
            hasCompany = true
            console.log('[AUTH] Using direct company reference:', companyName)
          }
          // Otherwise, check UserCompany relationships
          else if (user.UserCompany && user.UserCompany.length > 0) {
            // Use the first active company relationship
            const activeUserCompany = user.UserCompany.find(uc => uc.isActive) || user.UserCompany[0]
            if (activeUserCompany && activeUserCompany.Company) {
              companyId = activeUserCompany.Company.id
              companyName = activeUserCompany.Company.name
              companyRole = activeUserCompany.role
              hasCompany = true
              console.log('[AUTH] Using UserCompany relationship:', companyName, 'Role:', companyRole)
            }
          }

          const authResult = {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            companyId,
            companyName,
            hasCompany,
            companyRole
          }

          console.log('[AUTH] Authorization successful:', authResult)
          return authResult

        } catch (error) {
          console.error('[AUTH] Authorization error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('[JWT] Storing user data in token:', {
          id: user.id,
          companyId: user.companyId,
          companyName: user.companyName,
          hasCompany: user.hasCompany,
          companyRole: user.companyRole
        })
        
        // Store user data in JWT token
        token.sub = user.id
        token.id = user.id
        token.companyId = user.companyId
        token.companyName = user.companyName
        token.hasCompany = user.hasCompany
        token.companyRole = user.companyRole
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        console.log('[SESSION] Creating session from token:', {
          id: token.id,
          companyId: token.companyId,
          companyName: token.companyName,
          hasCompany: token.hasCompany,
          companyRole: token.companyRole
        })
        
        // Pass token data to session
        session.user.id = token.id as string
        session.user.companyId = token.companyId as string
        session.user.companyName = token.companyName as string
        session.user.hasCompany = token.hasCompany as boolean
        session.user.companyRole = token.companyRole as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  // Add these specific configurations to fix the login issue
  events: {
    async signIn({ user, account, profile }) {
      console.log('[EVENT] SignIn event:', { user: user?.email, account: account?.provider })
    },
    async signOut({ session, token }) {
      console.log('[EVENT] SignOut event')
    }
  }
}
