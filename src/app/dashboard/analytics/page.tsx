'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import ModernAnalyticsDashboard from "@/components/dashboard/analytics-dashboard-modern"
import { DashboardStatsSkeleton } from "@/components/ui/loading-skeleton"
import { useDataMode } from "@/components/ui/data-mode-toggle"
import { getDemoAnalytics } from "@/lib/demo-data"

interface AnalyticsData {
  hasRealData: boolean
  isDemoData?: boolean
  [key: string]: any
}

function AnalyticsContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const { isDemoMode, toggleDemoMode } = useDataMode()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchAnalyticsData()
    }
  }, [status, isDemoMode])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      if (isDemoMode) {
        // Use demo data
        const demoData = getDemoAnalytics()
        setAnalyticsData({
          hasRealData: false,
          isDemoData: true,
          ...demoData
        })
      } else {
        // Fetch real data
        const response = await fetch("/api/dashboard/analytics?timeRange=6months", {
          cache: 'no-store' // Ensure fresh data on each request
        })
        const result = await response.json()
        
        if (result.success) {
          setAnalyticsData({
            hasRealData: result.hasRealData,
            isDemoData: result.isDemoData,
            ...result
          })
        } else {
          console.error("Failed to fetch analytics data:", result.error)
          // Fallback to demo data if API fails
          const demoData = getDemoAnalytics()
          setAnalyticsData({
            hasRealData: false,
            isDemoData: true,
            ...demoData
          })
        }
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error)
      // Fallback to demo data on error
      const demoData = getDemoAnalytics()
      setAnalyticsData({
        hasRealData: false,
        isDemoData: true,
        ...demoData
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <DashboardStatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Modern Analytics Dashboard */}      <ModernAnalyticsDashboard 
        analyticsData={analyticsData} 
        showSetupGuide={!analyticsData?.hasRealData && !isDemoMode}
      />
    </div>
  )
}

export default function EnhancedAnalyticsPage() {
  return <AnalyticsContent />
}
