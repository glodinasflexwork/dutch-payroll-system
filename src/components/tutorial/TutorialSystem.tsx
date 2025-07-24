"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Play,
  Building2,
  Users,
  Calculator,
  BarChart3,
  Settings,
  ArrowRight,
  Clock,
  Target,
  BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface TutorialSystemProps {
  isOpen: boolean
  onClose: () => void
  startPhase?: number
}

interface TutorialPhase {
  id: number
  title: string
  description: string
  icon: React.ComponentType<any>
  duration: string
  color: string
  steps: TutorialStep[]
  completionCriteria: string
}

interface TutorialStep {
  id: string
  title: string
  description: string
  action?: string
  href?: string
  highlight?: string
}

const tutorialPhases: TutorialPhase[] = [
  {
    id: 1,
    title: "Welcome & System Overview",
    description: "Orient yourself to SalarySync and understand the workflow",
    icon: Play,
    duration: "3-5 min",
    color: "bg-blue-500",
    completionCriteria: "Complete dashboard tour and navigation overview",
    steps: [
      {
        id: "welcome",
        title: "Welcome to SalarySync",
        description: "Learn about Dutch payroll compliance features and set expectations",
        action: "Continue"
      },
      {
        id: "dashboard-tour",
        title: "Dashboard Overview",
        description: "Explore the main dashboard layout and key metrics",
        highlight: "dashboard-metrics"
      },
      {
        id: "navigation-tour",
        title: "Navigation Structure",
        description: "Understand the 5 main groups and logical workflow",
        highlight: "sidebar-navigation"
      }
    ]
  },
  {
    id: 2,
    title: "Business Setup",
    description: "Configure company information and tax settings",
    icon: Building2,
    duration: "5-7 min",
    color: "bg-green-500",
    completionCriteria: "Company configured for Dutch payroll compliance",
    steps: [
      {
        id: "company-info",
        title: "Company Information",
        description: "Fill in basic company details and Dutch business requirements",
        action: "Go to Company Settings",
        href: "/dashboard/company"
      },
      {
        id: "tax-settings",
        title: "Tax Configuration",
        description: "Review Dutch tax components (AOW, WLZ, WW, WIA, ZVW) and 2025 rates",
        action: "Review Tax Settings",
        href: "/dashboard/tax-settings"
      },
      {
        id: "account-settings",
        title: "Account Preferences",
        description: "Set language, notifications, and security features",
        action: "Configure Settings",
        href: "/dashboard/settings"
      }
    ]
  },
  {
    id: 3,
    title: "People Management",
    description: "Add employees and understand workforce management",
    icon: Users,
    duration: "8-10 min",
    color: "bg-purple-500",
    completionCriteria: "At least one employee added and properly configured",
    steps: [
      {
        id: "employee-overview",
        title: "Employee Management Overview",
        description: "Learn about employee types, BSN requirements, and import/export capabilities",
        action: "Go to Employees",
        href: "/dashboard/employees"
      },
      {
        id: "add-employee",
        title: "Add First Employee",
        description: "Fill in required Dutch employee information including personal details, employment info, and tax data",
        highlight: "add-employee-form"
      },
      {
        id: "leave-management",
        title: "Leave Management",
        description: "Understand Dutch vacation requirements and how leave affects payroll",
        action: "Explore Leave Management",
        href: "/dashboard/leave-management"
      }
    ]
  },
  {
    id: 4,
    title: "Payroll Processing",
    description: "Run first payroll and understand calculations",
    icon: Calculator,
    duration: "10-12 min",
    color: "bg-orange-500",
    completionCriteria: "First payroll successfully processed and understood",
    steps: [
      {
        id: "payroll-overview",
        title: "Payroll Overview",
        description: "Learn about payroll periods, Dutch monthly requirements, and employee selection",
        action: "Go to Payroll",
        href: "/payroll"
      },
      {
        id: "first-payroll",
        title: "Process First Payroll",
        description: "Select employees, review calculations, and understand Dutch tax components",
        highlight: "payroll-calculation"
      },
      {
        id: "payroll-results",
        title: "Review Results",
        description: "Understand payslip components, export capabilities, and record keeping",
        highlight: "payroll-results"
      }
    ]
  },
  {
    id: 5,
    title: "Monitoring & Management",
    description: "Understand ongoing operations and business insights",
    icon: BarChart3,
    duration: "5-7 min",
    color: "bg-indigo-500",
    completionCriteria: "Understand ongoing operations and monitoring",
    steps: [
      {
        id: "analytics",
        title: "Analytics & Insights",
        description: "Explore payroll cost trends and key performance indicators",
        action: "View Analytics",
        href: "/dashboard/analytics"
      },
      {
        id: "reports",
        title: "Reports Overview",
        description: "Learn about different report types and export formats",
        action: "View Reports",
        href: "/dashboard/reports"
      },
      {
        id: "ongoing-ops",
        title: "Ongoing Operations",
        description: "Understand daily/monthly workflow and next steps",
        action: "Return to Dashboard",
        href: "/dashboard"
      }
    ]
  }
]

