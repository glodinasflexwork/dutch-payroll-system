'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { ChevronDown, Building2, Plus, Check, Crown, Users, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Company {
  id: string
  name: string
  role: string
  isActive: boolean
}

interface CompanySwitcherProps {
  className?: string
}

export function CompanySwitcher({ className }: CompanySwitcherProps) {
  const { data: session } = useSession()
  const [companies, setCompanies] = useState<Company[]>([])
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user's companies
  useEffect(() => {
    if (session?.user) {
      fetchUserCompanies()
    }
  }, [session])

  const fetchUserCompanies = async () => {
    try {
      const response = await fetch('/api/user/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies || [])
        setCurrentCompany(data.currentCompany || data.companies?.[0] || null)
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const switchCompany = async (companyId: string) => {
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
        setCurrentCompany(data.company)
        // Refresh the page to update all company-specific data
        window.location.reload()
      }
    } catch (error) {
      console.error('Failed to switch company:', error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return <Crown className="h-3 w-3 text-yellow-500" />
      case 'admin':
        return <Users className="h-3 w-3 text-blue-500" />
      case 'manager':
        return <Users className="h-3 w-3 text-green-500" />
      case 'hr':
        return <Users className="h-3 w-3 text-purple-500" />
      case 'accountant':
        return <Users className="h-3 w-3 text-orange-500" />
      default:
        return <Eye className="h-3 w-3 text-gray-500" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'manager':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'hr':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'accountant':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (!currentCompany) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'flex items-center space-x-2 h-9 px-3 text-left justify-between min-w-[200px]',
            className
          )}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Building2 className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {currentCompany.name}
              </div>
              <div className="flex items-center space-x-1">
                {getRoleIcon(currentCompany.role)}
                <span className="text-xs text-gray-500 capitalize">
                  {currentCompany.role}
                </span>
              </div>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        <DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Your Companies
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => switchCompany(company.id)}
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {company.name}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs px-2 py-0.5 font-medium',
                      getRoleBadgeColor(company.role)
                    )}
                  >
                    <span className="flex items-center space-x-1">
                      {getRoleIcon(company.role)}
                      <span className="capitalize">{company.role}</span>
                    </span>
                  </Badge>
                  {!company.isActive && (
                    <Badge variant="outline" className="text-xs text-gray-500">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {currentCompany.id === company.id && (
              <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-3 cursor-pointer hover:bg-gray-50">
          <div className="flex items-center space-x-3 w-full">
            <Plus className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-sm">Add New Company</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

