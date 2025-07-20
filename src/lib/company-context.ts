import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { authClient } from '@/lib/database-clients'

export interface CompanyContext {
  userId: string
  companyId: string
  userRole: string
  companyName: string
  hasAccess: boolean
}

/**
 * Optimized company context that uses session data first, falls back to database only when necessary
 */
export async function getCompanyContext(
  request: NextRequest,
  requiredCompanyId?: string
): Promise<CompanyContext | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return null
    }

    // OPTIMIZED: Use company info from session if available (cached from login)
    if (session.user.hasCompany && session.user.companyId && !requiredCompanyId) {
      return {
        userId: session.user.id,
        companyId: session.user.companyId,
        userRole: session.user.companyRole || 'employee',
        companyName: session.user.companyName || 'Unknown',
        hasAccess: true
      }
    }

    // OPTIMIZED: Try to get company info from headers first (set by middleware)
    const headerCompanyId = request.headers.get('x-company-id')
    const headerCompanyName = request.headers.get('x-company-name')
    const headerCompanyRole = request.headers.get('x-company-role')

    if (headerCompanyId && headerCompanyName && headerCompanyRole && !requiredCompanyId) {
      return {
        userId: session.user.id,
        companyId: headerCompanyId,
        userRole: headerCompanyRole,
        companyName: headerCompanyName,
        hasAccess: true
      }
    }

    // Only query database if:
    // 1. Session doesn't have company info
    // 2. A specific company is required
    // 3. Company switching is happening
    let companyId = requiredCompanyId || 
                   request.headers.get('x-company-id') ||
                   request.nextUrl.searchParams.get('companyId') ||
                   session.user.companyId

    if (!companyId) {
      // Fallback: get user's first company (only if session doesn't have it)
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

      if (!firstUserCompany) {
        return null
      }

      companyId = firstUserCompany.company.id
      
      // Update user's companyId for future requests
      await authClient.user.update({
        where: { id: session.user.id },
        data: { companyId: companyId }
      })

      return {
        userId: session.user.id,
        companyId: companyId,
        userRole: firstUserCompany.role,
        companyName: firstUserCompany.company.name,
        hasAccess: true
      }
    }

    // If we have a companyId but need to verify access (only when switching companies)
    if (requiredCompanyId || request.headers.get('x-company-id')) {
      const userCompany = await authClient.userCompany.findUnique({
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

      if (!userCompany || !userCompany.isActive) {
        return {
          userId: session.user.id,
          companyId: companyId,
          userRole: 'none',
          companyName: 'Unknown',
          hasAccess: false
        }
      }

      return {
        userId: session.user.id,
        companyId: companyId,
        userRole: userCompany.role,
        companyName: userCompany.company.name,
        hasAccess: true
      }
    }

    // Use session data (most common case)
    return {
      userId: session.user.id,
      companyId: companyId,
      userRole: session.user.companyRole || 'employee',
      companyName: session.user.companyName || 'Unknown',
      hasAccess: true
    }

  } catch (error) {
    console.error('Error getting company context:', error)
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
    'hr': 2,
    'accountant': 2,
    'employee': 1,
    'viewer': 0
  }

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = Math.max(...requiredRoles.map(role => 
    roleHierarchy[role as keyof typeof roleHierarchy] || 0
  ))

  return userLevel >= requiredLevel
}

/**
 * Optimized company access validation
 */
export async function validateCompanyAccess(
  request: NextRequest,
  requiredRoles: string[] = ['employee'],
  requiredCompanyId?: string
): Promise<{ context: CompanyContext | null; error?: string; status?: number }> {
  const context = await getCompanyContext(request, requiredCompanyId)

  if (!context) {
    return {
      context: null,
      error: 'Authentication required',
      status: 401
    }
  }

  if (!context.hasAccess) {
    return {
      context,
      error: 'Access denied to this company',
      status: 403
    }
  }

  if (!hasRequiredRole(context.userRole, requiredRoles)) {
    return {
      context,
      error: `Insufficient permissions. Required: ${requiredRoles.join(' or ')}, Current: ${context.userRole}`,
      status: 403
    }
  }

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

/**
 * Simplified audit log (reduced logging for performance)
 */
export async function auditLog(
  context: CompanyContext,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: any
) {
  // Only log critical actions to reduce overhead
  const criticalActions = ['create', 'delete', 'update_sensitive', 'switch_company']
  
  if (criticalActions.includes(action)) {
    console.log('AUDIT:', {
      timestamp: new Date().toISOString(),
      userId: context.userId,
      companyId: context.companyId,
      action,
      resourceType,
      resourceId
    })
  }
}

