import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { authClient } from '@/lib/database-clients'

export interface AuthContext {
  userId: string
  companyId: string
  userRole: string
  companyName: string
  isAuthenticated: boolean
}

/**
 * Enhanced authentication check with better error handling for production
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  try {
    // Try to get session with enhanced error handling
    let session
    try {
      session = await getServerSession(authOptions)
    } catch (sessionError) {
      console.error('Error getting session:', sessionError)
      return null
    }
    
    if (!session?.user?.id) {
      return null
    }

    // Get user's current company with enhanced error handling
    let user
    try {
      user = await authClient.user.findUnique({
        where: { id: session.user.id },
        select: { 
          id: true,
          companyId: true,
          role: true
        }
      })
    } catch (dbError) {
      console.error('Database error fetching user:', dbError)
      return null
    }

    if (!user) {
      return null
    }

    let companyId = user.companyId

    // If no company set, get user's first company
    if (!companyId) {
      try {
        const firstUserCompany = await authClient.userCompany.findFirst({
          where: {
            userId: session.user.id,
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
          companyId = firstUserCompany.companyId
          
          // Update user's companyId
          await authClient.user.update({
            where: { id: session.user.id },
            data: { companyId: companyId }
          })
          
          console.log('Set user companyId to:', companyId)
        }
      } catch (companyError) {
        console.error('Error fetching user company:', companyError)
        return null
      }
    }

    if (!companyId) {
      console.log('No company found for user')
      return null
    }

    // Get user's role and company info
    let userCompany
    try {
      userCompany = await authClient.userCompany.findUnique({
        where: {
          userId_companyId: {
            userId: session.user.id,
            companyId: companyId
          }
        },
        include: {
          Company: {
            select: {
              name: true
            }
          }
        }
      })
      console.log('UserCompany from database:', userCompany)
    } catch (userCompanyError) {
      console.error('Error fetching user company relationship:', userCompanyError)
      return null
    }

    if (!userCompany || !userCompany.isActive) {
      console.log('User does not have active access to company')
      return null
    }

    const authContext: AuthContext = {
      userId: session.user.id,
      companyId: companyId,
      userRole: userCompany.role,
      companyName: userCompany.Company.name,
      isAuthenticated: true
    }

    console.log('Final auth context:', authContext)
    return authContext

  } catch (error) {
    console.error('=== AUTH CONTEXT ERROR ===')
    console.error('Error details:', error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return null
  }
}

/**
 * Check if user has required role for the operation
 */
export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  const roleHierarchy = {
    'owner': 5,
    'admin': 4,
    'manager': 3,
    'hr manager': 2,
    'hr': 2,
    'accountant': 2,
    'employee': 1,
    'viewer': 0
  }

  // Normalize roles to lowercase for comparison
  const normalizedUserRole = userRole.toLowerCase()
  const userLevel = roleHierarchy[normalizedUserRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = Math.max(...requiredRoles.map(role => 
    roleHierarchy[role.toLowerCase() as keyof typeof roleHierarchy] || 0
  ))

  console.log('Role check:', { userRole, normalizedUserRole, userLevel, requiredRoles, requiredLevel })
  return userLevel >= requiredLevel
}

/**
 * Validate authentication and role permissions with enhanced error handling
 */
export async function validateAuth(
  request: NextRequest,
  requiredRoles: string[] = ['employee']
): Promise<{ context: AuthContext | null; error?: string; status?: number }> {
  
  console.log('=== VALIDATE AUTH START ===')
  console.log('Required roles:', requiredRoles)
  
  const context = await getAuthContext(request)

  if (!context) {
    console.log('Authentication failed - no context')
    return {
      context: null,
      error: 'Authentication required. Please sign in.',
      status: 401
    }
  }

  if (!context.isAuthenticated) {
    console.log('Authentication failed - not authenticated')
    return {
      context,
      error: 'Authentication required. Please sign in.',
      status: 401
    }
  }

  if (!hasRequiredRole(context.userRole, requiredRoles)) {
    console.log('Authorization failed - insufficient role')
    console.log('User role:', context.userRole)
    console.log('Required roles:', requiredRoles)
    return {
      context,
      error: `Insufficient permissions. Required: ${requiredRoles.join(' or ')}, Current: ${context.userRole}`,
      status: 403
    }
  }

  console.log('Authentication and authorization successful')
  return { context }
}

/**
 * Create a Prisma where clause that filters by company
 */
export function createCompanyFilter(companyId: string) {
  return {
    companyId: companyId
  }
}

