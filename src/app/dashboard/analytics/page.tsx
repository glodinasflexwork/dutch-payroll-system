'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import ModernAnalyticsDashboard from "@/components/dashboard/analytics-dashboard-modern"
import { DashboardStatsSkeleton } from "@/components/ui/loading-skeleton"

export default function EnhancedAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      // Simulate loading time for analytics data
      setTimeout(() => setLoading(false), 1000)
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
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
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout>
      <ModernAnalyticsDashboard />
    </DashboardLayout>
  )
}
