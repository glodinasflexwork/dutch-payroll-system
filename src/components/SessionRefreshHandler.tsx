'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function SessionRefreshHandler() {
  const { data: session, update } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const refreshSession = searchParams.get('refresh-session')
    
    if (refreshSession === 'true') {
      console.log('🔄 Session refresh requested by middleware')
      
      const performRefresh = async () => {
        try {
          console.log('📋 Current session before refresh:', session)
          
          // Force session update
          const updatedSession = await update()
          console.log('✅ Session updated:', updatedSession)
          
          // Wait a moment for the session to propagate
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Remove the refresh-session parameter and reload
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete('refresh-session')
          
          console.log('🔄 Redirecting to clean URL:', newUrl.pathname)
          router.replace(newUrl.pathname)
          
        } catch (error) {
          console.error('❌ Session refresh failed:', error)
          
          // Fallback: redirect to setup if refresh fails
          setTimeout(() => {
            router.push('/setup/company')
          }, 1000)
        }
      }
      
      performRefresh()
    }
  }, [searchParams, session, update, router])

  return null // This component doesn't render anything
}

