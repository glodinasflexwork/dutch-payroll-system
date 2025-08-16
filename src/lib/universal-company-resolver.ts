import { authClient, hrClient } from './database-clients'

export interface CompanyData {
  id: string
  name: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  taxNumber?: string
  chamberOfCommerceNumber?: string
  createdAt: Date
  updatedAt: Date
}

export interface CompanyResolution {
  success: boolean
  company?: CompanyData
  error?: string
  errorCode?: 'NO_COMPANIES' | 'MULTIPLE_COMPANIES' | 'INVALID_COMPANY' | 'ACCESS_DENIED' | 'DATABASE_ERROR'
  recoveryOptions?: {
    canSelectCompany?: boolean
    availableCompanies?: CompanyData[]
    canCreateCompany?: boolean
    needsReauth?: boolean
  }
  userRole?: 'owner' | 'admin' | 'hr' | 'employee'
  debug?: {
    userId: string
    sessionCompanyId?: string
    userCompanies: any[]
    attemptedStrategies: string[]
  }
}

export class UniversalCompanyResolver {
  /**
   * Resolves company data for a user using multiple strategies
   */
  async resolveUserCompany(userId: string, preferredCompanyId?: string): Promise<CompanyResolution> {
    const debug = {
      userId,
      sessionCompanyId: preferredCompanyId,
      userCompanies: [],
      attemptedStrategies: []
    }

    try {
      console.log(`🔍 [UniversalResolver] Starting resolution for user: ${userId}`)
      
      // Strategy 1: Get all active UserCompany relationships
      debug.attemptedStrategies.push('getUserCompanies')
      const userCompanies = await this.getUserCompanies(userId)
      debug.userCompanies = userCompanies

      if (userCompanies.length === 0) {
        console.log(`❌ [UniversalResolver] No companies found for user: ${userId}`)
        return {
          success: false,
          error: 'No companies associated with this user account',
          errorCode: 'NO_COMPANIES',
          recoveryOptions: {
            canCreateCompany: true,
            needsReauth: false
          },
          debug
        }
      }

      // Strategy 2: Use preferred company if specified and valid
      if (preferredCompanyId) {
        debug.attemptedStrategies.push('preferredCompany')
        const preferredCompany = userCompanies.find(uc => uc.companyId === preferredCompanyId)
        if (preferredCompany) {
          const companyData = await this.validateAndGetCompanyData(preferredCompanyId)
          if (companyData) {
            console.log(`✅ [UniversalResolver] Resolved preferred company: ${companyData.name}`)
            return {
              success: true,
              company: companyData,
              userRole: preferredCompany.role as any,
              debug
            }
          }
        }
      }

      // Strategy 3: Single company - use directly
      if (userCompanies.length === 1) {
        debug.attemptedStrategies.push('singleCompany')
        const userCompany = userCompanies[0]
        const companyData = await this.validateAndGetCompanyData(userCompany.companyId)
        
        if (companyData) {
          console.log(`✅ [UniversalResolver] Resolved single company: ${companyData.name}`)
          return {
            success: true,
            company: companyData,
            userRole: userCompany.role as any,
            debug
          }
        }
      }

      // Strategy 4: Multiple companies - provide selection options
      if (userCompanies.length > 1) {
        debug.attemptedStrategies.push('multipleCompanies')
        const availableCompanies: CompanyData[] = []
        
        for (const uc of userCompanies) {
          const companyData = await this.validateAndGetCompanyData(uc.companyId)
          if (companyData) {
            availableCompanies.push(companyData)
          }
        }

        if (availableCompanies.length > 0) {
          console.log(`🔄 [UniversalResolver] Multiple companies found for user: ${userId}`)
          return {
            success: false,
            error: 'Multiple companies found. Please select a company to continue.',
            errorCode: 'MULTIPLE_COMPANIES',
            recoveryOptions: {
              canSelectCompany: true,
              availableCompanies
            },
            debug
          }
        }
      }

      // Strategy 5: Fallback with recovery options
      debug.attemptedStrategies.push('fallback')
      console.log(`❌ [UniversalResolver] All strategies failed for user: ${userId}`)
      return {
        success: false,
        error: 'Unable to resolve company data. Please contact support.',
        errorCode: 'DATABASE_ERROR',
        recoveryOptions: {
          needsReauth: true,
          canCreateCompany: true
        },
        debug
      }

    } catch (error) {
      console.error(`💥 [UniversalResolver] Error resolving company for user ${userId}:`, error)
      return {
        success: false,
        error: 'Database error occurred while resolving company data',
        errorCode: 'DATABASE_ERROR',
        recoveryOptions: {
          needsReauth: true
        },
        debug
      }
    }
  }

