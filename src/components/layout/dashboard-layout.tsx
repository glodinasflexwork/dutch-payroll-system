"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Calculator, 
  FileText, 
  Settings, 
  Building2,
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  CreditCard,
  Crown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and analytics"
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "Charts and insights"
  },
  {
    name: "Employees",
    href: "/dashboard/employees",
    icon: Users,
    description: "Manage employee records"
  },
  {
    name: "Payroll",
    href: "/payroll",
    icon: Calculator,
    description: "Process payroll calculations"
  },
  {
    name: "Payroll Management",
    href: "/payroll-management",
    icon: Users,
    description: "Batch processing and approvals"
  },
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
    description: "View payroll reports"
  },
  {
    name: "Subscription",
    href: "/subscription",
    icon: Crown,
    description: "Manage your plan"
  },
  {
    name: "Billing",
    href: "/billing",
    icon: CreditCard,
    description: "Invoices and payments"
  },
  {
    name: "Tax Settings",
    href: "/dashboard/tax-settings",
    icon: Settings,
    description: "Configure tax rates"
  },
  {
    name: "Company",
    href: "/dashboard/company",
    icon: Building2,
    description: "Company information"
  }
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img src="/logo-icon-only.png" alt="SalarySync" className="w-8 h-8" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">SalarySync</h1>
                <p className="text-xs text-gray-500">Professional Payroll</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group hover-lift",
                    isActive
                      ? "bg-blue-600 text-white shadow-professional"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                  )} />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className={cn(
                      "text-xs",
                      isActive ? "text-blue-100" : "text-gray-500"
                    )}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full animate-scale-in" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.company?.name}
                </p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {session?.user?.role}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full mt-3 justify-start text-gray-600 hover:text-gray-900"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {navigation.find(item => item.href === pathname)?.name || "Dashboard"}
                </h2>
                <p className="text-sm text-gray-500">
                  {navigation.find(item => item.href === pathname)?.description || "Welcome to your dashboard"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="hidden sm:flex">
                {new Date().toLocaleDateString('nl-NL', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Badge>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <div className="animate-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// Named export for compatibility
export { DashboardLayout }
export default DashboardLayout

