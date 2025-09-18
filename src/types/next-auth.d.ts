import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      companyId?: string | null
      companyName?: string | null
      companyRole?: string | null
      hasCompany?: boolean
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    companyId?: string | null
    companyName?: string | null
    companyRole?: string | null
    hasCompany?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    companyId?: string | null
    companyName?: string | null
    companyRole?: string | null
    hasCompany?: boolean
  }
}

