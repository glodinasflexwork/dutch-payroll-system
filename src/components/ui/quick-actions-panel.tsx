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
      setCurrentStep(2) // System is operational
    }
  }, [employeeCount, hasProcessedPayroll])

  const getQuickActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = [
      {
        id: "tutorial",
        title: "Start Tutorial",
        description: "Learn how to use SalarySync step by step",
        icon: Play,
        onClick: onStartTutorial,
        variant: "secondary",
        badge: "5 min"
      }
    ]

    if (employeeCount === 0) {
      return [
        {
          id: "add-employee",
          title: "Add Your First Employee",
          description: "Get started by adding employee information",
          icon: Plus,
          href: "/dashboard/employees",
          variant: "primary",
          badge: "Start here"
        },
        ...baseActions,
        {
          id: "tax-settings",
          title: "Review Tax Settings",
          description: "Verify Dutch tax rates and compliance",
          icon: Calculator,
          href: "/dashboard/tax-settings",
          variant: "secondary",
          badge: "Optional"
        }
      ]
    }

    if (!hasProcessedPayroll) {
      return [
        {
          id: "process-payroll",
          title: "Process Your First Payroll",
          description: "Calculate salaries for your employees",
          icon: Calculator,
          href: "/payroll",
          variant: "primary",
          badge: "Next step"
        },
        {
          id: "add-employee",
          title: "Add More Employees",
          description: "Expand your workforce",
          icon: Users,
          href: "/dashboard/employees",
          variant: "secondary",
          completed: true
        },
        ...baseActions
      ]
    }

    return [
      {
        id: "view-reports",
        title: "View Payroll Reports",
        description: "Analyze your payroll data and trends",
        icon: FileText,
        href: "/dashboard/reports",
        variant: "primary"
      },
      {
        id: "process-payroll",
        title: "Process Monthly Payroll",
        description: "Run payroll for the current month",
        icon: Calculator,
        href: "/payroll",
        variant: "secondary",
        completed: true
      },
      {
        id: "manage-employees",
        title: "Manage Employees",
        description: "Update employee information and settings",
        icon: Users,
        href: "/dashboard/employees",
        variant: "secondary",
        completed: true
      },
      ...baseActions
    ]
  }

  const quickActions = getQuickActions()

  const getStepStatus = () => {
    switch (currentStep) {
      case 0:
        return {
          title: "Welcome to SalarySync!",
          description: "Let's get your payroll system set up",
          status: "setup",
          progress: 0
        }
      case 1:
        return {
          title: "Great! You have employees",
          description: "Ready to process your first payroll",
          status: "ready",
          progress: 50
        }
      case 2:
        return {
          title: "System is operational",
          description: "Your payroll system is fully configured",
          status: "complete",
          progress: 100
        }
      default:
        return {
          title: "Getting started",
          description: "Setting up your payroll system",
          status: "setup",
          progress: 0
        }
    }
  }

  const stepStatus = getStepStatus()

  return (
    <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-blue-900">
              {stepStatus.title}
            </CardTitle>
            <CardDescription className="text-blue-700">
              {stepStatus.description}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {stepStatus.status === "setup" && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <Clock className="w-3 h-3 mr-1" />
                Setup
              </Badge>
            )}
            {stepStatus.status === "ready" && (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                <AlertCircle className="w-3 h-3 mr-1" />
                Ready
              </Badge>
            )}
            {stepStatus.status === "complete" && (
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-blue-700 mb-1">
            <span>Setup Progress</span>
            <span>{stepStatus.progress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${stepStatus.progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <QuickActionCard 
              key={action.id} 
              action={action} 
              index={index}
              isHighlighted={index === 0 && currentStep < 2}
            />
          ))}
        </div>
        
        {/* Workflow Steps */}
        <div className="mt-6 pt-6 border-t border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Setup Workflow</h4>
          <div className="flex items-center space-x-4">
            <WorkflowStep 
              step={1} 
              title="Add Employees" 
              completed={employeeCount > 0}
              active={currentStep === 0}
            />
            <ArrowRight className="w-4 h-4 text-blue-400" />
            <WorkflowStep 
              step={2} 
              title="Process Payroll" 
              completed={hasProcessedPayroll}
              active={currentStep === 1}
            />
            <ArrowRight className="w-4 h-4 text-blue-400" />
            <WorkflowStep 
              step={3} 
              title="Monitor & Manage" 
              completed={hasProcessedPayroll}
              active={currentStep === 2}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface QuickActionCardProps {
  action: QuickAction
  index: number
  isHighlighted?: boolean
}

function QuickActionCard({ action, index, isHighlighted }: QuickActionCardProps) {
  const content = (
    <div className={cn(
      "p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md group cursor-pointer",
      action.variant === "primary" && "border-blue-300 bg-blue-50 hover:bg-blue-100",
      action.variant === "secondary" && "border-gray-300 bg-white hover:bg-gray-50",
      action.variant === "success" && "border-green-300 bg-green-50 hover:bg-green-100",
      action.variant === "warning" && "border-yellow-300 bg-yellow-50 hover:bg-yellow-100",
      action.completed && "border-green-300 bg-green-50",
      action.disabled && "opacity-50 cursor-not-allowed",
      isHighlighted && "ring-2 ring-blue-500 ring-offset-2 animate-pulse"
    )}>
      <div className="flex items-start justify-between mb-2">
        <action.icon className={cn(
          "w-5 h-5 transition-colors",
          action.variant === "primary" && "text-blue-600",
          action.variant === "secondary" && "text-gray-600",
          action.variant === "success" && "text-green-600",
          action.variant === "warning" && "text-yellow-600",
          action.completed && "text-green-600"
        )} />
        {action.badge && (
          <Badge variant="secondary" className="text-xs">
            {action.badge}
          </Badge>
        )}
        {action.completed && (
          <CheckCircle className="w-4 h-4 text-green-600" />
        )}
      </div>
      
      <h3 className={cn(
        "font-medium text-sm mb-1",
        action.variant === "primary" && "text-blue-900",
        action.variant === "secondary" && "text-gray-900",
        action.variant === "success" && "text-green-900",
        action.variant === "warning" && "text-yellow-900",
        action.completed && "text-green-900"
      )}>
        {action.title}
      </h3>
      
      <p className={cn(
        "text-xs",
        action.variant === "primary" && "text-blue-700",
        action.variant === "secondary" && "text-gray-600",
        action.variant === "success" && "text-green-700",
        action.variant === "warning" && "text-yellow-700",
        action.completed && "text-green-700"
      )}>
        {action.description}
      </p>
    </div>
  )

  if (action.href) {
    return (
      <Link href={action.href} className={action.disabled ? "pointer-events-none" : ""}>
        {content}
      </Link>
    )
  }

  return (
    <button 
      onClick={action.onClick}
      disabled={action.disabled}
      className="text-left w-full"
    >
      {content}
    </button>
  )
}

interface WorkflowStepProps {
  step: number
  title: string
  completed: boolean
  active: boolean
}

function WorkflowStep({ step, title, completed, active }: WorkflowStepProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
        completed && "bg-green-600 text-white",
        active && !completed && "bg-blue-600 text-white",
        !active && !completed && "bg-gray-300 text-gray-600"
      )}>
        {completed ? <CheckCircle className="w-4 h-4" /> : step}
      </div>
      <span className={cn(
        "text-sm font-medium",
        completed && "text-green-700",
        active && !completed && "text-blue-700",
        !active && !completed && "text-gray-500"
      )}>
        {title}
      </span>
    </div>
  )
}

