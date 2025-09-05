// Enhanced Loading States with Advanced User Feedback
// Provides sophisticated loading experiences for better UX

import { cn } from "@/lib/utils"
import { Loader2, CheckCircle, AlertCircle, Clock, Database, Users, Calculator, FileText } from "lucide-react"
import { useState, useEffect } from "react"

interface LoadingStep {
  id: string
  label: string
  description?: string
  status: 'pending' | 'loading' | 'completed' | 'error'
  duration?: number // Expected duration in ms
  icon?: React.ReactNode
}

interface EnhancedLoadingProgressProps {
  steps: LoadingStep[]
  className?: string
  showEstimatedTime?: boolean
}

export function EnhancedLoadingProgress({ 
  steps, 
  className, 
  showEstimatedTime = true 
}: EnhancedLoadingProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 100)

    return () => clearInterval(interval)
  }, [startTime])

  const completedSteps = steps.filter(step => step.status === 'completed').length
  const totalSteps = steps.length
  const progress = (completedSteps / totalSteps) * 100

  const estimatedTotal = steps.reduce((sum, step) => sum + (step.duration || 1000), 0)
  const estimatedRemaining = Math.max(0, estimatedTotal - elapsedTime)

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Processing...</h3>
          <span className="text-sm text-gray-500">
            {completedSteps} of {totalSteps} completed
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {showEstimatedTime && estimatedRemaining > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Estimated time remaining: {Math.ceil(estimatedRemaining / 1000)}s</span>
          </div>
        )}
      </div>

      {/* Step Details */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            <div className={cn(
              "flex items-start space-x-4 p-4 rounded-lg border transition-all duration-300",
              step.status === 'completed' && "bg-green-50 border-green-200",
              step.status === 'loading' && "bg-blue-50 border-blue-200 shadow-sm",
              step.status === 'error' && "bg-red-50 border-red-200",
              step.status === 'pending' && "bg-gray-50 border-gray-200"
            )}>
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {step.status === 'pending' && (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                    {step.icon || <span className="text-xs text-gray-500">{index + 1}</span>}
                  </div>
                )}
                {step.status === 'loading' && (
                  <div className="relative">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    {step.icon && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 text-blue-600">
                          {step.icon}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {step.status === 'completed' && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
                {step.status === 'error' && (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={cn(
                    "text-sm font-medium",
                    step.status === 'completed' && "text-green-800",
                    step.status === 'loading' && "text-blue-800",
                    step.status === 'error' && "text-red-800",
                    step.status === 'pending' && "text-gray-600"
                  )}>
                    {step.label}
                  </h4>
                  
                  {step.status === 'loading' && step.duration && (
                    <div className="text-xs text-gray-500">
                      ~{Math.ceil(step.duration / 1000)}s
                    </div>
                  )}
                </div>
                
                {step.description && (
                  <p className="text-xs text-gray-600 mt-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Connection Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-7 top-16 w-0.5 h-4 bg-gray-200" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Payroll-specific loading states
export function PayrollCalculationLoader({ 
  employeeName, 
  period,
  className 
}: { 
  employeeName: string
  period: string
  className?: string 
}) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps: LoadingStep[] = [
    {
      id: 'employee-data',
      label: 'Loading employee data',
      description: `Fetching information for ${employeeName}`,
      status: 'loading',
      duration: 1000,
      icon: <Users className="w-3 h-3" />
    },
    {
      id: 'salary-calculation',
      label: 'Calculating salary',
      description: `Computing gross salary for ${period}`,
      status: 'pending',
      duration: 1500,
      icon: <Calculator className="w-3 h-3" />
    },
    {
      id: 'tax-calculation',
      label: 'Processing tax deductions',
      description: 'Applying Dutch tax regulations',
      status: 'pending',
      duration: 2000,
      icon: <FileText className="w-3 h-3" />
    },
    {
      id: 'compliance-check',
      label: 'Compliance verification',
      description: 'Ensuring legal compliance',
      status: 'pending',
      duration: 1000,
      icon: <CheckCircle className="w-3 h-3" />
    }
  ]

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = []
    
    steps.forEach((step, index) => {
      const delay = steps.slice(0, index).reduce((sum, s) => sum + (s.duration || 1000), 0)
      
      intervals.push(setTimeout(() => {
        setCurrentStep(index)
      }, delay))
    })

    return () => intervals.forEach(clearTimeout)
  }, [])

  const updatedSteps = steps.map((step, index) => ({
    ...step,
    status: index < currentStep ? 'completed' : index === currentStep ? 'loading' : 'pending'
  })) as LoadingStep[]

  return (
    <div className={cn("max-w-md mx-auto", className)}>
      <EnhancedLoadingProgress steps={updatedSteps} />
    </div>
  )
}

// Dashboard loading state
export function DashboardLoader({ className }: { className?: string }) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps: LoadingStep[] = [
    {
      id: 'database-connection',
      label: 'Connecting to database',
      description: 'Establishing secure connection',
      status: 'loading',
      duration: 800,
      icon: <Database className="w-3 h-3" />
    },
    {
      id: 'employee-stats',
      label: 'Loading employee statistics',
      description: 'Fetching employee data',
      status: 'pending',
      duration: 1200,
      icon: <Users className="w-3 h-3" />
    },
    {
      id: 'payroll-data',
      label: 'Processing payroll data',
      description: 'Calculating recent payroll metrics',
      status: 'pending',
      duration: 1500,
      icon: <Calculator className="w-3 h-3" />
    }
  ]

  useEffect(() => {
    const intervals: NodeJS.Timeout[] = []
    
    steps.forEach((step, index) => {
      const delay = steps.slice(0, index).reduce((sum, s) => sum + (s.duration || 1000), 0)
      
      intervals.push(setTimeout(() => {
        setCurrentStep(index)
      }, delay))
    })

    return () => intervals.forEach(clearTimeout)
  }, [])

  const updatedSteps = steps.map((step, index) => ({
    ...step,
    status: index < currentStep ? 'completed' : index === currentStep ? 'loading' : 'pending'
  })) as LoadingStep[]

  return (
    <div className={cn("max-w-lg mx-auto", className)}>
      <EnhancedLoadingProgress steps={updatedSteps} />
    </div>
  )
}

// Smart loading skeleton with shimmer effect
export function SmartSkeleton({ 
  className, 
  variant = 'default',
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { 
  variant?: 'default' | 'text' | 'circular' | 'rectangular' 
}) {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"
  
  const variantClasses = {
    default: "rounded-md",
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-none"
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        "animate-[shimmer_2s_ease-in-out_infinite]",
        className
      )}
      style={{
        animation: 'shimmer 2s ease-in-out infinite',
        backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%'
      }}
      {...props}
    />
  )
}

// Adaptive loading state that changes based on content type
interface AdaptiveLoaderProps {
  type: 'dashboard' | 'employees' | 'payroll' | 'form' | 'table'
  itemCount?: number
  className?: string
}

export function AdaptiveLoader({ type, itemCount = 5, className }: AdaptiveLoaderProps) {
  switch (type) {
    case 'dashboard':
      return (
        <div className={cn("space-y-6", className)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <SmartSkeleton className="h-4 w-20" variant="text" />
                  <SmartSkeleton className="h-5 w-5" variant="circular" />
                </div>
                <SmartSkeleton className="h-8 w-16" variant="text" />
                <SmartSkeleton className="h-3 w-24" variant="text" />
              </div>
            ))}
          </div>
        </div>
      )

    case 'employees':
      return (
        <div className={cn("space-y-4", className)}>
          {[...Array(itemCount)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <SmartSkeleton className="h-12 w-12" variant="circular" />
                <div className="flex-1 space-y-2">
                  <SmartSkeleton className="h-4 w-32" variant="text" />
                  <SmartSkeleton className="h-3 w-24" variant="text" />
                </div>
                <SmartSkeleton className="h-8 w-20" variant="rectangular" />
              </div>
            </div>
          ))}
        </div>
      )

    case 'payroll':
      return (
        <div className={cn("space-y-6", className)}>
          <div className="border rounded-lg p-6 space-y-4">
            <SmartSkeleton className="h-6 w-48" variant="text" />
            <div className="grid grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <SmartSkeleton className="h-3 w-20" variant="text" />
                  <SmartSkeleton className="h-8 w-full" variant="rectangular" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'form':
      return (
        <div className={cn("space-y-6", className)}>
          {[...Array(itemCount)].map((_, i) => (
            <div key={i} className="space-y-2">
              <SmartSkeleton className="h-4 w-24" variant="text" />
              <SmartSkeleton className="h-10 w-full" variant="rectangular" />
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            <SmartSkeleton className="h-10 w-20" variant="rectangular" />
            <SmartSkeleton className="h-10 w-20" variant="rectangular" />
          </div>
        </div>
      )

    case 'table':
      return (
        <div className={cn("space-y-4", className)}>
          <div className="grid grid-cols-4 gap-4 pb-2 border-b">
            {[...Array(4)].map((_, i) => (
              <SmartSkeleton key={i} className="h-4 w-full" variant="text" />
            ))}
          </div>
          {[...Array(itemCount)].map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, j) => (
                <SmartSkeleton key={j} className="h-8 w-full" variant="rectangular" />
              ))}
            </div>
          ))}
        </div>
      )

    default:
      return <SmartSkeleton className={cn("h-32 w-full", className)} />
  }
}

// CSS for shimmer animation (add to global styles)
export const shimmerStyles = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
`

