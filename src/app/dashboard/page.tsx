"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import DashboardLayout from "@/components/layout/dashboard-layout"
import TrialBanner from "@/components/trial/TrialBanner"
import TrialCountdown from "@/components/trial/TrialCountdown"
import { QuickActionsPanel } from "@/components/ui/quick-actions-panel"
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
  CheckCircle,
  Play
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
  const [showTutorial, setShowTutorial] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      // Check if user has a company
      if (!session?.user?.companyId) {
        // Redirect to company setup if no company
        router.push("/setup/company")
        return
      }
      
      // User has a company, fetch dashboard stats
      setLoading(true)
      fetchDashboardStats()
    }
  }, [session, status, router])

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

  const handleStartTutorial = () => {
    setShowTutorial(true)
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

        {/* Quick Actions Panel - New Enhanced Component */}
        <QuickActionsPanel 
          employeeCount={stats?.totalEmployees || 0}
          hasProcessedPayroll={(stats?.totalPayrollRecords || 0) > 0}
          onStartTutorial={handleStartTutorial}
        />

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

        {/* Trial Countdown */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <TrialCountdown />
          </div>
          
          {/* System Status - Takes remaining space */}
          <div className="lg:col-span-3">
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
          </div>
        </div>

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

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Welcome to SalarySync!</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowTutorial(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Interactive Tutorial System</h4>
                <p className="text-gray-600">
                  The comprehensive tutorial system is being implemented. This will guide you through:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold text-blue-600 mb-2">Phase 1: Business Setup</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Company information</li>
                    <li>• Dutch tax configuration</li>
                    <li>• Account preferences</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold text-green-600 mb-2">Phase 2: People Management</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Add employees</li>
                    <li>• Dutch compliance setup</li>
                    <li>• Leave management</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold text-purple-600 mb-2">Phase 3: Payroll Processing</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• First payroll run</li>
                    <li>• Tax calculations</li>
                    <li>• Results review</li>
                  </ul>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h5 className="font-semibold text-orange-600 mb-2">Phase 4: Monitoring</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Analytics & reports</li>
                    <li>• Ongoing operations</li>
                    <li>• System management</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-800 mb-2">Quick Start Guide</h5>
                <p className="text-blue-700 text-sm mb-3">
                  For now, follow these steps to get started:
                </p>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Add your first employee using the "Add Employee" button above</li>
                  <li>2. Review tax settings to ensure Dutch compliance</li>
                  <li>3. Process your first payroll when ready</li>
                  <li>4. Explore analytics and reports</li>
                </ol>
              </div>

              <div className="flex justify-center">
                <Button onClick={() => setShowTutorial(false)} className="px-8">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

