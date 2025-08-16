'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface CompanyData {
  id: string
  name: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  taxNumber?: string
  chamberOfCommerceNumber?: string
  createdAt: string
  updatedAt: string
}

interface CompanyResolutionError {
  error: string
  code: string
  message: string
  recoveryOptions?: {
    canSelectCompany?: boolean
    availableCompanies?: CompanyData[]
    canCreateCompany?: boolean
    needsReauth?: boolean
  }
  statusCode: number
}

interface CompanyResolutionState {
  company: CompanyData | null
  userRole: string | null
  isLoading: boolean
  error: CompanyResolutionError | null
  isResolved: boolean
}

export function useUniversalCompanyResolution() {
  const { data: session, status } = useSession()
  const [state, setState] = useState<CompanyResolutionState>({
    company: null,
    userRole: null,
    isLoading: false,
    error: null,
    isResolved: false
  })

  const resolveCompany = useCallback(async () => {
    if (status !== 'authenticated' || !session) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: {
          error: 'Not authenticated',
          code: 'ACCESS_DENIED',
          message: 'Please log in to continue',
          statusCode: 401
        }
      }))
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log('🔍 [useUniversalCompanyResolution] Resolving company...')
      
      const response = await fetch('/api/company', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        console.log('❌ [useUniversalCompanyResolution] Company resolution failed:', data)
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: {
            error: data.error || 'Unknown error',
            code: data.code || 'UNKNOWN_ERROR',
            message: data.message || 'An error occurred',
            recoveryOptions: data.recoveryOptions,
            statusCode: response.status
          },
          isResolved: false
        }))
        return
      }

      console.log('✅ [useUniversalCompanyResolution] Company resolved:', data.company?.name)
      
      setState(prev => ({
        ...prev,
        company: data.company,
        userRole: data.userRole,
        isLoading: false,
        error: null,
        isResolved: true
      }))

    } catch (error) {
      console.error('💥 [useUniversalCompanyResolution] Unexpected error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: {
          error: 'Network error',
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to server',
          statusCode: 500
        },
        isResolved: false
      }))
    }
  }, [session, status])

  const switchCompany = useCallback(async (companyId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      console.log('🔄 [useUniversalCompanyResolution] Switching to company:', companyId)
      
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId })
      })

      const data = await response.json()

      if (!response.ok) {
        console.log('❌ [useUniversalCompanyResolution] Company switch failed:', data)
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: {
            error: data.error || 'Unknown error',
            code: data.code || 'UNKNOWN_ERROR',
            message: data.message || 'Failed to switch company',
            recoveryOptions: data.recoveryOptions,
            statusCode: response.status
          }
        }))
        return false
      }

      console.log('✅ [useUniversalCompanyResolution] Successfully switched to:', data.company?.name)
      
      setState(prev => ({
        ...prev,
        company: data.company,
        userRole: data.userRole,
        isLoading: false,
        error: null,
        isResolved: true
      }))

      return true

    } catch (error) {
      console.error('💥 [useUniversalCompanyResolution] Error switching company:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: {
          error: 'Network error',
          code: 'NETWORK_ERROR',
          message: 'Failed to switch company',
          statusCode: 500
        }
      }))
      return false
    }
  }, [])

  const retry = useCallback(() => {
    resolveCompany()
  }, [resolveCompany])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Auto-resolve company when session is available
  useEffect(() => {
    if (status === 'authenticated' && session && !state.isResolved && !state.isLoading) {
      resolveCompany()
    }
  }, [status, session, state.isResolved, state.isLoading, resolveCompany])

  return {
    // State
    company: state.company,
    userRole: state.userRole,
    isLoading: state.isLoading,
    error: state.error,
    isResolved: state.isResolved,
    
    // Actions
    resolveCompany,
    switchCompany,
    retry,
    clearError,
    
    // Computed properties
    hasError: !!state.error,
    canSelectCompany: state.error?.recoveryOptions?.canSelectCompany || false,
    canCreateCompany: state.error?.recoveryOptions?.canCreateCompany || false,
    needsReauth: state.error?.recoveryOptions?.needsReauth || false,
    availableCompanies: state.error?.recoveryOptions?.availableCompanies || []
  }
}

export default useUniversalCompanyResolution

