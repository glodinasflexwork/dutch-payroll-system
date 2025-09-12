'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { signIn, getSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

function ReAuthenticateV2Content() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'processing' | 'success' | 'error' | 'redirecting'>('processing')
  const [message, setMessage] = useState('Refreshing your session...')
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`])
  }

  useEffect(() => {
    const handleHybridReAuthentication = async () => {
      try {
        const email = searchParams.get('email')
        const reason = searchParams.get('reason')
        const companyId = searchParams.get('company-id')
        const companyName = searchParams.get('company-name')
        const isAuto = searchParams.get('auto') === 'true'

        addDebugInfo(`Hybrid re-authentication started`)
        addDebugInfo(`Email: ${email}`)
        addDebugInfo(`Company: ${companyName} (${companyId})`)
        addDebugInfo(`Auto mode: ${isAuto}`)
        addDebugInfo(`Reason: ${reason}`)

        if (!email) {
          throw new Error('No email provided for re-authentication')
        }

        // Check if we have temporary re-auth data from the hybrid approach
        const tempDataStr = sessionStorage.getItem('temp-reauth-data')
        let tempData = null
        if (tempDataStr) {
          try {
            tempData = JSON.parse(tempDataStr)
            addDebugInfo(`Temp data found: ${JSON.stringify(tempData)}`)
          } catch (e) {
            addDebugInfo('Invalid temp data found')
          }
        }

        if (isAuto && tempData) {
          // AUTOMATIC RE-AUTHENTICATION MODE
          setMessage('Automatically refreshing your session...')
          addDebugInfo('Starting automatic re-authentication')

          // First, check if user is already signed in
          const currentSession = await getSession()
          if (currentSession?.user?.email === email) {
            addDebugInfo('User already signed in, attempting session update')
            setMessage('Updating session with company information...')
            
            try {
              const { update } = await import('next-auth/react')
              const updateResult = await update({
                companyId: tempData.companyId,
                companyName: tempData.companyName,
                hasCompany: true,
                companyRole: 'owner'
              })
              
              addDebugInfo(`Session update result: ${JSON.stringify(updateResult)}`)
              
              // Wait for session to propagate
              await new Promise(resolve => setTimeout(resolve, 1500))
              
              // Verify the update worked
              const verifySession = await getSession()
              addDebugInfo(`Verification session: ${JSON.stringify(verifySession)}`)
              
              if (verifySession?.hasCompany && verifySession?.companyId) {
                addDebugInfo('Session update successful!')
                setStatus('success')
                setMessage('Session updated successfully! Redirecting...')
                
                // Clean up temp data
                sessionStorage.removeItem('temp-reauth-data')
                
                setTimeout(() => {
                  setStatus('redirecting')
                  router.push('/dashboard')
                }, 1000)
                return
              } else {
                addDebugInfo('Session update incomplete, company data missing')
                throw new Error('Session update did not include company data')
              }
            } catch (updateError) {
              addDebugInfo(`Session update failed: ${updateError.message}`)
              // Fall through to sign-in redirect
            }
          }

          // If session update didn't work, redirect to sign-in with auto-fill
          addDebugInfo('Session update failed, redirecting to sign-in')
          setMessage('Redirecting to sign-in for automatic authentication...')
          
          const signInUrl = new URL('/auth/signin', window.location.origin)
          signInUrl.searchParams.set('email', encodeURIComponent(email))
          signInUrl.searchParams.set('auto-reauth', 'true')
          signInUrl.searchParams.set('company-id', companyId || '')
          signInUrl.searchParams.set('company-name', encodeURIComponent(companyName || ''))
          signInUrl.searchParams.set('message', 'Please sign in to complete the session refresh')
          
          // Clean up temp data
          sessionStorage.removeItem('temp-reauth-data')
          
          setTimeout(() => {
            window.location.href = signInUrl.toString()
          }, 2000)
          return
        }

        // STANDARD RE-AUTHENTICATION MODE (fallback)
        addDebugInfo('Using standard re-authentication mode')
        setMessage('Checking your current session...')

        // Check if user is already signed in
        const session = await getSession()
        addDebugInfo(`Current session exists: ${!!session}`)

        if (session?.user?.email === email) {
          addDebugInfo('User already signed in, attempting session refresh')
          setMessage('Refreshing your session data...')

          try {
            const { update } = await import('next-auth/react')
            const result = await update()
            addDebugInfo(`Session refresh result: ${JSON.stringify(result)}`)

            // Wait for session propagation
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Verify the refresh
            const updatedSession = await getSession()
            addDebugInfo(`Updated session: ${JSON.stringify(updatedSession)}`)

            if (updatedSession?.hasCompany) {
              setStatus('success')
              setMessage('Session refreshed successfully! Redirecting...')
              addDebugInfo('Session refresh successful')

              setTimeout(() => {
                setStatus('redirecting')
                router.push('/dashboard')
              }, 1500)
            } else {
              addDebugInfo('Session refresh incomplete')
              throw new Error('Session refresh did not include company information')
            }
          } catch (refreshError) {
            addDebugInfo(`Session refresh failed: ${refreshError.message}`)
            setStatus('error')
            setMessage('Session refresh failed. Redirecting to sign-in...')

            setTimeout(() => {
              const signInUrl = new URL('/auth/signin', window.location.origin)
              signInUrl.searchParams.set('email', encodeURIComponent(email))
              signInUrl.searchParams.set('message', 'session-refresh-failed')
              window.location.href = signInUrl.toString()
            }, 2000)
          }
        } else {
          addDebugInfo('User not signed in, redirecting to sign-in')
          setMessage('Redirecting to sign-in page...')

          setTimeout(() => {
            const signInUrl = new URL('/auth/signin', window.location.origin)
            signInUrl.searchParams.set('email', encodeURIComponent(email))
            if (reason) {
              signInUrl.searchParams.set('reason', reason)
            }
            window.location.href = signInUrl.toString()
          }, 1500)
        }

      } catch (error) {
        addDebugInfo(`Error: ${error.message}`)
        setStatus('error')
        setMessage('Re-authentication failed. Please try signing in manually.')
        
        setTimeout(() => {
          const signInUrl = new URL('/auth/signin', window.location.origin)
          const email = searchParams.get('email')
          if (email) {
            signInUrl.searchParams.set('email', encodeURIComponent(email))
          }
          signInUrl.searchParams.set('error', 'reauth-failed')
          window.location.href = signInUrl.toString()
        }, 3000)
      }
    }

    handleHybridReAuthentication()
  }, [searchParams, router])

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />
      case 'redirecting':
        return <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
      default:
        return <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100'
      case 'success':
        return 'bg-green-100'
      case 'error':
        return 'bg-red-100'
      case 'redirecting':
        return 'bg-blue-100'
      default:
        return 'bg-blue-100'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className={`mx-auto w-12 h-12 ${getStatusColor()} rounded-full flex items-center justify-center mb-4`}>
            {getStatusIcon()}
          </div>
          <CardTitle>
            {status === 'processing' && 'Refreshing Session'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Authentication Error'}
            {status === 'redirecting' && 'Redirecting...'}
          </CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Progress indicator */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                status === 'processing' ? 'bg-blue-600 w-1/3' :
                status === 'success' ? 'bg-green-600 w-full' :
                status === 'error' ? 'bg-red-600 w-full' :
                status === 'redirecting' ? 'bg-blue-600 w-5/6' : 'bg-gray-400 w-0'
              }`}
            />
          </div>

          {/* Debug information (only in development) */}
          {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
            <details className="mt-4">
              <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                Debug Information ({debugInfo.length} entries)
              </summary>
              <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono max-h-40 overflow-y-auto">
                {debugInfo.map((info, index) => (
                  <div key={index} className="mb-1">
                    {info}
                  </div>
                ))}
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ReAuthenticateV2() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Preparing session refresh...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <ReAuthenticateV2Content />
    </Suspense>
  )
}

