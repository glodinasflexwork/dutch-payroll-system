"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface PersonalInfo {
  name: string
  email: string
  password: string
  confirmPassword: string
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

export default function SignUp() {
  const [currentStep, setCurrentStep] = useState(1)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
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

  const validatePersonalInfo = (): boolean => {
    const errors: ValidationErrors = {}

    if (!personalInfo.name.trim()) {
      errors.name = "Full name is required"
    }

    if (!personalInfo.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) {
      errors.email = "Invalid email format"
    }

    if (!personalInfo.password) {
      errors.password = "Password is required"
    } else if (personalInfo.password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(personalInfo.password)) {
      errors.password = "Password must contain uppercase, lowercase, and number"
    }

    if (personalInfo.password !== personalInfo.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
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
      errors.kvkNumber = "KvK number must be 8 digits"
    }

    if (!companyInfo.industry) {
      errors.industry = "Industry is required"
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
      errors.postalCode = "Invalid Dutch postal code format (e.g., 1234 AB)"
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
        setError(data.error || "Registration failed")
      }
    } catch (error) {
      setError("Network error occurred")
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
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
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
            Create your account & company
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Professional Dutch Payroll Management
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
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
            <span className={currentStep === 1 ? 'font-medium text-blue-600' : ''}>
              Personal Info
            </span>
            <span className={currentStep === 2 ? 'font-medium text-blue-600' : ''}>
              Company Info
            </span>
            <span className={currentStep === 3 ? 'font-medium text-blue-600' : ''}>
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
            <Link href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
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
  onNext 
}: {
  data: PersonalInfo
  onChange: (data: PersonalInfo) => void
  errors: ValidationErrors
  onNext: () => void
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onChange({ ...data, [name]: value })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Step 1 of 3: Personal Information</h3>
        <p className="mt-1 text-sm text-gray-600">Tell us about yourself</p>
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
            value={data.name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Full Name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={data.email}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Email Address"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            value={data.password}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Password"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            value={data.confirmPassword}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Confirm Password"
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Continue to Company Info
        </button>
      </div>
    </div>
  )
}

// Company Info Step Component
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
        <h3 className="text-lg font-medium text-gray-900">Step 2 of 3: Company Information</h3>
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
            value={data.companyName}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="12345678"
          />
          {errors.kvkNumber && <p className="mt-1 text-sm text-red-600">{errors.kvkNumber}</p>}
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          {errors.industry && <p className="mt-1 text-sm text-red-600">{errors.industry}</p>}
        </div>

        <div>
          <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
            Business Address
          </label>
          <input
            type="text"
            name="businessAddress"
            id="businessAddress"
            value={data.businessAddress}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.businessAddress && <p className="mt-1 text-sm text-red-600">{errors.businessAddress}</p>}
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
              value={data.city}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
              Postal Code
            </label>
            <input
              type="text"
              name="postalCode"
              id="postalCode"
              value={data.postalCode}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="1234 AB"
            />
            {errors.postalCode && <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Back to Personal Info
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Continue to Review
        </button>
      </div>
    </div>
  )
}

// Review Step Component
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
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Step 3 of 3: Review & Submit</h3>
        <p className="mt-1 text-sm text-gray-600">Please review your information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
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
          <h4 className="font-medium text-gray-900 mb-3">Company Information</h4>
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
        <div className="flex items-center">
          <input
            type="checkbox"
            id="terms"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
            I agree to the{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Terms & Conditions
            </a>{" "}
            and acknowledge the{" "}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
            .
          </label>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
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
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          Back to Company Info
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating Account..." : "Create Account & Company"}
        </button>
      </div>
    </div>
  )
}
