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
  Award,
  TrendingUp,
  Download,
  UserPlus,
  CheckCircle2,
  BarChart3
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
  loonheffingennummer?: string
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
    setError(null)
    setSuccess(null)
  }

  const handleCancel = () => {
    setEditing(false)
    setFormData(company || {})
    setError(null)
    setSuccess(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

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

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!company) return 0
    const fields = [
      'name', 'industry', 'description', 'foundedYear', 'employeeCount',
      'address', 'city', 'postalCode', 'country', 'phone', 'email', 'website',
      'kvkNumber', 'loonheffingennummer', 'vatNumber'
    ]
    const filledFields = fields.filter(field => company[field as keyof Company])
    return Math.round((filledFields.length / fields.length) * 100)
  }

  // Calculate days since last update
  const getDaysSinceUpdate = () => {
    if (!company?.updatedAt) return 0
    const now = new Date()
    const updated = new Date(company.updatedAt)
    const diffTime = Math.abs(now.getTime() - updated.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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

  const profileCompletion = calculateProfileCompletion()
  const daysSinceUpdate = getDaysSinceUpdate()

  return (
    <DashboardLayout>
      <div className="space-y-6">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Profile Completion</p>
                  <p className="text-3xl font-bold">{profileCompletion}%</p>
                  <div className="w-full bg-blue-500/30 rounded-full h-2 mt-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-300"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Employees</p>
                  <p className="text-3xl font-bold">{company?.employeeCount || 0}</p>
                  <p className="text-blue-100 text-sm">Active workforce</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Last Updated</p>
                  <p className="text-3xl font-bold">{daysSinceUpdate}</p>
                  <p className="text-blue-100 text-sm">
                    {daysSinceUpdate === 0 ? 'Today' : daysSinceUpdate === 1 ? 'day ago' : 'days ago'}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Panel */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span>Quick Actions</span>
              </h3>
              {!editing && (
                <Button onClick={handleEdit} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Company
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                disabled={profileCompletion === 100}
              >
                <BarChart3 className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium">
                  {profileCompletion === 100 ? 'Profile Complete' : 'Complete Profile'}
                </span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <UserPlus className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium">Add Employee</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <Download className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium">Download Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {company && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Company Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Building2 className="w-5 h-5" />
                    <span>Basic Information</span>
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Core company details and contact information
                  </CardDescription>
                </div>
                <CardContent className="p-6 space-y-4">
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
                          className="focus:ring-blue-500 focus:border-blue-500"
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
                          className="focus:ring-blue-500 focus:border-blue-500"
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
                          className="focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{company.employeeCount || 'Not specified'}</p>
                      )}
                    </div>
                  </div>

                  {editing && (
                    <div className="flex items-center space-x-2 pt-4 border-t">
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
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        <Save className="w-4 h-4" />
                        <span>{saving ? "Saving..." : "Save Changes"}</span>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <MapPin className="w-5 h-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Address and contact details
                  </CardDescription>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    {editing ? (
                      <Input
                        value={formData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Street address"
                        className="focus:ring-blue-500 focus:border-blue-500"
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
                          className="focus:ring-blue-500 focus:border-blue-500"
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
                          className="focus:ring-blue-500 focus:border-blue-500"
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
                          className="focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{company.country || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      {editing ? (
                        <Input
                          value={formData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+31 20 123 4567"
                          className="focus:ring-blue-500 focus:border-blue-500"
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
                          className="focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{company.email || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      {editing ? (
                        <Input
                          value={formData.website || ''}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://company.com"
                          className="focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{company.website || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Legal Information */}
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <FileText className="w-5 h-5" />
                    <span>Legal Information</span>
                  </CardTitle>
                  <CardDescription className="text-blue-100">
                    Registration numbers and legal identifiers
                  </CardDescription>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        KvK Number
                      </label>
                      {editing ? (
                        <Input
                          value={formData.kvkNumber || ''}
                          onChange={(e) => handleInputChange('kvkNumber', e.target.value)}
                          placeholder="12345678"
                          className="focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{company.kvkNumber || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loonheffingennummer
                      </label>
                      {editing ? (
                        <Input
                          value={formData.loonheffingennummer || ''}
                          onChange={(e) => handleInputChange('loonheffingennummer', e.target.value)}
                          placeholder="123456789L01"
                          className="focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{company.loonheffingennummer || 'Not provided'}</p>
                      )}
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
                          className="focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{company.vatNumber || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Employees</span>
                    </div>
                    <span className="font-semibold">{company.employeeCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Founded</span>
                    </div>
                    <span className="font-semibold">{company.foundedYear || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Industry</span>
                    </div>
                    <span className="font-semibold">{company.industry || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created
                    </label>
                    <p className="text-sm text-gray-900">{formatDate(company.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Updated
                    </label>
                    <p className="text-sm text-gray-900">{formatDate(company.updatedAt)}</p>
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

