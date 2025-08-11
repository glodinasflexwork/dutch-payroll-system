"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft,
  Save,
  User,
  Building,
  Euro,
  Calendar,
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Shield,
  Users,
  Clock,
  FileText,
  Settings,
  Briefcase,
  Home,
  Heart,
  Eye,
  EyeOff
} from "lucide-react"

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  bsn: string
  employmentType: 'monthly' | 'hourly'
  contractType: string
  department: string
  position: string
  salary: number
  hourlyRate?: number
  taxTable: 'wit' | 'groen'
  startDate: string
  streetName: string
  postalCode: string
  city: string
  phone: string
  bankAccount: string
  emergencyContact: string
  emergencyPhone: string
  isActive: boolean
  employeeNumber: string
}

export default function EditEmployeePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState<Partial<Employee>>({})
  const [showSensitiveData, setShowSensitiveData] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')

  const departments = [
    'Engineering',
    'Sales',
    'Marketing',
    'HR',
    'Finance',
    'Operations',
    'Customer Service',
    'Legal'
  ]

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'salary', label: 'Salary', icon: Euro },
    { id: 'emergency', label: 'Emergency', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  useEffect(() => {
    if (params.id) {
      fetchEmployee()
    }
  }, [params.id])

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${params.id}`)
      if (response.ok) {
        const result = await response.json()
        setEmployee(result.employee)
        setFormData(result.employee)
      } else {
        setError("Employee not found")
      }
    } catch (error) {
      console.error("Error fetching employee:", error)
      setError("Failed to load employee details")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof Employee, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const editableFields = [
        'firstName', 'lastName', 'email', 'phone', 'streetName', 'houseNumber', 
        'houseNumberAddition', 'city', 'postalCode', 'country', 'nationality', 
        'bsn', 'dateOfBirth', 'startDate', 'endDate', 'position', 'department', 'employmentType', 
        'contractType', 'workingHours', 'salary', 'salaryType', 'hourlyRate', 
        'taxTable', 'taxCredit', 'isDGA', 'bankAccount', 'bankName', 
        'emergencyContact', 'emergencyPhone', 'emergencyRelation', 'isActive',
        'holidayAllowance', 'holidayDays', 'employeeNumber'
      ]
      
      const updateData: any = {}
      editableFields.forEach(field => {
        if (formData[field as keyof Employee] !== undefined) {
          updateData[field] = formData[field as keyof Employee]
        }
      })
      
      console.log('🔄 Sending update data:', updateData)

      const response = await fetch(`/api/employees/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        router.push(`/dashboard/employees/${params.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update employee')
      }
    } catch (error) {
      console.error('Update error:', error)
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading employee details...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error && !employee) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center space-x-2 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Employee</span>
            </Button>
          </div>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Not Found</h3>
                <p className="text-gray-500">{error}</p>
                <Button 
                  onClick={() => router.push('/dashboard/employees')}
                  className="mt-4"
                >
                  Return to Employee List
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
          <div className="flex items-center space-x-4 mb-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="flex items-center space-x-2 hover:bg-white/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Employee</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-bold">
                {getInitials(formData.firstName, formData.lastName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Edit Employee Profile
              </h1>
              <p className="text-lg text-gray-600 mb-3">
                {formData.firstName} {formData.lastName}
              </p>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-white">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {formData.position || 'Position not set'}
                </Badge>
                <Badge variant="outline" className="bg-white">
                  <Building className="w-3 h-3 mr-1" />
                  {formData.department || 'Department not set'}
                </Badge>
                <Badge 
                  variant={formData.isActive ? "default" : "secondary"}
                  className={formData.isActive ? "bg-green-100 text-green-800" : ""}
                >
                  {formData.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Current Salary</div>
              <div className="text-2xl font-bold text-gray-900">
                {formData.employmentType === 'monthly' 
                  ? formatCurrency(formData.salary)
                  : `${formatCurrency(formData.hourlyRate)}/hr`
                }
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-200 rounded-t-lg`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                    <p className="text-sm text-gray-500">Basic employee details and contact information</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSensitiveData(!showSensitiveData)}
                    className="flex items-center space-x-2"
                  >
                    {showSensitiveData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    <span>{showSensitiveData ? 'Hide' : 'Show'} Sensitive Data</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-base">
                        <User className="w-4 h-4 text-blue-500" />
                        <span>Basic Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                          </label>
                          <Input
                            value={formData.firstName || ''}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder="Enter first name"
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name *
                          </label>
                          <Input
                            value={formData.lastName || ''}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder="Enter last name"
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          BSN (Social Security Number) *
                        </label>
                        <Input
                          value={showSensitiveData ? (formData.bsn || '') : '••••••••••'}
                          onChange={(e) => handleInputChange('bsn', e.target.value)}
                          placeholder="123456789"
                          disabled={!showSensitiveData}
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-base">
                        <Mail className="w-4 h-4 text-green-500" />
                        <span>Contact Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="employee@company.nl"
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          value={formData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+31 6 12345678"
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 lg:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-base">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span>Address Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address
                        </label>
                        <Input
                          value={formData.streetName || ''}
                          onChange={(e) => handleInputChange('streetName', e.target.value)}
                          placeholder="Straatnaam 123"
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postal Code
                          </label>
                          <Input
                            value={formData.postalCode || ''}
                            onChange={(e) => handleInputChange('postalCode', e.target.value.toUpperCase())}
                            placeholder="1234 AB"
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <Input
                            value={formData.city || ''}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            placeholder="Amsterdam"
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Employment Information Tab */}
            {activeTab === 'employment' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Employment Information</h3>
                  <p className="text-sm text-gray-500">Job details and employment terms</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-base">
                        <Building className="w-4 h-4 text-blue-500" />
                        <span>Position Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department *
                        </label>
                        <select
                          value={formData.department || ''}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select department</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Position *
                        </label>
                        <Input
                          value={formData.position || ''}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                          placeholder="Software Engineer"
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-base">
                        <FileText className="w-4 h-4 text-green-500" />
                        <span>Contract Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Employment Type *
                        </label>
                        <select
                          value={formData.employmentType || 'monthly'}
                          onChange={(e) => handleInputChange('employmentType', e.target.value as 'monthly' | 'hourly')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="monthly">Monthly Salary</option>
                          <option value="hourly">Hourly Rate</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contract Type *
                        </label>
                        <select
                          value={formData.contractType || 'permanent'}
                          onChange={(e) => handleInputChange('contractType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="permanent">Permanent</option>
                          <option value="temporary">Temporary</option>
                          <option value="freelance">Freelance</option>
                          <option value="internship">Internship</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 lg:col-span-2">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-base">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span>Dates & Tax Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Date *
                          </label>
                          <Input
                            type="date"
                            value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                            onChange={(e) => handleInputChange('startDate', e.target.value)}
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tax Table
                          </label>
                          <select
                            value={formData.taxTable || 'wit'}
                            onChange={(e) => handleInputChange('taxTable', e.target.value as 'wit' | 'groen')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="wit">Wit (Standard)</option>
                            <option value="groen">Groen (Reduced)</option>
                          </select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Salary Information Tab */}
            {activeTab === 'salary' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Salary Information</h3>
                  <p className="text-sm text-gray-500">Compensation details and financial information</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-base">
                        <Euro className="w-4 h-4 text-green-500" />
                        <span>Compensation</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formData.employmentType === 'monthly' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monthly Salary (€) *
                          </label>
                          <Input
                            type="number"
                            value={formData.salary || ''}
                            onChange={(e) => handleInputChange('salary', Number(e.target.value))}
                            placeholder="3500"
                            min="0"
                            step="0.01"
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Gross monthly salary before taxes and deductions
                          </p>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hourly Rate (€) *
                          </label>
                          <Input
                            type="number"
                            value={formData.hourlyRate || ''}
                            onChange={(e) => handleInputChange('hourlyRate', Number(e.target.value))}
                            placeholder="25.00"
                            min="0"
                            step="0.01"
                            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Gross hourly rate before taxes and deductions
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2 text-base">
                        <CreditCard className="w-4 h-4 text-blue-500" />
                        <span>Banking Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bank Account (IBAN)
                        </label>
                        <Input
                          value={showSensitiveData ? (formData.bankAccount || '') : '••••••••••••••••••••'}
                          onChange={(e) => handleInputChange('bankAccount', e.target.value.toUpperCase())}
                          placeholder="NL91 ABNA 0417 1643 00"
                          disabled={!showSensitiveData}
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Dutch IBAN format for salary payments
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Emergency Contact Tab */}
            {activeTab === 'emergency' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
                  <p className="text-sm text-gray-500">Emergency contact information (optional but recommended)</p>
                </div>

                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>Emergency Contact Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Emergency Contact Name
                        </label>
                        <Input
                          value={formData.emergencyContact || ''}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          placeholder="Contact person name"
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Emergency Phone Number
                        </label>
                        <Input
                          value={formData.emergencyPhone || ''}
                          onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                          placeholder="+31 6 12345678"
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-900">Important Note</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Emergency contact information is used in case of workplace incidents or medical emergencies. 
                            This information is kept confidential and only accessed when necessary.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Employee Settings</h3>
                  <p className="text-sm text-gray-500">Manage employee status and system settings</p>
                </div>

                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-base">
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span>Status & Permissions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${formData.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div>
                          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                            Employee Status
                          </label>
                          <p className="text-xs text-gray-500">
                            {formData.isActive ? 'Employee is active and included in payroll' : 'Employee is inactive and excluded from payroll'}
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive ?? true}
                        onChange={(e) => handleInputChange('isActive', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition-colors"
                      />
                    </div>

                    <Separator />

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-900">Status Change Impact</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Deactivating an employee will remove them from payroll calculations and restrict their access to the employee portal. 
                            This action can be reversed at any time.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Enhanced Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center space-x-2 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Cancel Changes</span>
              </Button>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/employees/${params.id}`)}
                  className="flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </Button>
                
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 transition-colors min-w-[120px]"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Enhanced Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Error updating employee
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}

