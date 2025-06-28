import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export interface CompanyContext {
  userId: string
  companyId: string
  userRole: string
  companyName: string
  hasAccess: boolean
}

/**
 * Get company context from request headers or session
 * This ensures all operations are scoped to the correct company
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

    let companyId = requiredCompanyId || 
                   request.headers.get('x-company-id') ||
                   request.nextUrl.searchParams.get('companyId')

    if (!companyId) {
      // Always fetch current company from database, not from session
      // This ensures we get the latest company selection after switching
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { companyId: true }
      })

      companyId = user?.companyId

      if (!companyId) {
        // If no company in user record, get user's first company
        const firstUserCompany = await prisma.userCompany.findFirst({
          where: {
            userId: session.user.id,
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
        })

        if (!firstUserCompany) {
          return null
        }

        companyId = firstUserCompany.company.id
        
        // Update user's companyId if it was null
        await prisma.user.update({
          where: { id: session.user.id },
          data: { companyId: companyId }
        })
      }
    }

    // Verify user has access to this company
    const userCompany = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: session.user.id,
          companyId: companyId
        }
      },
      include: {
        company: {
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
 * Validate company access and role permissions
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
 * Audit log for company operations
 */
export async function auditLog(
  context: CompanyContext,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: any
) {
  try {
    // In a production app, you might want to store audit logs in a separate table
    console.log('AUDIT LOG:', {
      timestamp: new Date().toISOString(),
      userId: context.userId,
      companyId: context.companyId,
      userRole: context.userRole,
      action,
      resourceType,
      resourceId,
      details
    })

    // Optional: Store in database
    // await prisma.auditLog.create({
    //   data: {
    //     userId: context.userId,
    //     companyId: context.companyId,
    //     action,
    //     resourceType,
    //     resourceId,
    //     details: details ? JSON.stringify(details) : null,
    //     timestamp: new Date()
    //   }
    // })
  } catch (error) {
    console.error('Error writing audit log:', error)
  }
}

