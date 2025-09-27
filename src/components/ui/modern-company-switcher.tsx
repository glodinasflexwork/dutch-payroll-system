'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Building2, Check, ChevronRight, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Company {
  id: string
  name: string
  displayName?: string
  originalName?: string
  role: string
  employeeCount: number
  isCurrentCompany: boolean
  subscription?: {
    status: string
    plan: {
      name: string
    }
  }
}

interface ModernCompanySwitcherProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function ModernCompanySwitcher({ isOpen, onClose, className }: ModernCompanySwitcherProps) {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchUserCompanies()
    }
  }, [isOpen])

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
      const response = await fetch('/api/companies/switch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ companyId }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update session to reflect the company change with proper data
        await update({
          companyId: companyId,
          company: data.company,
          role: data.company?.role
        })
        
        // Update local state immediately for better UX
        setCompanies(prev => prev.map(company => ({
          ...company,
          isCurrentCompany: company.id === companyId
        })))
        
        // Close the modal
        onClose()
        
        // Emit custom event to notify other components
        window.dispatchEvent(new CustomEvent('companyChanged', { 
          detail: { companyId, companyName: data.company?.name } 
        }))
        
        // Force router refresh to update all components
        router.refresh()
      } else {
        const error = await response.json()
        console.error('Switch error:', error)
        alert(error.error || 'Failed to switch company')
      }
    } catch (error) {
      console.error('Error switching company:', error)
      alert('Failed to switch company')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNewCompany = () => {
    router.push('/dashboard/add-company')
    onClose()
  }

  const getCompanyIcon = (name: string) => {
    // Generate different colored icons based on company name
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500'
    ]
    const colorIndex = name.length % colors.length
    return colors[colorIndex]
  }

  const getRoleDisplayName = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'Owner'
      case 'admin':
        return 'Admin'
      case 'hr_manager':
      case 'hr':
        return 'HR Manager'
      case 'manager':
        return 'Manager'
      case 'accountant':
        return 'Accountant'
      default:
        return role
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900">Company Selector</h2>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs px-2 py-1">
                Multi-tenant
              </Badge>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Company List */}
          <div className="p-6 space-y-3">
            {companies.map((company) => (
              <div
                key={company.id}
                onClick={() => !company.isCurrentCompany && switchCompany(company.id)}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all cursor-pointer group",
                  company.isCurrentCompany 
                    ? "border-blue-200 bg-blue-50" 
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50",
                  loading && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center space-x-3">
                  {/* Company Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-white",
                    getCompanyIcon(company.name)
                  )}>
                    <Building2 className="h-5 w-5" />
                  </div>

                  {/* Company Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {company.displayName || company.name}
                      </h3>
                      {company.isCurrentCompany && (
                        <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="text-sm text-gray-600">
                        {getRoleDisplayName(company.role)}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        {company.employeeCount} employees
                      </span>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  {!company.isCurrentCompany && (
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  )}
                </div>
              </div>
            ))}

            {/* Add New Company Button */}
            <button
              onClick={handleAddNewCompany}
              className="w-full p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="font-semibold text-purple-600 group-hover:text-purple-700">
                  Add New Company
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// Trigger component for the company switcher
interface CompanySwitcherTriggerProps {
  className?: string
}

export function CompanySwitcherTrigger({ className }: CompanySwitcherTriggerProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)

  useEffect(() => {
    fetchCurrentCompany()
  }, [session])

  const fetchCurrentCompany = async () => {
    try {
      const response = await fetch('/api/user/companies')
      if (response.ok) {
        const data = await response.json()
        const current = data.companies?.find((c: Company) => c.isCurrentCompany)
        setCurrentCompany(current || null)
      }
    } catch (error) {
      console.error('Error fetching current company:', error)
    }
  }

  const getCompanyIcon = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500'
    ]
    const colorIndex = name.length % colors.length
    return colors[colorIndex]
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center space-x-3 h-auto p-3 text-left justify-start min-w-[200px]",
          className
        )}
      >
        {currentCompany ? (
          <>
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0",
              getCompanyIcon(currentCompany.name)
            )}>
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="font-medium text-sm truncate">
                {currentCompany.displayName || currentCompany.name}
              </div>
              <div className="text-xs text-gray-500">
                {currentCompany.role} • {currentCompany.employeeCount} employees
              </div>
            </div>
          </>
        ) : (
          <>
            <Building2 className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Select Company</span>
          </>
        )}
      </Button>

      <ModernCompanySwitcher 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  )
}

