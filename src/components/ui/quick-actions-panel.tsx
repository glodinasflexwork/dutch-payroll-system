"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Plus, 
  Calculator, 
  FileText, 
  Users, 
  Play,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface QuickActionsPanelProps {
  employeeCount?: number
  hasProcessedPayroll?: boolean
  onStartTutorial?: () => void
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  href?: string
  onClick?: () => void
  variant: "primary" | "secondary" | "success" | "warning"
  badge?: string
  disabled?: boolean
  completed?: boolean
}

export function QuickActionsPanel({ 
  employeeCount = 0, 
  hasProcessedPayroll = false,
  onStartTutorial 
}: QuickActionsPanelProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  // Determine the current workflow step
  useEffect(() => {
    if (employeeCount === 0) {
      setCurrentStep(0) // Need to add employees
    } else if (!hasProcessedPayroll) {
      setCurrentStep(1) // Ready to process payroll
    } else {
      setCurrentStep(2) // Monitor and manage
    }
  }, [employeeCount, hasProcessedPayroll])

  // Calculate setup progress
  const calculateProgress = () => {
    let progress = 0
    if (employeeCount > 0) progress += 50
    if (hasProcessedPayroll) progress += 50
    return progress
  }

  const progress = calculateProgress()

  // Define quick actions based on current state
  const getQuickActions = (): QuickAction[] => {
    const actions: QuickAction[] = []

    // Always show tutorial
    actions.push({
      id: "tutorial",
      title: "Start Tutorial",
      description: "Learn how to use SalarySync step by step",
      icon: Play,
      onClick: onStartTutorial,
      variant: "secondary",
      badge: "5 min"
    })

    if (employeeCount === 0) {
      // First priority: Add employees
      actions.unshift({
        id: "add-employee",
        title: "Add Your First Employee",
        description: "Get started by adding employee information",
        icon: Plus,
        href: "/dashboard/employees",
        variant: "primary",
        badge: "Start here"
      })

      // Optional: Review tax settings
      actions.push({
        id: "tax-settings",
        title: "Review Tax Settings",
        description: "Verify Dutch tax rates and compliance",
        icon: FileText,
        href: "/dashboard/tax-settings",
        variant: "warning",
        badge: "Optional"
      })
    } else if (!hasProcessedPayroll) {
      // Second priority: Process payroll
      actions.unshift({
        id: "process-payroll",
        title: "Process First Payroll",
        description: "Calculate salaries and taxes for your employees",
        icon: Calculator,
        href: "/payroll",
        variant: "primary",
        badge: "Next step"
      })

      // Show employee management
      actions.push({
        id: "manage-employees",
        title: "Manage Employees",
        description: `View and edit your ${employeeCount} employee${employeeCount > 1 ? 's' : ''}`,
        icon: Users,
        href: "/dashboard/employees",
        variant: "success",
        completed: true
      })
    } else {
      // Third priority: Monitor and manage
      actions.unshift({
        id: "view-analytics",
        title: "View Analytics",
        description: "Monitor payroll costs and trends",
        icon: FileText,
        href: "/dashboard/analytics",
        variant: "primary",
        badge: "Recommended"
      })

      // Show completed actions
      actions.push({
        id: "manage-employees",
        title: "Manage Employees",
        description: `${employeeCount} employee${employeeCount > 1 ? 's' : ''} configured`,
        icon: Users,
        href: "/dashboard/employees",
        variant: "success",
        completed: true
      })
    }

    return actions
  }

  const quickActions = getQuickActions()

  const getWorkflowSteps = () => {
    return [
      {
        title: "Add Employees",
        completed: employeeCount > 0,
        current: currentStep === 0
      },
      {
        title: "Process Payroll",
        completed: hasProcessedPayroll,
        current: currentStep === 1
      },
      {
        title: "Monitor & Manage",
        completed: false,
        current: currentStep === 2
      }
    ]
  }

  const workflowSteps = getWorkflowSteps()

  return (
    <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl text-blue-900">Welcome to SalarySync!</CardTitle>
            <CardDescription className="text-blue-700">
              Let's get your payroll system set up
            </CardDescription>
          </div>
          <Badge variant="secondary" className="self-start sm:self-center bg-yellow-100 text-yellow-800 border-yellow-300">
            Setup
          </Badge>
        </div>
        
        {/* Progress Section */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-900">Setup Progress</span>
            <span className="text-sm font-bold text-blue-900">{progress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Actions - Mobile Optimized Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action, index) => (
            <div
              key={action.id}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md",
                action.variant === "primary" && "border-blue-300 bg-blue-50",
                action.variant === "secondary" && "border-pink-300 bg-pink-50",
                action.variant === "success" && "border-green-300 bg-green-50",
                action.variant === "warning" && "border-purple-300 bg-purple-50",
                action.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Badge */}
              {action.badge && (
                <div className="absolute -top-2 -right-2">
                  <Badge 
                    variant={action.variant === "primary" ? "default" : "secondary"}
                    className={cn(
                      "text-xs font-medium",
                      action.variant === "primary" && "bg-blue-600 text-white",
                      action.variant === "secondary" && "bg-pink-600 text-white",
                      action.variant === "warning" && "bg-purple-600 text-white"
                    )}
                  >
                    {action.badge}
                  </Badge>
                </div>
              )}

              {/* Completed Indicator */}
              {action.completed && (
                <div className="absolute -top-2 -right-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="flex items-start space-x-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  action.variant === "primary" && "bg-blue-100 text-blue-600",
                  action.variant === "secondary" && "bg-pink-100 text-pink-600",
                  action.variant === "success" && "bg-green-100 text-green-600",
                  action.variant === "warning" && "bg-purple-100 text-purple-600"
                )}>
                  <action.icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 leading-tight">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Action Button/Link */}
              <div className="mt-3">
                {action.href ? (
                  <Link href={action.href} className="block">
                    <Button 
                      size="sm" 
                      className={cn(
                        "w-full h-8 text-xs",
                        action.variant === "primary" && "bg-blue-600 hover:bg-blue-700",
                        action.variant === "secondary" && "bg-pink-600 hover:bg-pink-700",
                        action.variant === "success" && "bg-green-600 hover:bg-green-700",
                        action.variant === "warning" && "bg-purple-600 hover:bg-purple-700"
                      )}
                      disabled={action.disabled}
                    >
                      {action.completed ? "View" : "Go"}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={action.onClick}
                    className={cn(
                      "w-full h-8 text-xs",
                      action.variant === "primary" && "bg-blue-600 hover:bg-blue-700",
                      action.variant === "secondary" && "bg-pink-600 hover:bg-pink-700",
                      action.variant === "success" && "bg-green-600 hover:bg-green-700",
                      action.variant === "warning" && "bg-purple-600 hover:bg-purple-700"
                    )}
                    disabled={action.disabled}
                  >
                    Start
                    <Play className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Workflow Steps - Mobile Optimized */}
        <div className="mt-6 pt-4 border-t border-blue-200">
          <h4 className="text-sm font-semibold text-blue-900 mb-3">Setup Workflow</h4>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4">
            {workflowSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-2 flex-1">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                  step.completed 
                    ? "bg-green-500 text-white" 
                    : step.current 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 text-gray-500"
                )}>
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  step.completed 
                    ? "text-green-700" 
                    : step.current 
                      ? "text-blue-700" 
                      : "text-gray-500"
                )}>
                  {step.title}
                </span>
                {index < workflowSteps.length - 1 && (
                  <div className="hidden sm:block flex-1 h-px bg-gray-200 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

