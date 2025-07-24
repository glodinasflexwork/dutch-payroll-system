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
 * Atomically set user's company context to their first active company
 * Prevents race conditions in multi-company scenarios
 */
async function setUserCompanyContext(userId: string): Promise<string | null> {
  try {
    return await authClient.$transaction(async (tx) => {
      console.log(`🔄 Setting company context for user: ${userId}`)
      
      // Get user's current company context
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { companyId: true }
      })

      if (user?.companyId) {
        console.log(`✅ User already has company context: ${user.companyId}`)
        return user.companyId // Already has context
      }

      // Find first active company relationship
      const userCompany = await tx.userCompany.findFirst({
        where: {
          userId: userId,
          isActive: true
        },
        include: {
          Company: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'asc' }
      })

      if (!userCompany) {
        console.log(`❌ No active companies found for user: ${userId}`)
        return null // No companies found
      }

      // Atomically update user's company context
      await tx.user.update({
        where: { id: userId },
        data: { companyId: userCompany.companyId }
      })

      console.log(`✅ Set user company context to: ${userCompany.Company.name} (${userCompany.companyId})`)
      
      // Log the context change for audit purposes
      await logCompanyContextChange(tx, userId, null, userCompany.companyId)

      return userCompany.companyId
    })
  } catch (error) {
    console.error('❌ Error setting user company context:', error)
    return null
  }
}

/**
 * Validate that a user has access to a specific company
 */
async function validateCompanyContext(userId: string, companyId: string): Promise<boolean> {
  try {
    const userCompany = await authClient.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: userId,
          companyId: companyId
        }
      }
    })

    const isValid = userCompany?.isActive === true
    console.log(`🔍 Company context validation for user ${userId}, company ${companyId}: ${isValid ? 'VALID' : 'INVALID'}`)
    
    return isValid
  } catch (error) {
    console.error('❌ Error validating company context:', error)
    return false
  }
}

/**
 * Log company context changes for audit purposes
 */
async function logCompanyContextChange(
  tx: any, 
  userId: string, 
  oldCompanyId: string | null, 
  newCompanyId: string
) {
  try {
    // Note: This assumes an audit log table exists. If not, this will be a no-op.
    // In a production system, you might want to use a separate logging service.
    console.log(`📝 Audit: User ${userId} company context changed from ${oldCompanyId || 'null'} to ${newCompanyId}`)
    
    // If you have an audit log table, uncomment and modify this:
    /*
    await tx.auditLog.create({
      data: {
        userId: userId,
        action: 'COMPANY_CONTEXT_CHANGE',
        details: {
          oldCompanyId,
          newCompanyId,
          timestamp: new Date()
        }
      }
    })
    */
  } catch (error) {
    console.error('⚠️ Failed to log company context change:', error)
    // Don't throw - audit logging failure shouldn't prevent the operation
  }
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

    // If no company set, get user's first company atomically
    if (!companyId) {
      companyId = await setUserCompanyContext(session.user.id)
    }

    if (!companyId) {
      console.log('No company found for user')
      return null
    }

    // Validate that the user has access to this company
    const hasAccess = await validateCompanyContext(session.user.id, companyId)
    if (!hasAccess) {
      console.log(`❌ User ${session.user.id} does not have access to company ${companyId}`)
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

