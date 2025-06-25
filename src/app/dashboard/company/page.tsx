'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getIndustryOptions, getCAOByIndustry, type CAOInfo } from "@/lib/cao-data"
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  FileText,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  CreditCard,
  Clock,
  Euro,
  Award
} from "lucide-react"

interface Company {
  id: string
  name: string
  address?: string
  city?: string
  postalCode?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  kvkNumber?: string
  taxNumber?: string
  vatNumber?: string
  description?: string
  industry?: string
  foundedYear?: number
  employeeCount?: number
  createdAt: string
  updatedAt: string
}

export default function CompanyPage() {
  const { data: session, status } = useSession()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Company>>({})
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentCAO, setCurrentCAO] = useState<CAOInfo | null>(null)
  const [industryOptions] = useState(getIndustryOptions())

  useEffect(() => {
    if (session?.user?.companyId) {
      fetchCompany()
    }
  }, [session])

  useEffect(() => {
    // Update CAO information when industry changes
    if (formData.industry) {
      const cao = getCAOByIndustry(formData.industry)
      setCurrentCAO(cao || null)
    } else {
      setCurrentCAO(null)
    }
  }, [formData.industry])

  const fetchCompany = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/companies")
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.companies.length > 0) {
          const companyData = result.companies[0]
          setCompany(companyData)
          setFormData(companyData)
          
          // Set initial CAO information
          if (companyData.industry) {
            const cao = getCAOByIndustry(companyData.industry)
            setCurrentCAO(cao || null)
          }
        }
      } else {
        setError("Failed to load company information")
      }
    } catch (error) {
      console.error("Error fetching company:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
    setError(null) // Clear any existing errors
    setSuccess(null)
  }

  const handleCancel = () => {
    setEditing(false)
    setFormData(company || {})
    setError(null) // Clear any existing errors
    setSuccess(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null) // Clear any existing errors

      const response = await fetch("/api/companies", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setCompany(result.company)
          setFormData(result.company)
          setEditing(false)
          setSuccess("Company information updated successfully!")
          setTimeout(() => setSuccess(null), 3000)
        } else {
          setError(result.error || "Failed to update company")
        }
      } else {
        const errorData = await response.json()
        // Provide more specific error messages
        if (errorData.details && Array.isArray(errorData.details)) {
          const errorMessages = errorData.details.map((detail: any) => 
            `${detail.path?.join('.')}: ${detail.message}`
          ).join(', ')
          setError(`Validation failed: ${errorMessages}`)
        } else {
          setError(errorData.error || "Failed to update company")
        }
      }
    } catch (error) {
      console.error("Error updating company:", error)
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Company, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (error) {
      setError(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading company information...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to view company information.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Information</h1>
            <p className="text-gray-600">Manage your company details and settings</p>
          </div>
          <div className="flex items-center space-x-3">
            {!editing ? (
              <Button onClick={handleEdit} className="flex items-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>Edit Company</span>
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">{success}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {company && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Company Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="w-5 h-5" />
                    <span>Basic Information</span>
                  </CardTitle>
                  <CardDescription>
                    Core company details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      {editing ? (
                        <Input
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter company name"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">{company.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Industry & CAO
                      </label>
                      {editing ? (
                        <div className="space-y-2">
                          <select
                            value={formData.industry || ''}
                            onChange={(e) => handleInputChange('industry', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select industry...</option>
                            {industryOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label} ({option.cao})
                              </option>
                            ))}
                          </select>
                          {currentCAO && (
                            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                              <strong>CAO:</strong> {currentCAO.name} - {currentCAO.description}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-gray-900">{company.industry || 'Not specified'}</p>
                          {currentCAO && (
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                {currentCAO.name}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    {editing ? (
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Brief description of your company"
                      />
                    ) : (
                      <p className="text-gray-900">{company.description || 'No description provided'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Founded Year
                      </label>
                      {editing ? (
                        <Input
                          type="number"
                          value={formData.foundedYear || ''}
                          onChange={(e) => handleInputChange('foundedYear', parseInt(e.target.value) || 0)}
                          placeholder="e.g., 2020"
                          min="1800"
                          max={new Date().getFullYear()}
                        />
                      ) : (
                        <p className="text-gray-900">{company.foundedYear || 'Not specified'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee Count
                      </label>
                      {editing ? (
                        <Input
                          type="number"
                          value={formData.employeeCount || ''}
                          onChange={(e) => handleInputChange('employeeCount', parseInt(e.target.value) || 0)}
                          placeholder="Number of employees"
                          min="1"
                        />
                      ) : (
                        <p className="text-gray-900">{company.employeeCount || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                  <CardDescription>
                    Address and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    {editing ? (
                      <Input
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Street address"
                      />
                    ) : (
                      <p className="text-gray-900">{company.address || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      {editing ? (
                        <Input
                          value={formData.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="City"
                        />
                      ) : (
                        <p className="text-gray-900">{company.city || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      {editing ? (
                        <Input
                          value={formData.postalCode || ''}
                          onChange={(e) => handleInputChange('postalCode', e.target.value)}
                          placeholder="1234 AB"
                        />
                      ) : (
                        <p className="text-gray-900">{company.postalCode || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      {editing ? (
                        <Input
                          value={formData.country || ''}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          placeholder="Netherlands"
                        />
                      ) : (
                        <p className="text-gray-900">{company.country || 'Netherlands'}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      {editing ? (
                        <Input
                          value={formData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+31 20 123 4567"
                        />
                      ) : (
                        <p className="text-gray-900">{company.phone || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      {editing ? (
                        <Input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="info@company.com"
                        />
                      ) : (
                        <p className="text-gray-900">{company.email || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    {editing ? (
                      <Input
                        value={formData.website || ''}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://www.company.com"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {company.website ? (
                          <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center space-x-1"
                          >
                            <Globe className="w-4 h-4" />
                            <span>{company.website}</span>
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Legal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Legal Information</span>
                  </CardTitle>
                  <CardDescription>
                    Registration numbers and legal identifiers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        KvK Number
                      </label>
                      {editing ? (
                        <Input
                          value={formData.kvkNumber || ''}
                          onChange={(e) => handleInputChange('kvkNumber', e.target.value)}
                          placeholder="12345678"
                        />
                      ) : (
                        <p className="text-gray-900 font-mono">{company.kvkNumber || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Number
                      </label>
                      {editing ? (
                        <Input
                          value={formData.taxNumber || ''}
                          onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                          placeholder="123456789L01"
                        />
                      ) : (
                        <p className="text-gray-900 font-mono">{company.taxNumber || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      VAT Number
                    </label>
                    {editing ? (
                      <Input
                        value={formData.vatNumber || ''}
                        onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                        placeholder="NL123456789B01"
                      />
                    ) : (
                      <p className="text-gray-900 font-mono">{company.vatNumber || 'Not provided'}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Employees</span>
                    </div>
                    <Badge variant="outline">{company.employeeCount || 0}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">Founded</span>
                    </div>
                    <Badge variant="outline">{company.foundedYear || 'N/A'}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-gray-600">Industry</span>
                    </div>
                    <Badge variant="outline">{company.industry || 'N/A'}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* CAO Information */}
              {currentCAO && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Award className="w-5 h-5" />
                      <span>CAO Information</span>
                    </CardTitle>
                    <CardDescription>
                      Collective Labor Agreement details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CAO Name
                      </label>
                      <p className="text-sm font-medium text-gray-900">{currentCAO.name}</p>
                      <p className="text-xs text-gray-500">{currentCAO.fullName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span className="text-xs font-medium text-gray-700">Work Hours</span>
                        </div>
                        <p className="text-sm text-gray-900">{currentCAO.standardWorkingHours}h/week</p>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          <Calendar className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-medium text-gray-700">Holiday Days</span>
                        </div>
                        <p className="text-sm text-gray-900">{currentCAO.holidayDays} days</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          <Euro className="w-3 h-3 text-purple-600" />
                          <span className="text-xs font-medium text-gray-700">Min. Wage</span>
                        </div>
                        <p className="text-sm text-gray-900">€{currentCAO.minimumWage?.toLocaleString()}/month</p>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1 mb-1">
                          <CreditCard className="w-3 h-3 text-orange-600" />
                          <span className="text-xs font-medium text-gray-700">Holiday Pay</span>
                        </div>
                        <p className="text-sm text-gray-900">{currentCAO.holidayAllowanceRate}%</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Overtime Rules
                      </label>
                      <p className="text-xs text-gray-600">
                        {currentCAO.overtimeRules.rate}x pay after {currentCAO.overtimeRules.threshold} hours/week
                      </p>
                    </div>

                    {currentCAO.website && (
                      <div>
                        <a 
                          href={currentCAO.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
                        >
                          <Globe className="w-3 h-3" />
                          <span>View CAO Details</span>
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created
                    </label>
                    <p className="text-sm text-gray-600">{formatDate(company.createdAt)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Updated
                    </label>
                    <p className="text-sm text-gray-600">{formatDate(company.updatedAt)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company ID
                    </label>
                    <p className="text-xs text-gray-500 font-mono break-all">{company.id}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

