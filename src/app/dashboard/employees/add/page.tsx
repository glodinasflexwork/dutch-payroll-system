"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft,
  ArrowRight,
  Save,
  User,
  Building,
  Euro,
  Phone,
  AlertCircle,
  CheckCircle,
  Users,
  Mail
} from "lucide-react"
import { validateBSN } from "@/lib/utils/dutch-validation"

interface EmployeeFormData {
  firstName: string
  lastName: string
  email: string
  bsn: string
  dateOfBirth: string
  gender: 'male' | 'female' | ''
  country: string
  nationality: string
  phoneNumber: string
  address: string
  postalCode: string
  city: string
  bankAccount: string
  employmentType: 'monthly' | 'hourly'
  contractType: string
  department: string
  position: string
  startDate: string
  taxTable: 'wit' | 'groen'
  salary: string
  hourlyRate: string
  emergencyContact: string
  emergencyPhone: string
  emergencyRelation: string
  sendInvitation: boolean
}

interface FieldValidation {
  isValid: boolean
  message: string
  isRequired: boolean
}

const STEPS = [
  {
    id: 1,
    title: "Personal Information",
    description: "Basic employee details and contact information",
    icon: User,
    fields: ['firstName', 'lastName', 'email', 'bsn', 'dateOfBirth', 'gender', 'country', 'nationality', 'phoneNumber', 'address', 'postalCode', 'city', 'bankAccount']
  },
  {
    id: 2,
    title: "Employment Information", 
    description: "Job details and employment terms",
    icon: Building,
    fields: ['department', 'position', 'employmentType', 'contractType', 'startDate', 'taxTable']
  },
  {
    id: 3,
    title: "Salary Information",
    description: "Compensation details",
    icon: Euro,
    fields: ['salary', 'hourlyRate']
  },
  {
    id: 4,
    title: "Emergency Contact",
    description: "Emergency contact information (optional)",
    icon: Phone,
    fields: ['emergencyContact', 'emergencyPhone', 'emergencyRelation']
  },
  {
    id: 5,
    title: "Portal Access",
    description: "Employee portal invitation settings",
    icon: Mail,
    fields: ['sendInvitation']
  }
]

