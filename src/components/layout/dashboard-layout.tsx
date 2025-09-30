"use client"

import { useState, useEffect } from "react"
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
  Crown,
  Calendar,
  TrendingUp,
  UserCheck,
  DollarSign,
  Building,
  Wallet,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Play
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CompanySwitcherTrigger } from "@/components/ui/modern-company-switcher"
import { TutorialSystem } from "@/components/tutorial/TutorialSystem"
import { cn } from "@/lib/utils"
import { DataModeProvider, DataModeBanner, useDataMode } from "@/components/ui/data-mode-toggle"

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface NavigationGroup {
  id: string
  name: string
  icon: React.ComponentType<any>
  description: string
  items: NavigationItem[]
  defaultExpanded?: boolean
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  description: string
  badge?: string
  circularIcon?: boolean
}

const navigationGroups: NavigationGroup[] = [
  {
    id: "overview",
    name: "Overview & Insights",
    icon: TrendingUp,
    description: "Monitoring and business intelligence",
    defaultExpanded: true,
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Overview and analytics",
        circularIcon: true
      },
      {
        name: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        description: "Charts and insights",
        circularIcon: true
      },
      {
        name: "Reports",
        href: "/dashboard/reports",
        icon: FileText,
        description: "View payroll reports",
        circularIcon: true
      }
    ]
  },
  {
    id: "people",
    name: "People Management",
    icon: UserCheck,
    description: "Workforce and HR management",
    defaultExpanded: true,
    items: [
      {
        name: "Employees",
        href: "/dashboard/employees",
        icon: Users,
        description: "Manage employee records",
        circularIcon: true
      },
      {
        name: "Leave Management",
        href: "/dashboard/leave-management",
        icon: Calendar,
        description: "Leave requests and balances",
        circularIcon: true
      }
    ]
  },
  {
    id: "payroll",
    name: "Payroll Operations",
    icon: Calculator,
    description: "Core payroll calculations and compliance",
    defaultExpanded: false,
    items: [
      {
        name: "Payroll",
        href: "/payroll",
        icon: Calculator,
        description: "Process payroll calculations",
        circularIcon: true
      },
      {
        name: "Tax Settings",
        href: "/dashboard/tax-settings",
        icon: Settings,
        description: "Configure Dutch tax rates",
        circularIcon: true
      }
    ]
  },
  {
    id: "business",
    name: "Business Management",
    icon: Building,
    description: "Business setup and administration",
    defaultExpanded: false,
    items: [
      {
        name: "Company",
        href: "/dashboard/company",
        icon: Building2,
        description: "Company information"
      },
      {
        name: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        description: "Account preferences"
      }
    ]
  },
  {
    id: "subscription",
    name: "Subscription & Billing",
    icon: Wallet,
    description: "Financial management and service plans",
    defaultExpanded: false,
    items: [
      {
        name: "Subscription",
        href: "/subscription",
        icon: CreditCard,
        description: "Manage subscription"
      }
    ]
  }
]

function DashboardLayoutInner({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(navigationGroups.filter(g => g.defaultExpanded).map(g => g.id))
  )
  const [showTutorial, setShowTutorial] = useState(false)

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [sidebarOpen])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  const getCurrentPageInfo = () => {
    for (const group of navigationGroups) {
      for (const item of group.items) {
        if (pathname === item.href) {
          return { pageName: item.name, groupName: group.name, pageIcon: item.icon, circularIcon: item.circularIcon }
        }
      }
    }
    return { pageName: "Dashboard", groupName: "Overview & Insights", pageIcon: LayoutDashboard, circularIcon: true }
  }

  const { pageName, groupName, pageIcon: PageIcon, circularIcon } = getCurrentPageInfo()

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-8 w-8"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                {PageIcon && (
                  <PageIcon className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">{pageName}</h1>
                <p className="text-xs text-gray-500">{groupName}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="hidden sm:block">
              <CompanySwitcherTrigger />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowTutorial(true)}
              className="h-8 w-8"
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Company Switcher - Show on small screens */}
        <div className="sm:hidden mt-3">
          <CompanySwitcherTrigger />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <img 
                src="/salarysync-logo.png" 
                alt="SalarySync" 
                className="h-8 w-auto"
              />
            </div>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <img 
                src="/salarysync-logo.png" 
                alt="SalarySync" 
                className="h-6 w-auto"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>



          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigationGroups.map((group) => (
              <div key={group.id} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <group.icon className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-sm text-gray-900">{group.name}</div>
                      <div className="text-xs text-gray-500 hidden sm:block">{group.description}</div>
                    </div>
                  </div>
                  {expandedGroups.has(group.id) ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {expandedGroups.has(group.id) && (
                  <div className="ml-4 space-y-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-3 p-3 rounded-lg transition-colors text-sm",
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        {item.circularIcon ? (
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                            pathname === item.href
                              ? "bg-primary-foreground/20"
                              : "bg-blue-100"
                          )}>
                            <item.icon className={cn(
                              "w-4 h-4",
                              pathname === item.href ? "text-primary-foreground" : "text-blue-600"
                            )} />
                          </div>
                        ) : (
                          <item.icon className="w-4 h-4 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{item.name}</div>
                          <div className={cn(
                            "text-xs truncate hidden sm:block",
                            pathname === item.href ? "text-primary-foreground/80" : "text-gray-500"
                          )}>
                            {item.description}
                          </div>
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.email || "user@example.com"}
                </p>
              </div>
            </div>
            
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8"
                asChild
              >
                <Link href="/dashboard/help">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help & Support
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => signOut()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {PageIcon && (
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <PageIcon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{pageName}</h1>
                <p className="text-sm text-gray-500">{groupName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <CompanySwitcherTrigger />
            </div>
          </div>
        </div>

        {/* Data Mode Banner */}
        <DataModeBannerWithContext />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 pt-20 lg:pt-6">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Tutorial System */}
      <TutorialSystem 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  )
}

// Simplified banner component that uses the data mode context
function DataModeBannerWithContext() {
  const { isDemoMode, setDemoMode } = useDataMode()
  
  // Only show a subtle banner, not the full Stripe-style banner
  if (!isDemoMode) return null
  
  return (
    <div className="bg-amber-100 border-b border-amber-200 px-4 py-2 text-center">
      <div className="flex items-center justify-center space-x-4">
        <span className="text-sm text-amber-800">
          <strong>Demo Mode:</strong> You're viewing sample data
        </span>
        <button
          onClick={() => setDemoMode(false)}
          className="text-sm text-amber-700 hover:text-amber-900 underline"
        >
          Switch to live data
        </button>
      </div>
    </div>
  )
}

// Main layout component wrapped with DataModeProvider
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DataModeProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </DataModeProvider>
  )
}

// Named export for compatibility
export { DashboardLayout }

