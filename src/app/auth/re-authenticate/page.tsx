'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function ReAuthenticate() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'processing' | 'success' | 'error' | 'redirecting'>('processing')
  const [message, setMessage] = useState('Refreshing your session...')
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  useEffect(() => {
    const handleReAuthentication = async () => {
      try {
        const email = searchParams.get('email')
        const reason = searchParams.get('reason')
        const companyId = searchParams.get('company-id')

        addDebugInfo(`Re-authentication triggered: ${reason}`)
        addDebugInfo(`Email: ${email}`)
        addDebugInfo(`Company ID: ${companyId}`)

        if (!email) {
          throw new Error('Email parameter is required for re-authentication')
        }

        // Check if we have stored redirect information
        const storedCompanyId = sessionStorage.getItem('post-login-company-id')
        const storedRedirect = sessionStorage.getItem('post-login-redirect')
        
        addDebugInfo(`Stored company ID: ${storedCompanyId}`)
        addDebugInfo(`Stored redirect: ${storedRedirect}`)

        setMessage('Signing you back in with updated permissions...')

        // Wait a moment to ensure the signOut has completed
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Check current session status
        const currentSession = await getSession()
        addDebugInfo(`Current session: ${currentSession ? 'exists' : 'none'}`)

        if (currentSession) {
          // User is still signed in, force a session refresh
          addDebugInfo('User still signed in, forcing session refresh')
          setMessage('Refreshing session data...')
          
          // Force session refresh by calling the session endpoint
          const sessionResponse = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          })

          if (sessionResponse.ok) {
            addDebugInfo('Session refreshed successfully')
            setStatus('success')
            setMessage('Session updated successfully!')
            
            // Redirect to dashboard
            setTimeout(() => {
              setStatus('redirecting')
              setMessage('Redirecting to dashboard...')
              
              const targetCompanyId = companyId || storedCompanyId
              const redirectUrl = targetCompanyId 
                ? `/dashboard?company=${targetCompanyId}`
                : '/dashboard'
              
              addDebugInfo(`Redirecting to: ${redirectUrl}`)
              
              // Clean up session storage
              sessionStorage.removeItem('post-login-company-id')
              sessionStorage.removeItem('post-login-redirect')
              
              router.push(redirectUrl)
            }, 1500)
          } else {
            throw new Error('Failed to refresh session')
          }
        } else {
          // User is signed out, redirect to sign in
          addDebugInfo('User signed out, redirecting to sign in')
          setMessage('Redirecting to sign in...')
          
          // Create callback URL for after sign in
          const targetCompanyId = companyId || storedCompanyId
          const callbackUrl = targetCompanyId 
            ? `/dashboard?company=${targetCompanyId}`
            : '/dashboard'
          
          addDebugInfo(`Sign in callback URL: ${callbackUrl}`)
          
          // Clean up session storage before redirect
          sessionStorage.removeItem('post-login-company-id')
          sessionStorage.removeItem('post-login-redirect')
          
          // Redirect to sign in with callback
          router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}&email=${encodeURIComponent(email)}`)
        }

      } catch (error) {
        addDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setStatus('error')
        setMessage('Failed to refresh session. Please sign in manually.')
        
        // Redirect to sign in after error
        setTimeout(() => {
          router.push('/auth/signin')
        }, 3000)
      }
    }

    handleReAuthentication()
  }, [searchParams, router])

  const getIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-600" />
      case 'redirecting':
        return <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      default:
        return <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-md ${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-xl">
            {status === 'error' ? 'Authentication Error' : 'Updating Your Session'}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'processing' && (
            <div className="text-center text-sm text-gray-600">
              <p>We're updating your session with your new company information.</p>
              <p className="mt-2">This will only take a moment...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center text-sm text-green-700">
              <p>Your session has been successfully updated!</p>
              <p className="mt-2">You now have access to your company dashboard.</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center text-sm text-red-700">
              <p>We encountered an issue updating your session.</p>
              <p className="mt-2">You'll be redirected to sign in manually.</p>
            </div>
          )}

          {status === 'redirecting' && (
            <div className="text-center text-sm text-blue-700">
              <p>Taking you to your dashboard...</p>
            </div>
          )}

          {/* Debug information (only show in development) */}
          {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer">Debug Information</summary>
              <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded max-h-32 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index}>{info}</div>
                ))}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