export default function AddEmployeeWizardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [validations, setValidations] = useState<Record<string, FieldValidation>>({})
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: '',
    lastName: '',
    email: '',
    bsn: '',
    dateOfBirth: '',
    gender: '',
    country: 'Netherlands',
    nationality: 'Dutch',
    phoneNumber: '',
    address: '',
    postalCode: '',
    city: '',
    bankAccount: '',
    employmentType: 'monthly',
    contractType: 'permanent',
    department: '',
    position: '',
    startDate: new Date().toISOString().split('T')[0],
    taxTable: 'wit',
    salary: '',
    hourlyRate: '',
    emergencyContact: '',
    emergencyPhone: '',
    emergencyRelation: '',
    sendInvitation: false
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

  const countries = [
    'Netherlands',
    'Belgium', 
    'Germany',
    'France',
    'United Kingdom',
    'Spain',
    'Italy',
    'Poland',
    'Other'
  ]

  const nationalities = [
    'Dutch',
    'Belgian',
    'German', 
    'French',
    'British',
    'Spanish',
    'Italian',
    'Polish',
    'Other'
  ]

  const emergencyRelations = [
    'Spouse/Partner',
    'Parent',
    'Child',
    'Sibling',
    'Friend',
    'Other'
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
      
      case 'dateOfBirth':
        const birthDate = new Date(value)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age
        
        return {
          isValid: value.trim().length > 0 && !isNaN(birthDate.getTime()) && actualAge >= 16 && actualAge <= 100,
          message: value.trim().length === 0 ? 'Date of birth is required' :
                   isNaN(birthDate.getTime()) ? 'Please enter a valid date' :
                   actualAge < 16 ? 'Employee must be at least 16 years old' :
                   actualAge > 100 ? 'Please enter a valid birth date' : 'Valid date of birth',
          isRequired: true
        }
      
      case 'gender':
        return {
          isValid: value === 'male' || value === 'female',
          message: value.trim().length === 0 ? 'Gender is required' : 'Valid gender selected',
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
      
      case 'emergencyRelation':
        return {
          isValid: true,
          message: 'Emergency relation is optional',
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

  const validateCurrentStep = (): boolean => {
    const currentStepFields = STEPS[currentStep - 1].fields
    const newErrors: Record<string, string> = {}
    let isValid = true

    currentStepFields.forEach(field => {
      const validation = validateField(field as keyof EmployeeFormData, formData[field as keyof EmployeeFormData])
      
      if (validation.isRequired && !validation.isValid) {
        newErrors[field] = validation.message
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    // Validate all required fields
    const allErrors: Record<string, string> = {}
    let isValid = true

    Object.keys(formData).forEach(key => {
      const field = key as keyof EmployeeFormData
      const validation = validateField(field, formData[field])
      
      if (validation.isRequired && !validation.isValid) {
        allErrors[field] = validation.message
        isValid = false
      }
    })

    if (!isValid) {
      setErrors(allErrors)
      // Go to first step with errors
      for (let i = 0; i < STEPS.length; i++) {
        const stepFields = STEPS[i].fields
        const hasError = stepFields.some(field => allErrors[field])
        if (hasError) {
          setCurrentStep(i + 1)
          break
        }
      }
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

  const getStepProgress = () => {
    return (currentStep / STEPS.length) * 100
  }

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed'
    if (stepNumber === currentStep) return 'current'
    return 'upcoming'
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
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
                  Date of Birth *
                </label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className={getFieldClassName('dateOfBirth')}
                  max={new Date().toISOString().split('T')[0]}
                />
                {renderFieldFeedback('dateOfBirth')}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${getFieldClassName('gender')}`}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male (De heer)</option>
                  <option value="female">Female (Mevrouw)</option>
                </select>
                {renderFieldFeedback('gender')}
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
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
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
                  {nationalities.map(nationality => (
                    <option key={nationality} value={nationality}>{nationality}</option>
                  ))}
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
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
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
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
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
                <p className="text-sm text-gray-500 mt-1">
                  Enter the gross monthly salary amount
                </p>
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
                <p className="text-sm text-gray-500 mt-1">
                  Enter the gross hourly rate
                </p>
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <select
                  value={formData.emergencyRelation}
                  onChange={(e) => handleInputChange('emergencyRelation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Select relationship</option>
                  {emergencyRelations.map(relation => (
                    <option key={relation} value={relation}>{relation}</option>
                  ))}
                </select>
                {renderFieldFeedback('emergencyRelation')}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Emergency contact information is optional but recommended for workplace safety and compliance purposes.
              </p>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sendInvitation"
                checked={formData.sendInvitation}
                onChange={(e) => handleInputChange("sendInvitation", e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="sendInvitation" className="text-sm font-medium text-gray-700">
                Send portal invitation to employee
              </label>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Sending a portal invitation may incur additional costs or count towards your subscription limits. Please ensure your subscription plan supports additional employee portals.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
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
            <p className="text-gray-500">Step-by-step employee creation with Dutch compliance</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Step {currentStep} of {STEPS.length}</span>
            <span>{Math.round(getStepProgress())}% Complete</span>
          </div>
          <Progress value={getStepProgress()} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex justify-between items-center">
          {STEPS.map((step, index) => {
            const stepNumber = index + 1
            const status = getStepStatus(stepNumber)
            const Icon = step.icon
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                  status === 'current' ? 'bg-blue-500 border-blue-500 text-white' :
                  'bg-gray-100 border-gray-300 text-gray-400'
                }`}>
                  {status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-3 hidden md:block">
                  <p className={`text-sm font-medium ${
                    status === 'current' ? 'text-blue-600' : 
                    status === 'completed' ? 'text-green-600' : 
                    'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`hidden md:block w-12 h-0.5 ml-4 ${
                    status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Current Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {React.createElement(STEPS[currentStep - 1].icon, { className: "w-5 h-5" })}
              <span>{STEPS[currentStep - 1].title}</span>
              <Badge variant="outline">Step {currentStep}</Badge>
            </CardTitle>
            <CardDescription>
              {STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              type="button"
              onClick={handleNext}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Creating...' : 'Create Employee'}</span>
            </Button>
          )}
        </div>

        {/* Error Display */}
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
      </div>
    </DashboardLayout>
  )
}