export function TutorialSystem({ isOpen, onClose, startPhase = 1 }: TutorialSystemProps) {
  const [currentPhase, setCurrentPhase] = useState(startPhase)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set())
  const [isMinimized, setIsMinimized] = useState(false)
  const router = useRouter()

  const phase = tutorialPhases.find(p => p.id === currentPhase)
  const step = phase?.steps[currentStep]
  const totalSteps = tutorialPhases.reduce((acc, phase) => acc + phase.steps.length, 0)
  const currentStepNumber = tutorialPhases
    .slice(0, currentPhase - 1)
    .reduce((acc, phase) => acc + phase.steps.length, 0) + currentStep + 1
  const progress = (currentStepNumber / totalSteps) * 100

  const nextStep = () => {
    if (!phase) return
    
    if (currentStep < phase.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete current phase
      setCompletedPhases(prev => new Set([...prev, currentPhase]))
      
      // Move to next phase
      if (currentPhase < tutorialPhases.length) {
        setCurrentPhase(currentPhase + 1)
        setCurrentStep(0)
      } else {
        // Tutorial complete
        onClose()
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else if (currentPhase > 1) {
      const prevPhase = tutorialPhases.find(p => p.id === currentPhase - 1)
      if (prevPhase) {
        setCurrentPhase(currentPhase - 1)
        setCurrentStep(prevPhase.steps.length - 1)
      }
    }
  }

  const jumpToPhase = (phaseId: number) => {
    setCurrentPhase(phaseId)
    setCurrentStep(0)
  }

  const handleAction = () => {
    if (step?.href) {
      router.push(step.href)
      setIsMinimized(true)
    } else {
      nextStep()
    }
  }

  if (!isOpen) return null

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 shadow-lg border-2 border-blue-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={cn("w-3 h-3 rounded-full", phase?.color)} />
                <span className="text-sm font-medium">Tutorial Active</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setIsMinimized(false)}
                >
                  <Target className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xs text-gray-600 mb-2">
              Phase {currentPhase}: {phase?.title}
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">
                Step {currentStepNumber} of {totalSteps}
              </span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setIsMinimized(false)}
              >
                Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">SalarySync Tutorial</h2>
                <p className="text-blue-100">Master Dutch payroll compliance step by step</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white hover:bg-opacity-20"
                onClick={() => setIsMinimized(true)}
              >
                <Target className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white hover:bg-opacity-20"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="bg-blue-500 bg-opacity-30" />
          </div>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Phase Navigation */}
          <div className="w-80 bg-gray-50 border-r overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Tutorial Phases</h3>
              <div className="space-y-2">
                {tutorialPhases.map((tutorialPhase) => (
                  <button
                    key={tutorialPhase.id}
                    onClick={() => jumpToPhase(tutorialPhase.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all duration-200",
                      currentPhase === tutorialPhase.id
                        ? "bg-blue-100 border-2 border-blue-300"
                        : "bg-white border border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                        tutorialPhase.color,
                        completedPhases.has(tutorialPhase.id) && "bg-green-500"
                      )}>
                        {completedPhases.has(tutorialPhase.id) ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <tutorialPhase.icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{tutorialPhase.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            {tutorialPhase.duration}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {tutorialPhase.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Current Phase Header */}
            <div className="p-6 border-b bg-white">
              <div className="flex items-center space-x-3 mb-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", phase?.color)}>
                  {phase?.icon && <phase.icon className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Phase {currentPhase}: {phase?.title}</h3>
                  <p className="text-gray-600">{phase?.description}</p>
                </div>
              </div>
              
              {/* Step Progress */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Step {currentStep + 1} of {phase?.steps.length}</span>
                    <span>{phase?.duration}</span>
                  </div>
                  <Progress value={((currentStep + 1) / (phase?.steps.length || 1)) * 100} />
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {step && (
                <div className="max-w-2xl">
                  <h4 className="text-xl font-semibold mb-4">{step.title}</h4>
                  <p className="text-gray-700 mb-6 leading-relaxed">{step.description}</p>
                  
                  {/* Step-specific content */}
                  {step.id === "welcome" && (
                    <div className="bg-blue-50 p-6 rounded-lg mb-6">
                      <h5 className="font-semibold text-blue-900 mb-3">What you'll learn:</h5>
                      <ul className="space-y-2 text-blue-800">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Complete Dutch payroll compliance setup</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Employee management and tax calculations</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Payroll processing and reporting</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>Ongoing operations and monitoring</span>
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* Completion Criteria */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Phase Goal:</h5>
                    <p className="text-gray-700 text-sm">{phase?.completionCriteria}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentPhase === 1 && currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Step {currentStepNumber} of {totalSteps}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {step?.href && (
                  <Button variant="outline" onClick={handleAction}>
                    {step.action || "Go"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
                <Button onClick={nextStep}>
                  {currentPhase === tutorialPhases.length && currentStep === (phase?.steps.length || 1) - 1
                    ? "Complete Tutorial"
                    : "Next"
                  }
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

