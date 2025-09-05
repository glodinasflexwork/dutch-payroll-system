import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getAuthClient } from '@/lib/database-clients'

export type UserRole = 'owner' | 'admin' | 'manager' | 'employee' | 'viewer'

export interface PermissionConfig {
  requiredRole?: UserRole
  requiredPermissions?: string[]
  allowSelfAccess?: boolean // Allow users to access their own data
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  'owner': 5,
  'admin': 4,
  'manager': 3,
  'employee': 2,
  'viewer': 1
}

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'owner': [
    'company.manage',
    'users.manage',
    'employees.manage',
    'payroll.manage',
    'reports.view',
    'settings.manage',
    'billing.manage'
  ],
  'admin': [
    'employees.manage',
    'payroll.manage',
    'reports.view',
    'settings.manage'
  ],
  'manager': [
    'employees.view',
    'employees.create',
    'payroll.view',
    'payroll.create',
    'reports.view'
  ],
  'employee': [
    'payroll.view_own',
    'profile.manage'
  ],
  'viewer': [
    'reports.view',
    'employees.view'
  ]
}

/**
 * Check if a role has sufficient permissions
 */
export function hasRolePermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Check if a user has specific permissions
 */
export function hasPermissions(userRole: UserRole, requiredPermissions: string[]): boolean {
  const userPermissions = ROLE_PERMISSIONS[userRole] || []
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission) || userPermissions.includes('*')
  )
}

/**
 * Get user's role in a specific company
 */
export async function getUserCompanyRole(userId: string, companyId: string): Promise<UserRole | null> {
  try {
    const userCompany = await getAuthClient().userCompany.findFirst({
      where: {
        userId,
        companyId,
        isActive: true
      }
    })

    return userCompany?.role as UserRole || null
  } catch (error) {
    console.error('Error getting user company role:', error)
    return null
  }
}

/**
 * Middleware to check permissions for API routes
 */
export async function withPermissions(
  request: NextRequest,
  handler: (req: NextRequest, context: { session: any, userRole: UserRole }) => Promise<NextResponse>,
  config: PermissionConfig
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session?.user?.companyId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's role in the current company
    const userRole = await getUserCompanyRole(session.user.id, session.user.companyId)
    
    if (!userRole) {
      return NextResponse.json(
        { error: 'Access denied to this company' },
        { status: 403 }
      )
    }

    // Check role-based permissions
    if (config.requiredRole && !hasRolePermission(userRole, config.requiredRole)) {
      return NextResponse.json(
        { error: `Insufficient permissions. Required role: ${config.requiredRole}` },
        { status: 403 }
      )
    }

    // Check specific permissions
    if (config.requiredPermissions && !hasPermissions(userRole, config.requiredPermissions)) {
      return NextResponse.json(
        { error: 'Insufficient permissions for this action' },
        { status: 403 }
      )
    }

    return handler(request, { session, userRole })
  } catch (error) {
    console.error('Permission middleware error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to check if user can access employee data
 */
export async function canAccessEmployee(
  userId: string, 
  companyId: string, 
  targetEmployeeId: string
): Promise<boolean> {
  const userRole = await getUserCompanyRole(userId, companyId)
  
  if (!userRole) return false
  
  // Owners, admins, and managers can access all employees
  if (hasRolePermission(userRole, 'manager')) {
    return true
  }
  
  // Employees can only access their own data
  if (userRole === 'employee') {
    const employee = await getAuthClient().employee.findFirst({
      where: {
        id: targetEmployeeId,
        companyId,
        userId
      }
    })
    return !!employee
  }
  
  return false
}