  /**
   * Gets all UserCompany relationships for a user
   */
  private async getUserCompanies(userId: string) {
    try {
      const userCompanies = await authClient.userCompany.findMany({
        where: {
          userId: userId,
          isActive: true
        },
        include: {
          Company: true
        }
      })

      return userCompanies.map(uc => ({
        companyId: uc.companyId,
        role: uc.role,
        isActive: uc.isActive,
        company: uc.Company
      }))
    } catch (error) {
      console.error('Error fetching user companies:', error)
      return []
    }
  }

  /**
   * Validates and gets company data from both databases
   */
  private async validateAndGetCompanyData(companyId: string): Promise<CompanyData | null> {
    try {
      // Try auth database first
      let company = await authClient.company.findUnique({
        where: { id: companyId }
      })

      // Fallback to HR database
      if (!company) {
        company = await hrClient.company.findUnique({
          where: { id: companyId }
        })
      }

      if (!company) {
        console.log(`⚠️ [UniversalResolver] Company not found in any database: ${companyId}`)
        return null
      }

      return {
        id: company.id,
        name: company.name,
        address: company.address || undefined,
        city: company.city || undefined,
        postalCode: company.postalCode || undefined,
        country: company.country || undefined,
        taxNumber: company.taxNumber || undefined,
        chamberOfCommerceNumber: company.chamberOfCommerceNumber || undefined,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
    } catch (error) {
      console.error(`Error validating company ${companyId}:`, error)
      return null
    }
  }
}

// Singleton instance
export const universalCompanyResolver = new UniversalCompanyResolver()

/**
 * Convenience function to resolve company from session data
 */
export async function resolveCompanyFromSession(session: any): Promise<CompanyResolution> {
  if (!session?.user?.id) {
    return {
      success: false,
      error: 'No valid session found',
      errorCode: 'ACCESS_DENIED',
      recoveryOptions: {
        needsReauth: true
      }
    }
  }

  const preferredCompanyId = session.user.companyId
  return await universalCompanyResolver.resolveUserCompany(session.user.id, preferredCompanyId)
}

/**
 * Handles company resolution errors with appropriate HTTP responses
 */
export function handleCompanyResolutionError(resolution: CompanyResolution) {
  const { error, errorCode, recoveryOptions } = resolution

  switch (errorCode) {
    case 'NO_COMPANIES':
      return {
        error,
        code: 'NO_COMPANIES',
        message: 'No companies found for this user',
        recoveryOptions,
        statusCode: 404
      }

    case 'MULTIPLE_COMPANIES':
      return {
        error,
        code: 'MULTIPLE_COMPANIES', 
        message: 'Multiple companies found - selection required',
        recoveryOptions,
        statusCode: 422
      }

    case 'INVALID_COMPANY':
      return {
        error,
        code: 'INVALID_COMPANY',
        message: 'Selected company is not valid or accessible',
        recoveryOptions,
        statusCode: 403
      }

    case 'ACCESS_DENIED':
      return {
        error,
        code: 'ACCESS_DENIED',
        message: 'Access denied - authentication required',
        recoveryOptions,
        statusCode: 401
      }

    case 'DATABASE_ERROR':
    default:
      return {
        error,
        code: 'DATABASE_ERROR',
        message: 'Database error occurred',
        recoveryOptions,
        statusCode: 500
      }
  }
}

