import { cn } from "@/lib/utils"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface LoadingProgressProps {
  steps: Array<{
    id: string
    label: string
    status: 'pending' | 'loading' | 'completed' | 'error'
  }>
  className?: string
}

export function LoadingProgress({ steps, className }: LoadingProgressProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center space-x-3">
          {/* Status Icon */}
          <div className="flex-shrink-0">
            {step.status === 'pending' && (
              <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-gray-100" />
            )}
            {step.status === 'loading' && (
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            )}
            {step.status === 'completed' && (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
            {step.status === 'error' && (
              <AlertCircle className="w-6 h-6 text-red-600" />
            )}
          </div>

          {/* Step Label */}
          <div className="flex-1">
            <p className={cn(
              "text-sm font-medium",
              step.status === 'completed' && "text-green-700",
              step.status === 'loading' && "text-blue-700",
              step.status === 'error' && "text-red-700",
              step.status === 'pending' && "text-gray-500"
            )}>
              {step.label}
            </p>
          </div>

          {/* Progress Line */}
          {index < steps.length - 1 && (
            <div className="absolute left-3 mt-8 w-0.5 h-6 bg-gray-200" />
          )}
        </div>
      ))}
    </div>
  )
}

interface ProgressBarProps {
  progress: number
  label?: string
  className?: string
  showPercentage?: boolean
}

export function ProgressBar({ 
  progress, 
  label, 
  className, 
  showPercentage = true 
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)
  
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  )
}

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Loader2 className={cn("animate-spin text-blue-600", sizeClasses[size])} />
      {label && (
        <span className="text-sm text-gray-600">{label}</span>
      )}
    </div>
  )
}

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
  progress?: number
  className?: string
}

export function LoadingOverlay({ 
  isVisible, 
  message = "Loading...", 
  progress,
  className 
}: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className={cn(
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",
      className
    )}>
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 space-y-4">
        <div className="flex items-center space-x-3">
          <Spinner size="lg" />
          <span className="text-lg font-medium">{message}</span>
        </div>
        
        {typeof progress === 'number' && (
          <ProgressBar progress={progress} showPercentage />
        )}
      </div>
    </div>
  )
}

