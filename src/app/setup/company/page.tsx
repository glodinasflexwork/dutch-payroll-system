"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ValidationErrors {
  companyName?: string
  companyAddress?: string
  companyCity?: string
  companyPostalCode?: string
  kvkNumber?: string
  industry?: string
}

interface DebugInfo {
  step: string
  timestamp: string
  details: string
  status: 'info' | 'success' | 'error' | 'warning'
}

interface KvKCompany {
  name: string
  address: string
  city: string
  postalCode: string
  kvkNumber: string
  status: string
}

export default function CompanySetup() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    companyCity: "",
    companyPostalCode: "",
    kvkNumber: "",
    industry: "",
    isDGA: false
  })
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([])
  const [fieldTouched, setFieldTouched] = useState<{[key: string]: boolean}>({})
  const [kvkLoading, setKvkLoading] = useState(false)
  const [kvkSearchResults, setKvkSearchResults] = useState<KvKCompany[]>([])
  const [showKvkResults, setShowKvkResults] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Check if user already has a company
  useEffect(() => {
    const checkUserCompanyStatus = async () => {
      if (!session?.user?.email) return
      
      try {
        const response = await fetch('/api/user/company-status')
        const data = await response.json()
        
        if (debugMode) {
          addDebugInfo('Company Status Check', JSON.stringify(data, null, 2), 'info')
        }
        
        // Multi-company logic:
        // - 0 companies: Stay on setup page (first company creation)
        // - 1+ companies: Redirect to dashboard (existing user with companies)
        if (data.hasCompany && data.companies.length > 0) {
          if (debugMode) {
            addDebugInfo('Redirect', `User has ${data.companies.length} company(ies). Redirecting to dashboard.`, 'info')
          }
          // Add company info to URL for dashboard to know which company to show
          const primaryCompanyId = data.primaryCompany?.id
          router.push(`/dashboard?company=${primaryCompanyId}`)
        } else {
          if (debugMode) {
            addDebugInfo('First Company Setup', 'User has no companies. Showing setup form for first company.', 'info')
          }
        }
      } catch (error) {
        console.error('Error checking company status:', error)
        if (debugMode) {
          addDebugInfo('Company Status Error', error.message, 'error')
        }
      }
    }
    
    if (session?.user) {
      checkUserCompanyStatus()
    }
  }, [session, router, debugMode])

  const addDebugInfo = (step: string, details: string, status: DebugInfo['status'] = 'info') => {
    const newDebugInfo: DebugInfo = {
      step,
      details,
      status,
      timestamp: new Date().toLocaleTimeString()
    }
    setDebugInfo(prev => [...prev, newDebugInfo])
  }

  // KvK API functions
  const lookupKvKNumber = async (kvkNumber: string) => {
    if (!kvkNumber || kvkNumber.length !== 8) return

    setKvkLoading(true)
    setShowKvkResults(false)
    
    if (debugMode) {
      addDebugInfo('KvK Lookup', `Looking up KvK number: ${kvkNumber}`, 'info')
    }

    try {
      const response = await fetch(`/api/kvk/lookup?kvkNumber=${kvkNumber}`)
      const data = await response.json()

      if (debugMode) {
        addDebugInfo('KvK API Response', JSON.stringify(data, null, 2), response.ok ? 'success' : 'error')
      }

      if (response.ok && data.company) {
        // Auto-fill company information
        setFormData(prev => ({
          ...prev,
          companyName: data.company.name || prev.companyName,
          companyAddress: data.company.address || prev.companyAddress,
          companyCity: data.company.city || prev.companyCity,
          companyPostalCode: data.company.postalCode || prev.companyPostalCode
        }))

        if (debugMode) {
          addDebugInfo('Auto-fill Success', 'Company information auto-filled from KvK', 'success')
        }
      } else {
        if (debugMode) {
          addDebugInfo('KvK Lookup Failed', data.error || 'Company not found', 'warning')
        }
      }
    } catch (error) {
      if (debugMode) {
        addDebugInfo('KvK API Error', error instanceof Error ? error.message : 'Network error', 'error')
      }
    } finally {
      setKvkLoading(false)
    }
  }

  const searchKvKByName = async (companyName: string) => {
    if (!companyName || companyName.length < 3) return

    setKvkLoading(true)
    
    if (debugMode) {
      addDebugInfo('KvK Search', `Searching for companies: ${companyName}`, 'info')
    }

    try {
      const response = await fetch(`/api/kvk/lookup?name=${encodeURIComponent(companyName)}&action=search`)
      const data = await response.json()

      if (debugMode) {
        addDebugInfo('KvK Search Response', JSON.stringify(data, null, 2), response.ok ? 'success' : 'error')
      }

      if (response.ok && data.companies) {
        setKvkSearchResults(data.companies)
        setShowKvkResults(true)
        
        if (debugMode) {
          addDebugInfo('Search Results', `Found ${data.companies.length} companies`, 'success')
        }
      } else {
        setKvkSearchResults([])
        setShowKvkResults(false)
        
        if (debugMode) {
          addDebugInfo('Search Failed', data.error || 'No companies found', 'warning')
        }
      }
    } catch (error) {
      setKvkSearchResults([])
      setShowKvkResults(false)
      
      if (debugMode) {
        addDebugInfo('Search Error', error instanceof Error ? error.message : 'Network error', 'error')
      }
    } finally {
      setKvkLoading(false)
    }
  }

  const selectKvKCompany = (company: KvKCompany) => {
    setFormData(prev => ({
      ...prev,
      companyName: company.name,
      companyAddress: company.address,
      companyCity: company.city,
      companyPostalCode: company.postalCode,
      kvkNumber: company.kvkNumber
    }))
    setShowKvkResults(false)
    
    if (debugMode) {
      addDebugInfo('Company Selected', `Selected: ${company.name}`, 'success')
    }
  }

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
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
      
      case 'industry':
        if (!value.trim()) return 'Industry selection is required'
        return undefined
      
      default:
        return undefined
    }
  }

  const validateAllFields = (): boolean => {
    const errors: ValidationErrors = {}
    let isValid = true

    // Required fields
    const requiredFields = ['companyName', 'industry']
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData] as string)
      if (error) {
        errors[field as keyof ValidationErrors] = error
        isValid = false
      }
    })

    // Optional fields validation
    Object.keys(formData).forEach(key => {
      if (!requiredFields.includes(key)) {
        const error = validateField(key, formData[key as keyof typeof formData] as string)
        if (error) {
          errors[key as keyof ValidationErrors] = error
          isValid = false
        }
      }
    })

    setValidationErrors(errors)
    return isValid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))

    // Always validate required fields, and validate touched optional fields
    const requiredFields = ['companyName', 'industry']
    if (requiredFields.includes(name) || fieldTouched[name]) {
      const error = validateField(name, value)
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }

    // KvK auto-lookup when KvK number is entered
    if (name === 'kvkNumber' && value.replace(/\s/g, '').length === 8) {
      const cleanKvkNumber = value.replace(/\s/g, '')
      lookupKvKNumber(cleanKvkNumber)
    }

    // KvK search when company name is typed (with debounce)
    if (name === 'companyName' && value.length >= 3) {
      // Clear previous timeout
      if ((window as any).kvkSearchTimeout) {
        clearTimeout((window as any).kvkSearchTimeout)
      }
      
      // Set new timeout for search
      ;(window as any).kvkSearchTimeout = setTimeout(() => {
        searchKvKByName(value)
      }, 1000) // 1 second debounce
    }

    if (debugMode) {
      addDebugInfo(`Field Updated`, `${name}: "${value}"`, 'info')
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      addDebugInfo('Form Submission', 'Starting company setup process...', 'info')
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
        addDebugInfo('API Request', 'Sending company setup data to /api/companies/create', 'info')
      }

      const requestBody = {
        name: formData.companyName.trim(),
        address: formData.companyAddress.trim(),
        city: formData.companyCity.trim(),
        postalCode: formData.companyPostalCode.replace(/\s/g, '').toUpperCase(),
        kvkNumber: formData.kvkNumber.replace(/\s/g, ''),
        industry: formData.industry,
        isDGA: formData.isDGA
      }

      if (debugMode) {
        addDebugInfo('Request Body', JSON.stringify(requestBody, null, 2), 'info')
      }

      const response = await fetch("/api/companies/create", {
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
          addDebugInfo('Company Setup Success', 'Company created successfully!', 'success')
        }
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        const errorMessage = data.error || `Company setup failed (${response.status})`
        setError(errorMessage)
        if (debugMode) {
          addDebugInfo('Company Setup Failed', errorMessage, 'error')
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Company Setup Complete! 🎉
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your company has been successfully configured.
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
                    <p className="font-medium text-gray-900">Add Your First Employee</p>
                    <p className="text-sm text-gray-600">Start building your team in the system</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">2</div>
                  <div>
                    <p className="font-medium text-gray-900">Process Your First Payroll</p>
                    <p className="text-sm text-gray-600">Calculate Dutch payroll with full compliance</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
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
            Set up your company
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Complete your company information to start using SalarySync
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
                      8-digit Chamber of Commerce number - auto-fills company details
                    </div>
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
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                      Industry *
                    </label>
                    <select
                      id="industry"
                      name="industry"
                      required
                      className={getFieldClassName('industry')}
                      value={formData.industry}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <option value="">Select your industry</option>
                      <option value="technology">Technology & Software</option>
                      <option value="healthcare">Healthcare & Medical</option>
                      <option value="finance">Finance & Banking</option>
                      <option value="retail">Retail & E-commerce</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="construction">Construction</option>
                      <option value="education">Education</option>
                      <option value="hospitality">Hospitality & Tourism</option>
                      <option value="consulting">Consulting & Professional Services</option>
                      <option value="logistics">Logistics & Transportation</option>
                      <option value="media">Media & Entertainment</option>
                      <option value="agriculture">Agriculture</option>
                      <option value="energy">Energy & Utilities</option>
                      <option value="nonprofit">Non-profit</option>
                      <option value="other">Other</option>
                    </select>
                    {validationErrors.industry && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {validationErrors.industry}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      id="isDGA"
                      name="isDGA"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.isDGA}
                      onChange={handleChange}
                    />
                    <label htmlFor="isDGA" className="ml-2 block text-sm text-gray-900">
                      I am a DGA (Director-major shareholder)
                    </label>
                  </div>
                  <div className="text-xs text-gray-500">
                    DGAs have specific payroll rules in the Netherlands. Check this if you own more than 5% of the company shares.
                  </div>
                </div>
              </div>

              {/* KvK Search Results */}
              {showKvkResults && kvkSearchResults.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    KvK Search Results
                  </h3>
                  <div className="space-y-2">
                    {kvkSearchResults.map((company, index) => (
                      <div
                        key={index}
                        className="p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50"
                        onClick={() => selectKvKCompany(company)}
                      >
                        <div className="font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">
                          {company.address}, {company.city} {company.postalCode}
                        </div>
                        <div className="text-sm text-gray-500">KvK: {company.kvkNumber}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Company Setup Error</h3>
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
                      Setting up company...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      Complete Company Setup
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <span className="text-sm text-gray-600">
                  Need help?{" "}
                  <Link href="/support" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Contact support
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

