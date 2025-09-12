// Helper functions for middleware to perform real-time database checks
// This avoids relying on potentially stale JWT token data

import { getAuthClient } from './database-clients'

/**
 * Check if a user has any companies in real-time
 * Used by middleware to avoid stale JWT token issues
 */
export async function checkUserHasCompany(userId: string): Promise<{ hasCompany: boolean; companyId?: string; companyName?: string }> {
  console.log('checkUserHasCompany called with userId:', userId)
  
  if (!userId) {
    console.log('No userId provided, returning hasCompany: false')
    return { hasCompany: false }
  }

  try {
    console.log('Getting auth client...')
    const authClient = await getAuthClient()
    console.log('Auth client obtained successfully')
    
    // Check if user has any companies through UserCompany relationship
    console.log('Checking UserCompany relationships...')
    const userCompany = await authClient.userCompany.findFirst({
      where: {
        userId: userId
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

    console.log('UserCompany query result:', userCompany)

    if (userCompany?.Company) {
      console.log('Found company via UserCompany relationship:', userCompany.Company)
      return {
        hasCompany: true,
        companyId: userCompany.Company.id,
        companyName: userCompany.Company.name
      }
    }

    // Also check if user has a direct company relationship
    console.log('Checking direct company relationship...')
    const user = await authClient.user.findUnique({
      where: { id: userId },
      select: {
        companyId: true,
        Company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    console.log('User direct company query result:', user)

    if (user?.Company) {
      console.log('Found company via direct relationship:', user.Company)
      return {
        hasCompany: true,
        companyId: user.Company.id,
        companyName: user.Company.name
      }
    }

    console.log('No company found for user')
    return { hasCompany: false }

  } catch (error) {
    console.error('Error checking user company status:', error)
    // In case of error, fall back to JWT token data
    return { hasCompany: false }
  }
}

/**
 * Get user's primary company with role information
 * Used for setting proper headers and context
 */
export async function getUserPrimaryCompany(userId: string): Promise<{
  companyId?: string
  companyName?: string
  role?: string
}> {
  if (!userId) {
    return {}
  }

  try {
    const authClient = await getAuthClient()
    
    // Get user's primary company through UserCompany relationship
    const userCompany = await authClient.userCompany.findFirst({
      where: {
        userId: userId
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
        createdAt: 'asc' // Get the first company they joined
      }
    })

    if (userCompany?.company) {
      return {
        companyId: userCompany.company.id,
        companyName: userCompany.company.name,
        role: userCompany.role
      }
    }

    // Fallback to direct company relationship
    const user = await authClient.user.findUnique({
      where: { id: userId },
      select: {
        companyId: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (user?.company) {
      return {
        companyId: user.company.id,
        companyName: user.company.name,
        role: 'owner' // Assume owner for direct relationship
      }
    }

    return {}

  } catch (error) {
    console.error('Error getting user primary company:', error)
    return {}
  }
}

