"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Save,
  User,
  Building,
  Euro,
  Calendar,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { validateBSN } from "@/lib/utils/dutch-validation"

interface EmployeeFormData {
  firstName: string
  lastName: string
  email: string
  bsn: string
  employmentType: 'monthly' | 'hourly'
  contractType: string
  department: string
  position: string
  salary: string
  hourlyRate: string
  taxTable: 'wit' | 'groen'
  startDate: string
  address: string
  postalCode: string
  city: string
  phoneNumber: string
  bankAccount: string
  emergencyContact: string
  emergencyPhone: string
}

export default function AddEmployeePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    bsn: '',
    employmentType: 'monthly',
    contractType: 'permanent',
    department: '',
    position: '',
    salary: '',
    hourlyRate: '',
    taxTable: 'wit',
    startDate: new Date().toISOString().split('T')[0],
    address: '',
    postalCode: '',
    city: '',
    phoneNumber: '',
    bankAccount: '',
    emergencyContact: '',
    emergencyPhone: ''
  })

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

  const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    // Real-time BSN validation
    if (field === 'bsn' && value) {
      const isValid = validateBSN(value)
      if (!isValid && value.length === 9) {
        setErrors(prev => ({ ...prev, bsn: 'Invalid BSN number' }))
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.bsn.trim()) newErrors.bsn = 'BSN is required'
    if (!formData.department.trim()) newErrors.department = 'Department is required'
    if (!formData.position.trim()) newErrors.position = 'Position is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    // BSN validation
    if (formData.bsn && !validateBSN(formData.bsn)) {
      newErrors.bsn = 'Invalid BSN number'
    }

    // Salary validation
    if (formData.employmentType === 'monthly') {
      if (!formData.salary.trim()) {
        newErrors.salary = 'Monthly salary is required'
      } else if (isNaN(Number(formData.salary)) || Number(formData.salary) <= 0) {
        newErrors.salary = 'Invalid salary amount'
      }
    } else {
      if (!formData.hourlyRate.trim()) {
        newErrors.hourlyRate = 'Hourly rate is required'
      } else if (isNaN(Number(formData.hourlyRate)) || Number(formData.hourlyRate) <= 0) {
        newErrors.hourlyRate = 'Invalid hourly rate'
      }
    }

    // Postal code validation (Dutch format)
    if (formData.postalCode && !/^\d{4}\s?[A-Z]{2}$/i.test(formData.postalCode)) {
      newErrors.postalCode = 'Invalid postal code format (e.g., 1234 AB)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          salary: formData.employmentType === 'monthly' ? Number(formData.salary) : undefined,
          hourlyRate: formData.employmentType === 'hourly' ? Number(formData.hourlyRate) : undefined,
        }),
      })

      if (response.ok) {
        router.push('/dashboard/employees')
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.error || 'Failed to create employee' })
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: string) => {
    if (!value) return ''
    const number = Number(value.replace(/[^0-9]/g, ''))
    return new Intl.NumberFormat('nl-NL').format(number)
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
            <p className="text-gray-500">Create a new employee record with Dutch compliance</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>
                Basic employee details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="employee@company.nl"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BSN (Burgerservicenummer) *
                  </label>
                  <Input
                    value={formData.bsn}
                    onChange={(e) => handleInputChange('bsn', e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="123456789"
                    maxLength={9}
                    className={errors.bsn ? 'border-red-500' : formData.bsn && validateBSN(formData.bsn) ? 'border-green-500' : ''}
                  />
                  {errors.bsn ? (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.bsn}
                    </p>
                  ) : formData.bsn && validateBSN(formData.bsn) ? (
                    <p className="text-green-500 text-sm mt-1 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Valid BSN number
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="+31 6 12345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Account (IBAN)
                  </label>
                  <Input
                    value={formData.bankAccount}
                    onChange={(e) => handleInputChange('bankAccount', e.target.value.toUpperCase())}
                    placeholder="NL91 ABNA 0417 1643 00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Straatnaam 123"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <Input
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value.toUpperCase())}
                    placeholder="1234 AB"
                    className={errors.postalCode ? 'border-red-500' : ''}
                  />
                  {errors.postalCode && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.postalCode}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Amsterdam"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Employment Information</span>
              </CardTitle>
              <CardDescription>
                Job details and employment terms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.department}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <Input
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="Software Engineer"
                    className={errors.position ? 'border-red-500' : ''}
                  />
                  {errors.position && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.position}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Type *
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => handleInputChange('employmentType', e.target.value as 'monthly' | 'hourly')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="monthly">Monthly Salary</option>
                    <option value="hourly">Hourly Rate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Type *
                  </label>
                  <select
                    value={formData.contractType}
                    onChange={(e) => handleInputChange('contractType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="permanent">Permanent Contract</option>
                    <option value="temporary">Temporary Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={errors.startDate ? 'border-red-500' : ''}
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.startDate}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compensation & Tax */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Euro className="w-5 h-5" />
                <span>Compensation & Tax Information</span>
              </CardTitle>
              <CardDescription>
                Salary details and Dutch tax settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.employmentType === 'monthly' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Salary (EUR) *
                    </label>
                    <Input
                      value={formData.salary}
                      onChange={(e) => handleInputChange('salary', e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="4000"
                      className={errors.salary ? 'border-red-500' : ''}
                    />
                    {formData.salary && (
                      <p className="text-sm text-gray-500 mt-1">
                        €{formatCurrency(formData.salary)} per month
                      </p>
                    )}
                    {errors.salary && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.salary}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate (EUR) *
                    </label>
                    <Input
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="25.00"
                      className={errors.hourlyRate ? 'border-red-500' : ''}
                    />
                    {formData.hourlyRate && (
                      <p className="text-sm text-gray-500 mt-1">
                        €{formData.hourlyRate} per hour
                      </p>
                    )}
                    {errors.hourlyRate && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.hourlyRate}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Table *
                  </label>
                  <select
                    value={formData.taxTable}
                    onChange={(e) => handleInputChange('taxTable', e.target.value as 'wit' | 'groen')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="wit">Wit (Standard Tax Table)</option>
                    <option value="groen">Groen (Reduced Tax Table)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.taxTable === 'wit' 
                      ? 'Standard tax table for most employees'
                      : 'Reduced tax table for employees with tax benefits'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5" />
                <span>Emergency Contact</span>
              </CardTitle>
              <CardDescription>
                Emergency contact information (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Name
                  </label>
                  <Input
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="Contact person name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact Phone
                  </label>
                  <Input
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    placeholder="+31 6 12345678"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            
            <div className="flex items-center space-x-3">
              {errors.submit && (
                <p className="text-red-500 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.submit}
                </p>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>Create Employee</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

