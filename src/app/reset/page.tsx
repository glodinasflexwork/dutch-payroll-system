'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle, CheckCircle, RefreshCw, Lock } from 'lucide-react'

export default function ResetPage() {
  const [formData, setFormData] = useState({
    email: 'cihatkaya@glodinas.nl',
    password: '',
    name: 'Cihat Kaya',
    companyName: 'Glodinas Finance B.V.'
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (error) setError(null)
  }

  const handleReset = async () => {
    if (!formData.email || !formData.password || !formData.name || !formData.companyName) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSuccess(true)
        setTimeout(() => {
          window.location.href = '/auth/signin'
        }, 3000)
      } else {
        setError(result.error || 'Reset failed')
      }
    } catch (error) {
      console.error('Reset error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Reset Successful!</h1>
            <p className="text-gray-600">
              Your account has been restored successfully. You can now sign in with your original credentials.
            </p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">
              ✅ User account recreated<br/>
              ✅ Company information restored<br/>
              ✅ Tax settings configured<br/>
              ✅ Ready to use!
            </p>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Redirecting to sign in page in 3 seconds...
          </p>
          
          <Button 
            onClick={() => window.location.href = '/auth/signin'}
            className="w-full"
          >
            Go to Sign In
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Account</h1>
          <p className="text-gray-600">
            Restore your account after database changes
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your.email@company.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Your full name"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <Input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="Your company name"
              disabled={loading}
            />
          </div>
        </div>

        <Button
          onClick={handleReset}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Resetting Account...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Reset Account</span>
            </>
          )}
        </Button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This will recreate your account with fresh data
          </p>
        </div>

        <div className="mt-4 text-center">
          <a 
            href="/auth/signin" 
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Back to Sign In
          </a>
        </div>
      </Card>
    </div>
  )
}

