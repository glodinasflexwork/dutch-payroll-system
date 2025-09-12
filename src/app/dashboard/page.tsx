'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import TrialBanner from "@/components/trial/TrialBanner"
import TrialCountdown from "@/components/trial/TrialCountdown"
import SessionRefreshHandler from "@/components/SessionRefreshHandler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardStatsSkeleton, CardSkeleton, Skeleton } from "@/components/ui/loading-skeleton"
import { 
  Users, 
  Calculator, 
  FileText, 
  Building2,
  Euro,
  Clock,
  CheckCircle,
  Play,
  Settings,
  Plus,
  ArrowRight,
  BarChart3,
  Activity
} from "lucide-react"

interface DashboardStats {
  totalEmployees: number
  monthlyEmployees: number
  hourlyEmployees: number
  totalPayrollRecords: number
  companyName: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      checkUserCompanyAndLoadDashboard()
    }
  }, [session, status, router])

  const checkUserCompanyAndLoadDashboard = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/user/company-status')
      const data = await response.json()
      
      if (!data.hasCompany || data.companies.length === 0) {
        router.push("/setup/company")
        return
      }
      
      await fetchDashboardStats(data.primaryCompany)
      
    } catch (error) {
      console.error('Error checking company status:', error)
      router.push("/setup/company")
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardStats = async (primaryCompany?: any) => {
    try {
      // Use optimized dashboard stats API endpoint
      const response = await fetch("/api/dashboard/stats")
      const result = await response.json()
      
      if (result.success) {
        const dashboardStats = {
          totalEmployees: result.totalEmployees,
          monthlyEmployees: result.monthlyEmployees,
          hourlyEmployees: result.hourlyEmployees,
          totalPayrollRecords: result.totalPayrollRecords,
          companyName: result.companyName
        }
        
        console.log("Dashboard stats loaded:", dashboardStats, result.cached ? "(cached)" : "(fresh)")
        setStats(dashboardStats)
      } else {
        throw new Error(result.error || "Failed to fetch dashboard stats")
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      setStats({
        totalEmployees: 0,
        monthlyEmployees: 0,
        hourlyEmployees: 0,
        totalPayrollRecords: 0,
        companyName: "Your Company"
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Trial Banner Skeleton */}
          <div className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <DashboardStatsSkeleton />

          {/* Additional Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout>
      <SessionRefreshHandler />
      <div className="space-y-6">
        {/* Trial Banner */}
        <TrialBanner />

        {/* Professional Quick Setup Panel - Blue Tones Only */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-blue-900 flex items-center">
                  <Play className="w-5 h-5 mr-2" />
                  Quick Setup Guide
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Get your payroll system ready in 3 simple steps
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                Setup Progress: 50%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Step 1 - Add Employees - Completed (Blue-Green) */}
              <Card className="border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                      Completed
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-blue-900 mb-2">Add Employees</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    You have {stats?.totalEmployees || 0} employee(s) configured
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push("/dashboard/employees")}
                  >
                    Manage Employees
                  </Button>
                </CardContent>
              </Card>

              {/* Step 2 - Process Payroll - Next Step (Darker Blue) */}
              <Card className="border-blue-400 bg-gradient-to-br from-blue-100 to-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <Badge variant="secondary" className="bg-blue-300 text-blue-900">
                      Next Step
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-blue-900 mb-2">Process First Payroll</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Calculate salaries and taxes for your employees
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-700 hover:bg-blue-800"
                    onClick={() => router.push("/payroll")}
                  >
                    Start Payroll <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              {/* Step 3 - Monitor - Coming Soon (Light Blue/Gray) */}
              <Card className="border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <Badge variant="outline" className="border-slate-300 text-slate-600">
                      Coming Soon
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-slate-700 mb-2">Monitor & Analyze</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    View reports and analytics for your payroll
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full border-slate-300 text-slate-600"
                    disabled
                  >
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Professional Stats Grid - Blue Gradient Variations Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Total Employees</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{stats?.totalEmployees || 0}</div>
              <p className="text-xs text-blue-600 mt-1">
                Active employees in system
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Monthly Employees</CardTitle>
              <Clock className="h-5 w-5 text-blue-700" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-800">{stats?.monthlyEmployees || 0}</div>
              <p className="text-xs text-blue-600 mt-1">
                Fixed salary employees
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-700 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Hourly Employees</CardTitle>
              <Euro className="h-5 w-5 text-blue-800" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats?.hourlyEmployees || 0}</div>
              <p className="text-xs text-blue-600 mt-1">
                Hourly rate employees
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-800 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Payroll Records</CardTitle>
              <BarChart3 className="h-5 w-5 text-blue-900" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats?.totalPayrollRecords || 0}</div>
              <p className="text-xs text-blue-600 mt-1">
                Total processed records
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Professional Setup Workflow - Blue Tones Only */}
        <Card className="bg-gradient-to-r from-blue-50 to-slate-50">
          <CardHeader>
            <CardTitle className="text-xl text-blue-900 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Setup Workflow
            </CardTitle>
            <CardDescription className="text-blue-700">
              Track your progress through the payroll setup process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-blue-900">Add Employees</span>
                </div>
                <div className="w-8 h-0.5 bg-blue-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    2
                  </div>
                  <span className="text-sm font-medium text-blue-900">Process Payroll</span>
                </div>
                <div className="w-8 h-0.5 bg-slate-300"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    3
                  </div>
                  <span className="text-sm font-medium text-slate-600">Monitor & Manage</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional System Status - Blue Gradient */}
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              System Status
            </CardTitle>
            <CardDescription className="text-blue-100">
              Your Dutch payroll system is running smoothly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-blue-100">Connected</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">Authentication</p>
                  <p className="text-sm text-blue-100">Active</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">Tax Calculations</p>
                  <p className="text-sm text-blue-100">2025 Rates</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

