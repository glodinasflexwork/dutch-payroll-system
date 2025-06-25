import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      companyId?: string | null
      company?: {
        id: string
        name: string
      } | null
    }
  }

  interface User {
    role: string
    companyId?: string | null
    company?: {
      id: string
      name: string
    } | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    companyId?: string | null
    company?: {
      id: string
      name: string
    } | null
  }
}

