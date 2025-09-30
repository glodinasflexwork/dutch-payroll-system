"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Check, X } from "lucide-react"

interface PersonalInfo {
  name: string
  email: string
  password: string
}

interface CompanyInfo {
  companyName: string
  kvkNumber: string
  industry: string
  businessAddress: string
  city: string
  postalCode: string
}

interface ValidationErrors {
  [key: string]: string
}

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

export default function SignUpImproved() {
  const [currentStep, setCurrentStep] = useState(1)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    email: "",
    password: ""
  })
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: "",
    kvkNumber: "",
    industry: "",
    businessAddress: "",
    city: "",
    postalCode: ""
  })
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const router = useRouter()

  const industries = [
    "Technology",
    "Healthcare", 
    "Finance",
    "Education",
    "Manufacturing",
    "Retail",
    "Construction",
    "Hospitality",
    "Transportation",
    "Other"
  ]

  const passwordRequirements: PasswordRequirement[] = [
    { label: "At least 8 characters", test: (pwd) => pwd.length >= 8 },
    { label: "One uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
    { label: "One lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
    { label: "One number", test: (pwd) => /\d/.test(pwd) },
    { label: "One special character", test: (pwd) => /[!@#$%^&*(),.?\":{}|<>]/.test(pwd) }
  ]

  // Auto-focus first field when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstInput = document.querySelector('input:not([type="hidden"])') as HTMLInputElement
      if (firstInput) {
        firstInput.focus()
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [currentStep])

  const validatePersonalInfo = (): boolean => {
    const errors: ValidationErrors = {}

    if (!personalInfo.name.trim()) {
      errors.name = "Full name is required"
    }

    if (!personalInfo.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!personalInfo.password) {
      errors.password = "Password is required"
    } else {
      const failedRequirements = passwordRequirements.filter(req => !req.test(personalInfo.password))
      if (failedRequirements.length > 0) {
        errors.password = "Password does not meet all requirements"
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateCompanyInfo = (): boolean => {
    const errors: ValidationErrors = {}

    if (!companyInfo.companyName.trim()) {
      errors.companyName = "Company name is required"
    }

    if (!companyInfo.kvkNumber.trim()) {
      errors.kvkNumber = "KvK number is required"
    } else if (!/^\d{8}$/.test(companyInfo.kvkNumber)) {
      errors.kvkNumber = "KvK number must be exactly 8 digits"
    }

    if (!companyInfo.industry) {
      errors.industry = "Please select an industry"
    }

    if (!companyInfo.businessAddress.trim()) {
      errors.businessAddress = "Business address is required"
    }

    if (!companyInfo.city.trim()) {
      errors.city = "City is required"
    }

    if (!companyInfo.postalCode.trim()) {
      errors.postalCode = "Postal code is required"
    } else if (!/^\d{4}\s?[A-Z]{2}$/i.test(companyInfo.postalCode)) {
      errors.postalCode = "Please enter a valid Dutch postal code (e.g., 1234 AB)"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNextStep = () => {
    if (currentStep === 1 && validatePersonalInfo()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateCompanyInfo()) {
      setCurrentStep(3)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGoogleSignUp = () => {
    // Implement Google OAuth signup
    window.location.href = "/api/auth/google"
  }

  const handleSubmit = async () => {
    if (!validatePersonalInfo() || !validateCompanyInfo()) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          // Personal info
          name: personalInfo.name.trim(),
          email: personalInfo.email.trim().toLowerCase(),
          password: personalInfo.password,
          // Company info
          companyName: companyInfo.companyName.trim(),
          kvkNumber: companyInfo.kvkNumber.trim(),
          industry: companyInfo.industry,
          businessAddress: companyInfo.businessAddress.trim(),
          city: companyInfo.city.trim(),
          postalCode: companyInfo.postalCode.trim().toUpperCase()
        })
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
      } else {
        setError(data.error || "Registration failed. Please try again.")
      }
    } catch (error) {
      setError("Network error occurred. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Registration Successful!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a verification email to your inbox.
            </p>
            
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-center mb-4">
                <svg className="h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"></path>
                </svg>
              </div>
              <p className="text-center text-gray-700 mb-4">
                Check your email and click the verification link to activate both your account and company.
              </p>
              <p className="text-center font-medium text-gray-900">
                {personalInfo.email}
              </p>
            </div>

            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Helpful tips</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Check your spam folder</li>
                <li>• <button className="underline hover:no-underline">Resend email</button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/salarysync-logo.png" 
              alt="SalarySync" 
              className="h-12 w-auto"
            />
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account & company
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Professional Dutch Payroll Management
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 transition-colors ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-center">
          <div className="flex space-x-8 text-sm text-gray-600">
            <span className={`transition-colors ${currentStep === 1 ? 'font-medium text-blue-600' : ''}`}>
              Personal Info
            </span>
            <span className={`transition-colors ${currentStep === 2 ? 'font-medium text-blue-600' : ''}`}>
              Company Info
            </span>
            <span className={`transition-colors ${currentStep === 3 ? 'font-medium text-blue-600' : ''}`}>
              Review & Submit
            </span>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow p-8">
          {currentStep === 1 && (
            <PersonalInfoStep
              data={personalInfo}
              onChange={setPersonalInfo}
              errors={validationErrors}
              onNext={handleNextStep}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              passwordFocused={passwordFocused}
              setPasswordFocused={setPasswordFocused}
              passwordRequirements={passwordRequirements}
              onGoogleSignUp={handleGoogleSignUp}
            />
          )}
          
          {currentStep === 2 && (
            <CompanyInfoStep
              data={companyInfo}
              onChange={setCompanyInfo}
              errors={validationErrors}
              industries={industries}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
            />
          )}
          
          {currentStep === 3 && (
            <ReviewStep
              personalInfo={personalInfo}
              companyInfo={companyInfo}
              onSubmit={handleSubmit}
              onPrev={handlePrevStep}
              isLoading={isLoading}
              error={error}
            />
          )}
        </div>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// Personal Info Step Component
function PersonalInfoStep({ 
  data, 
  onChange, 
  errors, 
  onNext,
  showPassword,
  setShowPassword,
  passwordFocused,
  setPasswordFocused,
  passwordRequirements,
  onGoogleSignUp
}: {
  data: PersonalInfo
  onChange: (data: PersonalInfo) => void
  errors: ValidationErrors
  onNext: () => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  passwordFocused: boolean
  setPasswordFocused: (focused: boolean) => void
  passwordRequirements: PasswordRequirement[]
  onGoogleSignUp: () => void
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onChange({ ...data, [name]: value })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900">Step 1 of 3: Personal Information</h2>
        <p className="mt-1 text-sm text-gray-600">Tell us about yourself</p>
      </div>

      {/* Google Sign Up Button */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={onGoogleSignUp}
          className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            autoComplete="name"
            value={data.name}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="Enter your full name"
            aria-invalid={errors.name ? 'true' : 'false'}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            value={data.email}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="Enter your email address"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              autoComplete="new-password"
              value={data.password}
              onChange={handleChange}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Create a secure password"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby="password-requirements"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          
          {/* Password Requirements */}
          {(passwordFocused || data.password) && (
            <div id="password-requirements" className="mt-2 p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-2">Password must contain:</p>
              <ul className="space-y-1">
                {passwordRequirements.map((requirement, index) => {
                  const isValid = requirement.test(data.password)
                  return (
                    <li key={index} className="flex items-center text-sm">
                      {isValid ? (
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                      ) : (
                        <X className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      <span className={isValid ? 'text-green-700' : 'text-gray-600'}>
                        {requirement.label}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          
          {errors.password && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.password}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Continue to Company Info
        </button>
      </div>
    </div>
  )
}

// Company Info Step Component (Enhanced with autocomplete)
function CompanyInfoStep({ 
  data, 
  onChange, 
  errors, 
  industries, 
  onNext, 
  onPrev 
}: {
  data: CompanyInfo
  onChange: (data: CompanyInfo) => void
  errors: ValidationErrors
  industries: string[]
  onNext: () => void
  onPrev: () => void
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    onChange({ ...data, [name]: value })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900">Step 2 of 3: Company Information</h2>
        <p className="mt-1 text-sm text-gray-600">Tell us about your company</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
          <input
            type="text"
            name="companyName"
            id="companyName"
            autoComplete="organization"
            value={data.companyName}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.companyName ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="Enter your company name"
            aria-invalid={errors.companyName ? 'true' : 'false'}
            aria-describedby={errors.companyName ? 'company-name-error' : undefined}
          />
          {errors.companyName && (
            <p id="company-name-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.companyName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="kvkNumber" className="block text-sm font-medium text-gray-700">
            KvK Number
          </label>
          <input
            type="text"
            name="kvkNumber"
            id="kvkNumber"
            value={data.kvkNumber}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.kvkNumber ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="12345678"
            maxLength={8}
            pattern="[0-9]{8}"
            aria-invalid={errors.kvkNumber ? 'true' : 'false'}
            aria-describedby={errors.kvkNumber ? 'kvk-error' : undefined}
          />
          {errors.kvkNumber && (
            <p id="kvk-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.kvkNumber}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
            Industry
          </label>
          <select
            name="industry"
            id="industry"
            value={data.industry}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.industry ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            aria-invalid={errors.industry ? 'true' : 'false'}
            aria-describedby={errors.industry ? 'industry-error' : undefined}
          >
            <option value="">Select Industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          {errors.industry && (
            <p id="industry-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.industry}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
            Business Address
          </label>
          <input
            type="text"
            name="businessAddress"
            id="businessAddress"
            autoComplete="street-address"
            value={data.businessAddress}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.businessAddress ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="Enter your business address"
            aria-invalid={errors.businessAddress ? 'true' : 'false'}
            aria-describedby={errors.businessAddress ? 'address-error' : undefined}
          />
          {errors.businessAddress && (
            <p id="address-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.businessAddress}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              name="city"
              id="city"
              autoComplete="address-level2"
              value={data.city}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.city ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Enter city"
              aria-invalid={errors.city ? 'true' : 'false'}
              aria-describedby={errors.city ? 'city-error' : undefined}
            />
            {errors.city && (
              <p id="city-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.city}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              id="postalCode"
              autoComplete="postal-code"
              value={data.postalCode}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.postalCode ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="1234 AB"
              aria-invalid={errors.postalCode ? 'true' : 'false'}
              aria-describedby={errors.postalCode ? 'postal-error' : undefined}
            />
            {errors.postalCode && (
              <p id="postal-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.postalCode}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Back to Personal Info
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Continue to Review
        </button>
      </div>
    </div>
  )
}

// Review Step Component (unchanged but with better accessibility)
function ReviewStep({ 
  personalInfo, 
  companyInfo, 
  onSubmit, 
  onPrev, 
  isLoading, 
  error 
}: {
  personalInfo: PersonalInfo
  companyInfo: CompanyInfo
  onSubmit: () => void
  onPrev: () => void
  isLoading: boolean
  error: string
}) {
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleSubmit = () => {
    if (termsAccepted) {
      onSubmit()
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900">Step 3 of 3: Review & Submit</h2>
        <p className="mt-1 text-sm text-gray-600">Please review your information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Personal Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Full Name:</span> {personalInfo.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {personalInfo.email}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Company Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Company:</span> {companyInfo.companyName}
            </div>
            <div>
              <span className="font-medium">KvK Number:</span> {companyInfo.kvkNumber}
            </div>
            <div>
              <span className="font-medium">Industry:</span> {companyInfo.industry}
            </div>
            <div>
              <span className="font-medium">Address:</span> {companyInfo.businessAddress}
            </div>
            <div>
              <span className="font-medium">City:</span> {companyInfo.city}, {companyInfo.postalCode}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
            required
          />
          <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
            I agree to the{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500 underline">
              Terms & Conditions
            </a>{" "}
            and acknowledge the{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500 underline">
              Privacy Policy
            </a>
            .
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4" role="alert">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          disabled={isLoading}
        >
          Back to Company Info
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !termsAccepted}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Creating Account..." : "Create Account & Company"}
        </button>
      </div>
    </div>
  )
}
