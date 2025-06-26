'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ChevronDownIcon, BuildingOfficeIcon, CheckIcon } from '@heroicons/react/24/outline'

interface Company {
  id: string
  name: string
  role: string
  subscription: {
    status: string
    plan: {
      name: string
      features: Record<string, boolean>
    }
  } | null
  isCurrentCompany: boolean
}

export default function CompanySwitcher() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUserCompanies()
  }, [])

  const fetchUserCompanies = async () => {
    try {
      const response = await fetch('/api/user/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies || [])
      }
    } catch (error) {
      console.error('Error fetching companies:', error)
    }
  }

  const switchCompany = async (companyId: string) => {
    if (loading) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/user/companies/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId }),
      })

      if (response.ok) {
        // Update session to reflect the company change
        await update()
        
        // Refresh the page to load new company data
        router.refresh()
        
        // Update local state
        setCompanies(prev => prev.map(company => ({
          ...company,
          isCurrentCompany: company.id === companyId
        })))
        
        setIsOpen(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to switch company')
      }
    } catch (error) {
      console.error('Error switching company:', error)
      alert('Failed to switch company')
    } finally {
      setLoading(false)
    }
  }

  const currentCompany = companies.find(c => c.isCurrentCompany)

  if (companies.length <= 1) {
    return null // Don't show switcher if user only has access to one company
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      >
        <BuildingOfficeIcon className="w-4 h-4" />
        <span className="truncate max-w-32">
          {currentCompany?.name || 'Select Company'}
        </span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="py-1">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
              Your Companies
            </div>
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => switchCompany(company.id)}
                disabled={loading || company.isCurrentCompany}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                  company.isCurrentCompany ? 'bg-blue-50' : ''
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {company.name}
                      </p>
                      {company.isCurrentCompany && (
                        <CheckIcon className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {company.role}
                      </span>
                      {company.subscription && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          company.subscription.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {company.subscription.plan.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

