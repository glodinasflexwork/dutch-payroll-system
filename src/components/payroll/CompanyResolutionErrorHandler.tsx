'use client'

import React, { useState } from 'react'
import { AlertTriangle, RefreshCw, Building2, LogOut, Plus } from 'lucide-react'

interface CompanyData {
  id: string
  name: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
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

interface CompanyResolutionErrorHandlerProps {
  error: CompanyResolutionError
  onRetry?: () => void
  onCompanySelect?: (companyId: string) => void
  onCreateCompany?: () => void
  onReauth?: () => void
}

export function CompanyResolutionErrorHandler({
  error,
  onRetry,
  onCompanySelect,
  onCreateCompany,
  onReauth
}: CompanyResolutionErrorHandlerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('')

  const handleRetry = async () => {
    if (!onRetry) return
    setIsLoading(true)
    try {
      await onRetry()
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompanySelect = async () => {
    if (!onCompanySelect || !selectedCompanyId) return
    setIsLoading(true)
    try {
      await onCompanySelect(selectedCompanyId)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCompany = async () => {
    if (!onCreateCompany) return
    setIsLoading(true)
    try {
      await onCreateCompany()
    } finally {
      setIsLoading(false)
    }
  }

  const handleReauth = async () => {
    if (!onReauth) return
    setIsLoading(true)
    try {
      await onReauth()
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorIcon = () => {
    switch (error.code) {
      case 'NO_COMPANIES':
        return <Building2 className="h-8 w-8 text-blue-500" />
      case 'MULTIPLE_COMPANIES':
        return <Building2 className="h-8 w-8 text-yellow-500" />
      case 'ACCESS_DENIED':
        return <LogOut className="h-8 w-8 text-red-500" />
      default:
        return <AlertTriangle className="h-8 w-8 text-orange-500" />
    }
  }

  const getErrorTitle = () => {
    switch (error.code) {
      case 'NO_COMPANIES':
        return 'No Companies Found'
      case 'MULTIPLE_COMPANIES':
        return 'Multiple Companies Available'
      case 'INVALID_COMPANY':
        return 'Invalid Company Selection'
      case 'ACCESS_DENIED':
        return 'Access Denied'
      case 'DATABASE_ERROR':
        return 'Database Connection Error'
      default:
        return 'Company Resolution Error'
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        {getErrorIcon()}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {getErrorTitle()}
          </h3>
          <p className="text-sm text-gray-600">
            {error.message}
          </p>
        </div>
      </div>

      {/* Multiple Companies Selection */}
      {error.code === 'MULTIPLE_COMPANIES' && error.recoveryOptions?.availableCompanies && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select a company to continue:
          </label>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="">Choose a company...</option>
            {error.recoveryOptions.availableCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
                {company.city && ` - ${company.city}`}
              </option>
            ))}
          </select>
          <button
            onClick={handleCompanySelect}
            disabled={!selectedCompanyId || isLoading}
            className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
            <span>Select Company</span>
          </button>
        </div>
      )}

      {/* Recovery Actions */}
      <div className="space-y-2">
        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={handleRetry}
            disabled={isLoading}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Retry</span>
          </button>
        )}

        {/* Create Company Button */}
        {error.recoveryOptions?.canCreateCompany && onCreateCompany && (
          <button
            onClick={handleCreateCompany}
            disabled={isLoading}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>Create New Company</span>
          </button>
        )}

        {/* Re-authenticate Button */}
        {error.recoveryOptions?.needsReauth && onReauth && (
          <button
            onClick={handleReauth}
            disabled={isLoading}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span>Re-authenticate</span>
          </button>
        )}
      </div>

      {/* Error Details (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-xs text-gray-500">
          <summary className="cursor-pointer">Debug Information</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}

export default CompanyResolutionErrorHandler

