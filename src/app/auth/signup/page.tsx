"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ValidationErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  companyName?: string
  companyAddress?: string
  companyCity?: string
  companyPostalCode?: string
  kvkNumber?: string
}

interface DebugInfo {
  step: string
  timestamp: string
  details: string
  status: 'info' | 'success' | 'error' | 'warning'
}

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    companyAddress: "",
    companyCity: "",
    companyPostalCode: "",
    kvkNumber: ""
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [fieldTouched, setFieldTouched] = useState<{[key: string]: boolean}>({})
  const router = useRouter()

  const addDebugInfo = (step: string, details: string, status: DebugInfo['status'] = 'info') => {
    const newDebugInfo: DebugInfo = {
      step,
      details,
      status,
      timestamp: new Date().toLocaleTimeString()
    }
    setDebugInfo(prev => [...prev, newDebugInfo])
  }

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Full name is required'
        if (value.trim().length < 2) return 'Name must be at least 2 characters'
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Name can only contain letters and spaces'
        return undefined
      
      case 'email':
        if (!value.trim()) return 'Email address is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return 'Please enter a valid email address'
        return undefined
      
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 6) return 'Password must be at least 6 characters'
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter'
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter'
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number'
        return undefined
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password'
        if (value !== formData.password) return 'Passwords do not match'
        return undefined
      
      case 'companyName':
        if (!value.trim()) return 'Company name is required'
        if (value.trim().length < 2) return 'Company name must be at least 2 characters'
        return undefined
      
      case 'companyAddress':
        if (value && value.trim().length < 5) return 'Please enter a complete address'
        return undefined
      
      case 'companyCity':
        if (value && !/^[a-zA-Z\s]+$/.test(value)) return 'City name can only contain letters and spaces'
        return undefined
      
      case 'companyPostalCode':
        if (value && !/^\d{4}[A-Z]{2}$/.test(value.replace(/\s/g, ''))) {
          return 'Dutch postal code format: 1234AB'
        }
        return undefined
      
      case 'kvkNumber':
        if (value && !/^\d{8}$/.test(value.replace(/\s/g, ''))) {
          return 'KvK number must be 8 digits'
        }
        return undefined
      
      default:
        return undefined
    }
  }

  const validateAllFields = (): boolean => {
    const errors: ValidationErrors = {}
    let isValid = true

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData])
      if (error) {
        errors[key as keyof ValidationErrors] = error
        isValid = false
      }
    })

    setValidationErrors(errors)
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Real-time validation for touched fields
    if (fieldTouched[name]) {
      const error = validateField(name, value)
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }

    if (debugMode) {
      addDebugInfo(`Field Updated`, `${name}: "${value}"`, 'info')
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    setFieldTouched(prev => ({
      ...prev,
      [name]: true
    }))

    const error = validateField(name, value)
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    if (debugMode) {
      addDebugInfo('Form Submission', 'Starting registration process...', 'info')
    }

    // Validate all fields
    if (!validateAllFields()) {
      setError("Please fix the validation errors above")
      setIsLoading(false)
      if (debugMode) {
        addDebugInfo('Validation Failed', 'Form contains validation errors', 'error')
      }
      return
    }

    if (debugMode) {
      addDebugInfo('Validation Passed', 'All fields validated successfully', 'success')
    }

    try {
      if (debugMode) {
        addDebugInfo('API Request', 'Sending registration data to /api/auth/register', 'info')
      }

      const requestBody = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        companyName: formData.companyName.trim(),
        companyAddress: formData.companyAddress.trim(),
        companyCity: formData.companyCity.trim(),
        companyPostalCode: formData.companyPostalCode.replace(/\s/g, '').toUpperCase(),
        kvkNumber: formData.kvkNumber.replace(/\s/g, '')
      }

      if (debugMode) {
        addDebugInfo('Request Body', JSON.stringify(requestBody, null, 2), 'info')
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      })

      if (debugMode) {
        addDebugInfo('API Response', `Status: ${response.status} ${response.statusText}`, 
          response.ok ? 'success' : 'error')
      }

      const data = await response.json()

      if (debugMode) {
        addDebugInfo('Response Data', JSON.stringify(data, null, 2), 
          response.ok ? 'success' : 'error')
      }

      if (response.ok) {
        setIsSuccess(true)
        if (debugMode) {
          addDebugInfo('Registration Success', 'Account created successfully!', 'success')
        }
      } else {
        const errorMessage = data.error || `Registration failed (${response.status})`
        setError(errorMessage)
        if (debugMode) {
          addDebugInfo('Registration Failed', errorMessage, 'error')
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Network error occurred"
      setError(`Connection error: ${errorMessage}`)
      if (debugMode) {
        addDebugInfo('Network Error', errorMessage, 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getFieldClassName = (fieldName: string) => {
    const baseClass = "appearance-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm"
    const hasError = validationErrors[fieldName as keyof ValidationErrors]
    
    if (hasError) {
      return `${baseClass} border-red-300 focus:ring-red-500 focus:border-red-500`
    }
    
    const hasValue = formData[fieldName as keyof typeof formData]
    if (hasValue && fieldTouched[fieldName]) {
      return `${baseClass} border-green-300 focus:ring-green-500 focus:border-green-500`
    }
    
    return `${baseClass} border-gray-300 focus:ring-blue-500 focus:border-blue-500`
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Registration Successful! 🎉
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Welcome to SalarySync! Your account has been created.
            </p>
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next:</h3>
              <div className="text-left space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">✓</div>
                  <div>
                    <p className="font-medium text-gray-900">14-Day Free Trial Started</p>
                    <p className="text-sm text-gray-600">Full access to all payroll features</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">1</div>
                  <div>
                    <p className="font-medium text-gray-900">Check Your Email</p>
                    <p className="text-sm text-gray-600">Verification link sent to {formData.email}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">2</div>
                  <div>
                    <p className="font-medium text-gray-900">Sign In & Start Using</p>
                    <p className="text-sm text-gray-600">Access your dashboard immediately</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <Link
                href="/auth/signin"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sign In to Your Account
              </Link>
              <button
                onClick={() => setIsSuccess(false)}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Register Another Account
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">SalarySync</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Professional Dutch Payroll Management
          </p>
          
          {/* Debug Toggle */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setDebugMode(!debugMode)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              {debugMode ? 'Hide' : 'Show'} Debug Info
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className={getFieldClassName('name')}
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validationErrors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className={getFieldClassName('email')}
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validationErrors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className={getFieldClassName('password')}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {showPassword ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          )}
                        </svg>
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validationErrors.password}
                      </p>
                    )}
                    <div className="mt-1 text-xs text-gray-500">
                      Password must contain: uppercase, lowercase, number (min 6 chars)
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className={getFieldClassName('confirmPassword')}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {validationErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validationErrors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  Company Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      required
                      className={getFieldClassName('companyName')}
                      placeholder="Enter your company name"
                      value={formData.companyName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {validationErrors.companyName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validationErrors.companyName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Address
                    </label>
                    <input
                      id="companyAddress"
                      name="companyAddress"
                      type="text"
                      className={getFieldClassName('companyAddress')}
                      placeholder="Street address"
                      value={formData.companyAddress}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {validationErrors.companyAddress && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validationErrors.companyAddress}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="companyCity" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        id="companyCity"
                        name="companyCity"
                        type="text"
                        className={getFieldClassName('companyCity')}
                        placeholder="City"
                        value={formData.companyCity}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {validationErrors.companyCity && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {validationErrors.companyCity}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="companyPostalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        id="companyPostalCode"
                        name="companyPostalCode"
                        type="text"
                        className={getFieldClassName('companyPostalCode')}
                        placeholder="1234AB"
                        value={formData.companyPostalCode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {validationErrors.companyPostalCode && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {validationErrors.companyPostalCode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="kvkNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      KvK Number (Optional)
                    </label>
                    <input
                      id="kvkNumber"
                      name="kvkNumber"
                      type="text"
                      className={getFieldClassName('kvkNumber')}
                      placeholder="12345678"
                      value={formData.kvkNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {validationErrors.kvkNumber && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validationErrors.kvkNumber}
                      </p>
                    )}
                    <div className="mt-1 text-xs text-gray-500">
                      8-digit Chamber of Commerce number
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Registration Error</h3>
                      <div className="mt-2 text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      Create Account
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Sign in
                  </Link>
                </span>
              </div>
            </form>
          </div>

          {/* Debug Panel */}
          {debugMode && (
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-lg shadow p-4 text-white sticky top-4">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Debug Console
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {debugInfo.length === 0 ? (
                    <p className="text-gray-400 text-sm">No debug information yet...</p>
                  ) : (
                    debugInfo.map((info, index) => (
                      <div key={index} className={`text-xs p-2 rounded border-l-2 ${
                        info.status === 'success' ? 'bg-green-900 border-green-500' :
                        info.status === 'error' ? 'bg-red-900 border-red-500' :
                        info.status === 'warning' ? 'bg-yellow-900 border-yellow-500' :
                        'bg-gray-800 border-gray-500'
                      }`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium">{info.step}</span>
                          <span className="text-gray-400">{info.timestamp}</span>
                        </div>
                        <pre className="whitespace-pre-wrap text-gray-300">{info.details}</pre>
                      </div>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setDebugInfo([])}
                  className="mt-4 w-full text-xs py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  Clear Debug Log
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

