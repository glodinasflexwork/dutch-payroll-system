"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import TrialBanner from "@/components/trial/TrialBanner"
import TrialCountdown from "@/components/trial/TrialCountdown"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  ArrowRight
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
      const companyResponse = await fetch("/api/companies")
      const companyData = await companyResponse.json()

      const employeesResponse = await fetch("/api/employees")
      const employeesResult = await employeesResponse.json()
      const employeesData = employeesResult.success ? employeesResult.employees : []

      const payrollResponse = await fetch("/api/payroll")
      const payrollResult = await payrollResponse.json()
      const payrollData = payrollResult.success ? payrollResult.records || payrollResult.payrollRecords || [] : []

      const monthlyEmployees = employeesData.filter((emp: any) => emp.employmentType === "monthly").length
      const hourlyEmployees = employeesData.filter((emp: any) => emp.employmentType === "hourly").length

      const dashboardStats = {
        totalEmployees: employeesData.length,
        monthlyEmployees,
        hourlyEmployees,
        totalPayrollRecords: payrollData.length,
        companyName: primaryCompany?.name || companyData.name || "Your Company"
      }
      
      setStats(dashboardStats)
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
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
      <div className="space-y-6">
        {/* Enhanced Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {session.user.name}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Here's what's happening with your payroll system today.
              </p>
              <div className="mt-4 flex items-center space-x-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {stats?.companyName}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {stats?.totalEmployees || 0} Employees
                </Badge>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                <Building2 className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Trial Banner */}
        <TrialBanner />

        {/* Enhanced Quick Setup Panel */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
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
              {/* Step 1 - Add Employees */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-green-900 mb-2">Add Employees</h3>
                  <p className="text-sm text-green-700 mb-3">
                    You have {stats?.totalEmployees || 0} employee(s) configured
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => router.push("/dashboard/employees")}
                  >
                    Manage Employees
                  </Button>
                </CardContent>
              </Card>

              {/* Step 2 - Process Payroll */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Next Step
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-blue-900 mb-2">Process First Payroll</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Calculate salaries and taxes for your employees
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push("/payroll")}
                  >
                    Start Payroll <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>

              {/* Step 3 - Monitor */}
              <Card className="border-gray-200 bg-gray-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <Badge variant="outline" className="border-gray-300 text-gray-600">
                      Coming Soon
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-700 mb-2">Monitor & Analyze</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    View reports and analytics for your payroll
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    disabled
                  >
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats?.totalEmployees || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active employees in system
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Employees</CardTitle>
              <Clock className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.monthlyEmployees || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Fixed salary employees
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hourly Employees</CardTitle>
              <Euro className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats?.hourlyEmployees || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Hourly rate employees
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payroll Records</CardTitle>
              <FileText className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats?.totalPayrollRecords || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total processed records
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trial Countdown */}
          <div className="lg:col-span-1">
            <TrialCountdown />
          </div>
          
          {/* Enhanced System Status */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>System Status</span>
                </CardTitle>
                <CardDescription className="text-green-700">
                  Your Dutch payroll system is running smoothly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-green-800">Database</p>
                      <p className="text-sm text-green-600">Connected</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-green-800">Authentication</p>
                      <p className="text-sm text-green-600">Active</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-green-800">Tax Calculations</p>
                      <p className="text-sm text-green-600">2025 Rates</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

