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
  TrendingUp,
  Building2,
  Euro,
  Clock,
  CheckCircle
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
    if (session?.user?.companyId) {
      setLoading(true)
      fetchDashboardStats()
    }
  }, [session?.user?.companyId]) // Fix: trigger on companyId changes, not just session

  const fetchDashboardStats = async () => {
    try {
      console.log('=== DASHBOARD DEBUG ===')
      console.log('Session object:', session)
      console.log('Session user:', session?.user)
      console.log('Session companyId:', session?.user?.companyId)
      console.log('Fetching dashboard stats for company:', session?.user?.companyId)
      
      // Fetch company info with employee counts
      const companyResponse = await fetch("/api/companies")
      const companyData = await companyResponse.json()
      console.log('Company API response:', companyData)

      // Fetch employees to get detailed counts
      const employeesResponse = await fetch("/api/employees")
      const employeesResult = await employeesResponse.json()
      const employeesData = employeesResult.success ? employeesResult.employees : []
      
      console.log('Employees API response:', employeesResult)
      console.log('Dashboard employees data:', employeesData)

      // Fetch payroll records
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
        companyName: companyData.name || "Your Company"
      }
      
      console.log('Setting dashboard stats:', dashboardStats)
      setStats(dashboardStats)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      // Set default stats on error
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

  const quickActions = [
    {
      title: "Add Employee",
      description: "Register a new employee",
      icon: Users,
      href: "/dashboard/employees",
      color: "bg-blue-500"
    },
    {
      title: "Process Payroll",
      description: "Calculate monthly payroll",
      icon: Calculator,
      href: "/payroll",
      color: "bg-green-500"
    },
    {
      title: "View Reports",
      description: "Generate payroll reports",
      icon: FileText,
      href: "/dashboard/reports",
      color: "bg-purple-500"
    },
    {
      title: "Tax Settings",
      description: "Configure tax rates",
      icon: TrendingUp,
      href: "/dashboard/tax-settings",
      color: "bg-orange-500"
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {session.user.name}!
              </h1>
              <p className="text-primary-foreground/80">
                Here's what's happening with your payroll system today.
              </p>
            </div>
            <div className="hidden md:block">
              <Building2 className="w-16 h-16 text-primary-foreground/20" />
            </div>
          </div>
        </div>

        {/* Trial Banner */}
        <TrialBanner />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active employees in system
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Employees</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.monthlyEmployees || 0}</div>
              <p className="text-xs text-muted-foreground">
                Fixed salary employees
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hourly Employees</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.hourlyEmployees || 0}</div>
              <p className="text-xs text-muted-foreground">
                Hourly rate employees
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payroll Records</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPayrollRecords || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total processed records
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Trial Countdown and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Trial Countdown - Takes 1 column */}
          <div className="lg:col-span-1">
            <TrialCountdown />
          </div>
          
          {/* Quick Actions - Takes 3 columns */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Card key={index} className="hover-lift cursor-pointer group" onClick={() => router.push(action.href)}>
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>System Status</span>
            </CardTitle>
            <CardDescription>
              Your Dutch payroll system is running smoothly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-muted-foreground">Connected</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Authentication</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Tax Calculations</p>
                  <p className="text-sm text-muted-foreground">2025 Rates</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Info */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Current company details and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-lg">{stats?.companyName}</p>
                <p className="text-sm text-muted-foreground">Netherlands</p>
                <Badge variant="secondary" className="mt-2">
                  Dutch Tax Compliant
                </Badge>
              </div>
              <Button variant="outline" onClick={() => router.push("/dashboard/company")}>
                Manage Company
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

