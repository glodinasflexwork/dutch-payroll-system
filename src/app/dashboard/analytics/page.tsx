'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import ModernAnalyticsDashboard from "@/components/dashboard/analytics-dashboard-modern"
import { DashboardStatsSkeleton } from "@/components/ui/loading-skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Database, TestTube } from "lucide-react"

interface AnalyticsData {
  hasRealData: boolean
  isDemoData?: boolean
  [key: string]: any
}

export default function EnhancedAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchAnalyticsData()
    }
  }, [status])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/analytics?timeRange=6months')
      const result = await response.json()
      
      if (result.success) {
        setAnalyticsData(result)
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

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
      <div className="space-y-6">
        {/* Data Status Indicator */}
        {analyticsData && !analyticsData.hasRealData ? (
          <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <TestTube className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900">Analytics Demo Preview</h3>
                  <p className="text-sm text-amber-700">
                    You're viewing sample analytics to demonstrate advanced reporting features. 
                    <span className="font-medium"> Add employees and process payroll to see your real business analytics.</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard/employees/add")}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : analyticsData?.hasRealData ? (
          <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900">Live Business Analytics</h3>
                  <p className="text-sm text-green-700">
                    Advanced analytics powered by your real business data.
                  </p>
                </div>
                <Badge className="bg-green-200 text-green-800">Live Data</Badge>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Modern Analytics Dashboard */}
        <ModernAnalyticsDashboard analyticsData={analyticsData} />
      </div>
    </DashboardLayout>
  )
}
