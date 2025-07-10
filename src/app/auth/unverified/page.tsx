"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export default function UnverifiedPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSuccess(true)
      } else {
        setError(data.error || "Failed to send verification email")
      }
    } catch (error) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">SalarySync</h1>
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verification Email Sent</h2>
            <p className="mt-2 text-sm text-gray-600">
              Check your email for the verification link
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Email Sent Successfully</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    We've sent a new verification link to <strong>{email}</strong>
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-blue-900">Check Your Email</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Click the verification link in your email to activate your account and start using SalarySync.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link href="/auth/signin">
                    <Button className="w-full">
                      Back to Sign In
                    </Button>
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsSuccess(false)
                      setEmail("")
                    }}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Send to Different Email
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">SalarySync</h1>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Email Verification Required</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please verify your email address to continue
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900">Account Not Verified</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Your account needs to be verified before you can access SalarySync. 
                  Check your email for a verification link, or request a new one below.
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-amber-900">Didn't receive the email?</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Check your spam folder or request a new verification email below.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleResendVerification} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="mt-1"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend Verification Email"
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Link
                  href="/auth/signin"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

