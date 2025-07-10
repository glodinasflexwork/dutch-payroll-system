"use client"

import { useState, useEffect } from "react"
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
  country: string
  nationality: string
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

interface FieldValidation {
  isValid: boolean
  message: string
  isRequired: boolean
}

export default function AddEmployeePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [validations, setValidations] = useState<Record<string, FieldValidation>>({})
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    bsn: '',
    country: 'Netherlands',
    nationality: 'Dutch',
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

  // Real-time validation functions
  const validateField = (field: keyof EmployeeFormData, value: string): FieldValidation => {
    switch (field) {
      case 'firstName':
        return {
          isValid: value.trim().length >= 2,
          message: value.trim().length === 0 ? 'First name is required' : 
                   value.trim().length < 2 ? 'First name must be at least 2 characters' : 'Valid first name',
          isRequired: true
        }
      
      case 'lastName':
        return {
          isValid: value.trim().length >= 2,
          message: value.trim().length === 0 ? 'Last name is required' : 
                   value.trim().length < 2 ? 'Last name must be at least 2 characters' : 'Valid last name',
          isRequired: true
        }
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return {
          isValid: emailRegex.test(value),
          message: value.trim().length === 0 ? 'Email address is required' : 
                   !emailRegex.test(value) ? 'Please enter a valid email address' : 'Valid email address',
          isRequired: true
        }
      
      case 'bsn':
        return {
          isValid: validateBSN(value),
          message: value.trim().length === 0 ? 'BSN is required' : 
                   value.length !== 9 ? 'BSN must be exactly 9 digits' :
                   !validateBSN(value) ? 'Invalid BSN number' : 'Valid BSN number',
          isRequired: true
        }
      
      case 'country':
        return {
          isValid: value.trim().length > 0,
          message: value.trim().length === 0 ? 'Country is required' : 'Valid country selected',
          isRequired: true
        }
      
      case 'nationality':
        return {
          isValid: value.trim().length > 0,
          message: value.trim().length === 0 ? 'Nationality is required' : 'Valid nationality selected',
          isRequired: true
        }
      
      case 'phoneNumber':
        const phoneRegex = /^(\+31|0)[0-9]{9}$/
        return {
          isValid: value.length === 0 || phoneRegex.test(value.replace(/\s/g, '')),
          message: value.length === 0 ? 'Phone number is optional' :
                   !phoneRegex.test(value.replace(/\s/g, '')) ? 'Please enter a valid Dutch phone number' : 'Valid phone number',
          isRequired: false
        }
      
      case 'postalCode':
        const postalRegex = /^\d{4}\s?[A-Z]{2}$/i
        return {
          isValid: value.length === 0 || postalRegex.test(value),
          message: value.length === 0 ? 'Postal code is optional' :
                   !postalRegex.test(value) ? 'Please enter a valid postal code (e.g., 1234 AB)' : 'Valid postal code',
          isRequired: false
        }
      
      case 'bankAccount':
        const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/
        const cleanIban = value.replace(/\s/g, '').toUpperCase()
        return {
          isValid: value.length === 0 || (ibanRegex.test(cleanIban) && cleanIban.startsWith('NL')),
          message: value.length === 0 ? 'Bank account is optional' :
                   !cleanIban.startsWith('NL') ? 'Please enter a Dutch IBAN (starting with NL)' :
                   !ibanRegex.test(cleanIban) ? 'Please enter a valid IBAN' : 'Valid IBAN',
          isRequired: false
        }
      
      case 'department':
        return {
          isValid: value.trim().length > 0,
          message: value.trim().length === 0 ? 'Department is required' : 'Valid department selected',
          isRequired: true
        }
      
      case 'position':
        return {
          isValid: value.trim().length >= 2,
          message: value.trim().length === 0 ? 'Position is required' : 
                   value.trim().length < 2 ? 'Position must be at least 2 characters' : 'Valid position',
          isRequired: true
        }
      
      case 'salary':
        if (formData.employmentType === 'monthly') {
          const salaryNum = Number(value)
          return {
            isValid: !isNaN(salaryNum) && salaryNum > 0,
            message: value.trim().length === 0 ? 'Monthly salary is required' :
                     isNaN(salaryNum) ? 'Please enter a valid number' :
                     salaryNum <= 0 ? 'Salary must be greater than 0' : 'Valid salary amount',
            isRequired: true
          }
        }
        return { isValid: true, message: 'Not required for hourly employees', isRequired: false }
      
      case 'hourlyRate':
        if (formData.employmentType === 'hourly') {
          const rateNum = Number(value)
          return {
            isValid: !isNaN(rateNum) && rateNum > 0,
            message: value.trim().length === 0 ? 'Hourly rate is required' :
                     isNaN(rateNum) ? 'Please enter a valid number' :
                     rateNum <= 0 ? 'Hourly rate must be greater than 0' : 'Valid hourly rate',
            isRequired: true
          }
        }
        return { isValid: true, message: 'Not required for monthly employees', isRequired: false }
      
      case 'startDate':
        const today = new Date()
        const selectedDate = new Date(value)
        return {
          isValid: value.length > 0 && selectedDate <= today,
          message: value.length === 0 ? 'Start date is required' :
                   selectedDate > today ? 'Start date cannot be in the future' : 'Valid start date',
          isRequired: true
        }
      
      case 'city':
        return {
          isValid: value.length === 0 || value.trim().length >= 2,
          message: value.length === 0 ? 'City is optional' :
                   value.trim().length < 2 ? 'City name must be at least 2 characters' : 'Valid city name',
          isRequired: false
        }
      
      case 'address':
        return {
          isValid: value.length === 0 || value.trim().length >= 5,
          message: value.length === 0 ? 'Address is optional' :
                   value.trim().length < 5 ? 'Please enter a complete address' : 'Valid address',
          isRequired: false
        }
      
      case 'emergencyContact':
        return {
          isValid: value.length === 0 || value.trim().length >= 2,
          message: value.length === 0 ? 'Emergency contact is optional' :
                   value.trim().length < 2 ? 'Contact name must be at least 2 characters' : 'Valid emergency contact',
          isRequired: false
        }
      
      case 'emergencyPhone':
        const emergencyPhoneRegex = /^(\+31|0)[0-9]{9}$/
        return {
          isValid: value.length === 0 || emergencyPhoneRegex.test(value.replace(/\s/g, '')),
          message: value.length === 0 ? 'Emergency phone is optional' :
                   !emergencyPhoneRegex.test(value.replace(/\s/g, '')) ? 'Please enter a valid phone number' : 'Valid emergency phone',
          isRequired: false
        }
      
      default:
        return { isValid: true, message: '', isRequired: false }
    }
  }

  const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Real-time validation
    const validation = validateField(field, value)
    setValidations(prev => ({ ...prev, [field]: validation }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Validate all fields on mount and when employment type changes
  useEffect(() => {
    const newValidations: Record<string, FieldValidation> = {}
    Object.keys(formData).forEach(key => {
      const field = key as keyof EmployeeFormData
      newValidations[field] = validateField(field, formData[field])
    })
    setValidations(newValidations)
  }, [formData.employmentType])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    Object.keys(formData).forEach(key => {
      const field = key as keyof EmployeeFormData
      const validation = validateField(field, formData[field])
      
      if (validation.isRequired && !validation.isValid) {
        newErrors[field] = validation.message
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
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

  const getFieldClassName = (field: keyof EmployeeFormData) => {
    const validation = validations[field]
    if (!validation) return ''
    
    if (errors[field]) return 'border-red-500 focus:border-red-500 focus:ring-red-500'
    if (validation.isValid && formData[field].length > 0) return 'border-green-500 focus:border-green-500 focus:ring-green-500'
    return ''
  }

  const renderFieldFeedback = (field: keyof EmployeeFormData) => {
    const validation = validations[field]
    const error = errors[field]
    
    if (error) {
      return (
        <p className="text-red-500 text-sm mt-1 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )
    }
    
    if (validation && formData[field].length > 0) {
      if (validation.isValid) {
        return (
          <p className="text-green-500 text-sm mt-1 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1" />
            {validation.message}
          </p>
        )
      } else if (validation.isRequired) {
        return (
          <p className="text-red-500 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {validation.message}
          </p>
        )
      }
    }
    
    return null
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
                    className={getFieldClassName('firstName')}
                  />
                  {renderFieldFeedback('firstName')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    className={getFieldClassName('lastName')}
                  />
                  {renderFieldFeedback('lastName')}
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
                    className={getFieldClassName('email')}
                  />
                  {renderFieldFeedback('email')}
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
                    className={getFieldClassName('bsn')}
                  />
                  {renderFieldFeedback('bsn')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${getFieldClassName('country')}`}
                  >
                    <option value="Netherlands">Netherlands</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Other">Other</option>
                  </select>
                  {renderFieldFeedback('country')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nationality *
                  </label>
                  <select
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${getFieldClassName('nationality')}`}
                  >
                    <option value="Dutch">Dutch</option>
                    <option value="Belgian">Belgian</option>
                    <option value="German">German</option>
                    <option value="French">French</option>
                    <option value="British">British</option>
                    <option value="Other">Other</option>
                  </select>
                  {renderFieldFeedback('nationality')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="+31 6 12345678"
                    className={getFieldClassName('phoneNumber')}
                  />
                  {renderFieldFeedback('phoneNumber')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Account (IBAN)
                  </label>
                  <Input
                    value={formData.bankAccount}
                    onChange={(e) => handleInputChange('bankAccount', e.target.value.toUpperCase())}
                    placeholder="NL91 ABNA 0417 1643 00"
                    className={getFieldClassName('bankAccount')}
                  />
                  {renderFieldFeedback('bankAccount')}
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
                  className={getFieldClassName('address')}
                />
                {renderFieldFeedback('address')}
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
                    className={getFieldClassName('postalCode')}
                  />
                  {renderFieldFeedback('postalCode')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Amsterdam"
                    className={getFieldClassName('city')}
                  />
                  {renderFieldFeedback('city')}
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
                    className={`w-full px-3 py-2 border rounded-md text-sm ${getFieldClassName('department')}`}
                  >
                    <option value="">Select department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {renderFieldFeedback('department')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <Input
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="Software Engineer"
                    className={getFieldClassName('position')}
                  />
                  {renderFieldFeedback('position')}
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
                    <option value="permanent">Permanent</option>
                    <option value="temporary">Temporary</option>
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
                    className={getFieldClassName('startDate')}
                  />
                  {renderFieldFeedback('startDate')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Table
                  </label>
                  <select
                    value={formData.taxTable}
                    onChange={(e) => handleInputChange('taxTable', e.target.value as 'wit' | 'groen')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="wit">Wit (Standard)</option>
                    <option value="groen">Groen (Reduced)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Euro className="w-5 h-5" />
                <span>Salary Information</span>
              </CardTitle>
              <CardDescription>
                Compensation details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.employmentType === 'monthly' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Salary (€) *
                  </label>
                  <Input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    placeholder="3500"
                    min="0"
                    step="0.01"
                    className={getFieldClassName('salary')}
                  />
                  {renderFieldFeedback('salary')}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hourly Rate (€) *
                  </label>
                  <Input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                    placeholder="25.00"
                    min="0"
                    step="0.01"
                    className={getFieldClassName('hourlyRate')}
                  />
                  {renderFieldFeedback('hourlyRate')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
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
                    className={getFieldClassName('emergencyContact')}
                  />
                  {renderFieldFeedback('emergencyContact')}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Phone Number
                  </label>
                  <Input
                    value={formData.emergencyPhone}
                    onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                    placeholder="+31 6 12345678"
                    className={getFieldClassName('emergencyPhone')}
                  />
                  {renderFieldFeedback('emergencyPhone')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Employee'}</span>
            </Button>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error creating employee
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {errors.submit}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  )
}

