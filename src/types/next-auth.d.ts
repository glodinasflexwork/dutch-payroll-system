import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string // Global role (legacy)
      companyId?: string | null
      company?: {
        id: string
        name: string
        subscription?: {
          id: string
          status: string
          plan: {
            id: string
            name: string
            features: any
          }
        } | null
      } | null
      userCompanies?: Array<{
        id: string
        role: string
        isActive: boolean
        Company: {
          id: string
          name: string
          subscription?: {
            id: string
            status: string
            plan: {
              id: string
              name: string
              features: any
            }
          } | null
        }
      }> | null
      currentUserCompany?: {
        id: string
        role: string
        isActive: boolean
        Company: {
          id: string
          name: string
        }
      } | null
      companyRole?: string // Role in current company
    }
  }

  interface User {
    role: string
    companyId?: string | null
    company?: {
      id: string
      name: string
    } | null
    userCompanies?: Array<{
      id: string
      role: string
      isActive: boolean
      Company: {
        id: string
        name: string
        subscription?: {
          id: string
          status: string
          plan: {
            id: string
            name: string
            features: any
          }
        } | null
      }
    }> | null
    currentUserCompany?: {
      id: string
      role: string
      isActive: boolean
      Company: {
        id: string
        name: string
      }
    } | null
    companyRole?: string
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
    userCompanies?: Array<{
      id: string
      role: string
      isActive: boolean
      Company: {
        id: string
        name: string
        subscription?: {
          id: string
          status: string
          plan: {
            id: string
            name: string
            features: any
          }
        } | null
      }
    }> | null
    currentUserCompany?: {
      id: string
      role: string
      isActive: boolean
      Company: {
        id: string
        name: string
      }
    } | null
    companyRole?: string
  }
}

