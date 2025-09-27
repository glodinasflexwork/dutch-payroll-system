"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Building2, ArrowLeft, Check, AlertCircle, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { validateTaxNumbers, formatRSIN, formatLoonheffingennummer } from "@/lib/tax-validation"

interface FormData {
  companyName: string
  kvkNumber: string
  industry: string
  address: string
  city: string
  postalCode: string
  rsin: string
  loonheffingennummer: string
}

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Construction",
  "Transportation",
  "Hospitality",
  "Professional Services",
  "Other"
]

export default function AddCompanyPage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    kvkNumber: "",
    industry: "",
    address: "",
    city: "",
    postalCode: "",
    rsin: "",
    loonheffingennummer: ""
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleKvKLookup = async (kvkNumber: string) => {
    // Only lookup if we have a valid 8-digit KvK number
    if (!/^\d{8}$/.test(kvkNumber.replace(/\s/g, ''))) {
      return
    }

    setIsLookingUp(true)
    setError("")

    try {
      const response = await fetch(`/api/kvk/lookup?kvkNumber=${kvkNumber.replace(/\s/g, '')}`)
      const data = await response.json()

      if (response.ok && data.success && data.company) {
        // Auto-fill form with company data
        setFormData(prev => ({
          ...prev,
          companyName: data.company.name,
          address: data.company.address,
          city: data.company.city,
          postalCode: data.company.postalCode,
          // Map industry if available, otherwise keep current selection
          industry: prev.industry || (data.company.industry ? 
            industries.find(ind => ind.toLowerCase().includes(data.company.industry.toLowerCase())) || "Other" 
            : "")
        }))
      } else if (response.status === 404) {
        // Company not found - this is okay, user can still fill manually
        console.log("Company not found in KvK database")
      } else {
        console.error("KvK lookup failed:", data.error)
      }
    } catch (error) {
      console.error("KvK lookup error:", error)
    } finally {
      setIsLookingUp(false)
    }
  }

  const handleKvKChange = (value: string) => {
    // Format KvK number as user types (add spaces for readability)
    const cleaned = value.replace(/\D/g, '')
    const formatted = cleaned.replace(/(\d{4})(\d{4})/, '$1 $2')
    
    handleInputChange('kvkNumber', formatted)
    
    // Trigger lookup when we have 8 digits
    if (cleaned.length === 8) {
      handleKvKLookup(cleaned)
    }
  }

  const validateForm = (): boolean => {
    if (!formData.companyName.trim()) {
      setError("Company name is required")
      return false
    }
    if (!formData.industry) {
      setError("Please select an industry")
      return false
    }
    if (formData.kvkNumber && !/^\d{8}$/.test(formData.kvkNumber.replace(/\s/g, ''))) {
      setError("KvK number must be 8 digits")
      return false
    }
    if (formData.postalCode && !/^\d{4}[A-Z]{2}$/.test(formData.postalCode.replace(/\s/g, ''))) {
      setError("Postal code format: 1234AB")
      return false
    }
    
    // Validate tax numbers if provided
    const taxValidation = validateTaxNumbers(formData.rsin, formData.loonheffingennummer)
    if (!taxValidation.isValid) {
      if (formData.rsin && !taxValidation.rsin.isValid) {
        setError(`RSIN: ${taxValidation.rsin.error}`)
        return false
      }
      if (formData.loonheffingennummer && !taxValidation.loonheffingennummer.isValid) {
        setError(`Loonheffingennummer: ${taxValidation.loonheffingennummer.error}`)
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setError("")
    
    try {
      const response = await fetch("/api/companies/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.companyName.trim(),
          kvkNumber: formData.kvkNumber.replace(/\s/g, ''),
          industry: formData.industry,
          address: formData.address.trim(),
          city: formData.city.trim(),
          postalCode: formData.postalCode.replace(/\s/g, '').toUpperCase(),
          rsin: formData.rsin.replace(/\s/g, ''),
          loonheffingennummer: formData.loonheffingennummer.replace(/\s/g, '').toUpperCase()
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Wait a moment to show success, then redirect
        setTimeout(() => {
          router.push('/dashboard')
          // Trigger a page refresh to update the company selector
          window.location.reload()
        }, 1500)
      } else {
        setError(data.error || "Failed to create company")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Company Created!</h2>
              <p className="text-gray-600 mb-4">
                {formData.companyName} has been successfully added to your account.
              </p>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Company</h1>
              <p className="text-gray-600">Create an additional company in your account</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Enter the details for your new company. Required fields are marked with an asterisk.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>

              {/* Industry */}
              <div className="space-y-2">
                <Label htmlFor="industry">
                  Industry <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* KvK Number */}
              <div className="space-y-2">
                <Label htmlFor="kvkNumber">KvK Number (Optional)</Label>
                <div className="relative">
                  <Input
                    id="kvkNumber"
                    value={formData.kvkNumber}
                    onChange={(e) => handleKvKChange(e.target.value)}
                    placeholder="1234 5678"
                    maxLength={9} // 8 digits + 1 space
                    disabled={isLookingUp}
                  />
                  {isLookingUp && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  8-digit Chamber of Commerce number. Company details will be automatically filled when found.
                </p>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Business Address (Optional)</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street name and number"
                />
              </div>

              {/* City and Postal Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City (Optional)</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Amsterdam"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code (Optional)</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="1000AB"
                    maxLength={6}
                  />
                </div>
              </div>

              {/* Tax Numbers Section */}
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium">Tax Information</h3>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">
                  These numbers are required for payroll processing. They will be verified manually by our team.
                </p>

                {/* RSIN */}
                <div className="space-y-2">
                  <Label htmlFor="rsin">RSIN (Optional)</Label>
                  <Input
                    id="rsin"
                    value={formData.rsin}
                    onChange={(e) => {
                      const formatted = formatRSIN(e.target.value)
                      handleInputChange('rsin', formatted)
                    }}
                    placeholder="1234 5678"
                    maxLength={9} // 8 digits + 1 space
                  />
                  <p className="text-sm text-gray-500">
                    Rechtspersonen en Samenwerkingsverbanden Informatienummer (8 digits)
                  </p>
                </div>

                {/* Loonheffingennummer */}
                <div className="space-y-2">
                  <Label htmlFor="loonheffingennummer">Loonheffingennummer (Optional)</Label>
                  <Input
                    id="loonheffingennummer"
                    value={formData.loonheffingennummer}
                    onChange={(e) => {
                      const formatted = formatLoonheffingennummer(e.target.value)
                      handleInputChange('loonheffingennummer', formatted)
                    }}
                    placeholder="123 456 789L01"
                    maxLength={14} // 9 digits + L + 2 digits + spaces
                  />
                  <p className="text-sm text-gray-500">
                    Payroll Tax Number (format: 123456789L01)
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? "Creating..." : "Create Company"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

