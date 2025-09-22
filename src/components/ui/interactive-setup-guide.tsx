'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  X, 
  Minimize2, 
  Maximize2, 
  Users, 
  Calculator, 
  FileText, 
  CheckCircle2, 
  Circle,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react'
import { cn } from "@/lib/utils"

interface SetupStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  completed: boolean
  expanded: boolean
  substeps: {
    id: string
    text: string
    completed: boolean
    targetElement?: string // CSS selector for highlighting
    action?: () => void
  }[]
}

interface InteractiveSetupGuideProps {
  isOpen: boolean
  onClose: () => void
  onMinimize?: () => void
  className?: string
}

export function InteractiveSetupGuide({ 
  isOpen, 
  onClose, 
  onMinimize,
  className 
}: InteractiveSetupGuideProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null)
  
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: 'employees',
      title: 'Add your first employee',
      description: 'Set up your team to start processing payroll',
      icon: Users,
      completed: false,
      expanded: true,
      substeps: [
        {
          id: 'nav-employees',
          text: 'Navigate to "Employees" in the sidebar',
          completed: false,
          targetElement: '[href="/dashboard/employees"]',
          action: () => highlightElement('[href="/dashboard/employees"]')
        },
        {
          id: 'click-add',
          text: 'Click "Add New Employee" button',
          completed: false,
          targetElement: '.add-employee-btn'
        },
        {
          id: 'fill-details',
          text: 'Fill in employee details and save',
          completed: false
        }
      ]
    },
    {
      id: 'payroll',
      title: 'Process your first payroll',
      description: 'Calculate and process monthly payroll',
      icon: Calculator,
      completed: false,
      expanded: false,
      substeps: [
        {
          id: 'nav-payroll',
          text: 'Go to "Payroll Operations" in sidebar',
          completed: false,
          targetElement: '[data-section="payroll"]',
          action: () => highlightElement('[data-section="payroll"]')
        },
        {
          id: 'select-employees',
          text: 'Select employees for payroll run',
          completed: false
        },
        {
          id: 'review-process',
          text: 'Review calculations and process',
          completed: false
        }
      ]
    },
    {
      id: 'reports',
      title: 'Generate compliance reports',
      description: 'Download required tax and compliance documents',
      icon: FileText,
      completed: false,
      expanded: false,
      substeps: [
        {
          id: 'nav-reports',
          text: 'Visit "Reports" section',
          completed: false,
          targetElement: '[href="/dashboard/reports"]',
          action: () => highlightElement('[href="/dashboard/reports"]')
        },
        {
          id: 'select-report',
          text: 'Choose report type (Tax, Payroll, etc.)',
          completed: false
        },
        {
          id: 'download-reports',
          text: 'Generate and download documents',
          completed: false
        }
      ]
    }
  ])

  const highlightElement = (selector: string) => {
    setHighlightedElement(selector)
    
    // Add highlight class to element
    const element = document.querySelector(selector)
    if (element) {
      element.classList.add('setup-guide-highlight')
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        element.classList.remove('setup-guide-highlight')
        setHighlightedElement(null)
      }, 3000)
    }
  }

  const toggleStepExpansion = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, expanded: !step.expanded }
        : step
    ))
  }

  const markSubstepCompleted = (stepId: string, substepId: string) => {
    setSteps(prev => prev.map(step => {
      if (step.id === stepId) {
        const updatedSubsteps = step.substeps.map(substep =>
          substep.id === substepId 
            ? { ...substep, completed: true }
            : substep
        )
        
        // Check if all substeps are completed
        const allCompleted = updatedSubsteps.every(substep => substep.completed)
        
        return {
          ...step,
          substeps: updatedSubsteps,
          completed: allCompleted
        }
      }
      return step
    }))
  }

  const completedSteps = steps.filter(step => step.completed).length
  const totalSteps = steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  if (!isOpen) return null

  return (
    <>
      {/* Highlight overlay styles */}
      <style jsx global>{`
        .setup-guide-highlight {
          position: relative;
          z-index: 1000;
        }
        
        .setup-guide-highlight::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: rgba(59, 130, 246, 0.2);
          border: 2px solid #3B82F6;
          border-radius: 8px;
          pointer-events: none;
          animation: pulse-highlight 2s infinite;
        }
        
        @keyframes pulse-highlight {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>

      {/* Setup Guide Floating Panel */}
      <div className={cn(
        "fixed right-6 top-20 w-80 z-50 transition-all duration-300",
        isMinimized ? "h-16" : "h-auto max-h-[calc(100vh-6rem)]",
        className
      )}>
        <Card className="shadow-xl border-2 border-blue-200 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-lg">Setup guide</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {completedSteps}/{totalSteps}
                </Badge>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {!isMinimized && (
              <div className="space-y-2">
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-sm text-gray-600">
                  Complete your payroll system setup
                </p>
              </div>
            )}
          </CardHeader>

          {!isMinimized && (
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {steps.map((step) => (
                <div key={step.id} className="space-y-2">
                  <div 
                    className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => toggleStepExpansion(step.id)}
                  >
                    <div className="flex items-center space-x-3">
                      {step.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                      <step.icon className="h-4 w-4 text-blue-600" />
                      <span className={cn(
                        "font-medium text-sm",
                        step.completed ? "text-green-700 line-through" : "text-gray-900"
                      )}>
                        {step.title}
                      </span>
                    </div>
                    {step.expanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>

                  {step.expanded && (
                    <div className="ml-8 space-y-2">
                      <p className="text-xs text-gray-600 mb-3">{step.description}</p>
                      {step.substeps.map((substep) => (
                        <div 
                          key={substep.id}
                          className={cn(
                            "flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors",
                            substep.action ? "hover:bg-blue-50" : ""
                          )}
                          onClick={() => {
                            if (substep.action) {
                              substep.action()
                            }
                            if (!substep.completed) {
                              markSubstepCompleted(step.id, substep.id)
                            }
                          }}
                        >
                          {substep.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                          <span className={cn(
                            "text-sm flex-1",
                            substep.completed ? "text-green-700 line-through" : "text-gray-700"
                          )}>
                            {substep.text}
                          </span>
                          {substep.action && !substep.completed && (
                            <ArrowRight className="h-3 w-3 text-blue-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {completedSteps === totalSteps && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Setup Complete!</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Your payroll system is ready to use. You can now manage employees and process payroll.
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </>
  )
}
