"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info } from "lucide-react"
import { useDailyBackground } from "@/hooks/useDynamicBackground"

function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { backgroundStyle, isLoading: backgroundLoading } = useDailyBackground()

  useEffect(() => {
    // Check for URL parameters for messages
    const errorParam = searchParams.get('error')
    const messageParam = searchParams.get('message')
    const emailParam = searchParams.get('email')
    const autoReauth = searchParams.get('auto-reauth') === 'true'
    const companyId = searchParams.get('company-id')
    const companyName = searchParams.get('company-name')

    // Pre-fill email if provided in URL (from re-authentication flow)
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
      
      if (autoReauth) {
        setMessage(`Please sign in to complete your company setup for "${decodeURIComponent(companyName || 'your company')}".`)
      } else {
        setMessage("Please sign in to complete the session refresh.")
      }
    }

    if (errorParam === 'invalid-token') {
      setError("Invalid or expired verification link. Please request a new one.")
    } else if (errorParam === 'verification-failed') {
      setError("Email verification failed. Please try again.")
    } else if (errorParam === 'reauth-failed') {
      setError("Automatic re-authentication failed. Please sign in manually.")
    } else if (messageParam === 'already-verified') {
      setMessage("Your email is already verified. You can sign in below.")
    } else if (messageParam === 'company-created') {
      setMessage("Your company has been created! Please sign in to access your dashboard.")
    } else if (messageParam === 'session-refresh-failed') {
      setMessage("Session refresh failed. Please sign in again.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        if (result.error.includes("verify your email")) {
          setError("Please verify your email before signing in.")
          // Show link to resend verification
          setTimeout(() => {
            router.push("/auth/unverified")
          }, 2000)
        } else {
          setError("Invalid email or password")
        }
      } else {
        // Get the session to check user role
        const session = await getSession()
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={backgroundStyle}
    >

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <div>
            <div className="mx-auto flex justify-center mb-6">
              <img 
                src="/salarysync-logo.png" 
                alt="SalarySync" 
                className="h-16 w-auto"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {message && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  {error.includes("verify your email") && (
                    <div className="mt-2">
                      <Link href="/auth/unverified" className="text-sm underline">
                        Resend verification email
                      </Link>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Sign in
              </button>
            </div>

            <div className="text-center space-y-2">
              <div>
                <Link href="/auth/reset" className="text-sm text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </Link>
              </div>
              <div>
                <span className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign up
                  </Link>
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}

