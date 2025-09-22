'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { TestTube, Database, Info, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataModeToggleProps {
  isDemoMode: boolean
  onToggle: (isDemoMode: boolean) => void
  className?: string
}

export function DataModeToggle({ isDemoMode, onToggle, className }: DataModeToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = async () => {
    setIsAnimating(true)
    
    // Add a small delay for smooth animation
    setTimeout(() => {
      onToggle(!isDemoMode)
      setIsAnimating(false)
    }, 200)
  }

  return (
    <div className={cn("flex items-center space-x-4", className)}>
      {/* Mode Indicator Badge */}
      <div className={cn(
        "flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-300",
        isDemoMode 
          ? "bg-amber-50 border-amber-200 text-amber-800" 
          : "bg-green-50 border-green-200 text-green-800"
      )}>
        {isDemoMode ? (
          <TestTube className="w-4 h-4" />
        ) : (
          <Database className="w-4 h-4" />
        )}
        <span className="font-medium text-sm">
          {isDemoMode ? 'Demo Data' : 'Live Data'}
        </span>
        <Badge 
          variant={isDemoMode ? "secondary" : "default"}
          className={cn(
            "text-xs",
            isDemoMode 
              ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
              : "bg-green-100 text-green-700 hover:bg-green-200"
          )}
        >
          {isDemoMode ? 'Sandbox' : 'Production'}
        </Badge>
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Demo</span>
        <Switch
          checked={!isDemoMode}
          onCheckedChange={() => handleToggle()}
          disabled={isAnimating}
          className="data-[state=checked]:bg-green-600"
        />
        <span className="text-sm text-gray-600">Live</span>
      </div>

      {/* Quick Switch Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={isAnimating}
        className={cn(
          "transition-all duration-200",
          isDemoMode 
            ? "border-green-200 text-green-700 hover:bg-green-50" 
            : "border-amber-200 text-amber-700 hover:bg-amber-50"
        )}
      >
        {isAnimating ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {isDemoMode ? (
              <>
                Switch to Live
                <ArrowRight className="w-3 h-3 ml-1" />
              </>
            ) : (
              <>
                Switch to Demo
                <ArrowRight className="w-3 h-3 ml-1" />
              </>
            )}
          </>
        )}
      </Button>
    </div>
  )
}

// Banner component similar to Stripe's sandbox banner
interface DataModeBannerProps {
  isDemoMode: boolean
  onSwitchToLive?: () => void
  className?: string
}

export function DataModeBanner({ isDemoMode, onSwitchToLive, className }: DataModeBannerProps) {
  if (!isDemoMode) return null

  return (
    <div className={cn(
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 text-center",
      className
    )}>
      <div className="flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <TestTube className="w-4 h-4" />
          <span className="font-medium">Demo Mode</span>
        </div>
        
        <span className="text-amber-100">
          You're exploring with sample data—your place to experiment with SalarySync functionality.
        </span>
        
        {onSwitchToLive && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onSwitchToLive}
            className="bg-white text-amber-700 hover:bg-amber-50 font-medium"
          >
            Switch to live data
          </Button>
        )}
      </div>
    </div>
  )
}

// Context for managing data mode across the app
import { createContext, useContext, ReactNode } from 'react'

interface DataModeContextType {
  isDemoMode: boolean
  setDemoMode: (isDemoMode: boolean) => void
  toggleDataMode: () => void
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined)

export function DataModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(true) // Start with demo mode

  // Load saved preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('salarysync-data-mode')
    if (saved !== null) {
      setIsDemoMode(saved === 'demo')
    }
  }, [])

  // Save preference to localStorage
  const setDemoMode = (isDemoMode: boolean) => {
    setIsDemoMode(isDemoMode)
    localStorage.setItem('salarysync-data-mode', isDemoMode ? 'demo' : 'live')
  }

  const toggleDataMode = () => {
    setDemoMode(!isDemoMode)
  }

  return (
    <DataModeContext.Provider value={{ isDemoMode, setDemoMode, toggleDataMode }}>
      {children}
    </DataModeContext.Provider>
  )
}

export function useDataMode() {
  const context = useContext(DataModeContext)
  if (context === undefined) {
    throw new Error('useDataMode must be used within a DataModeProvider')
  }
  
  return {
    isDemoMode: context.isDemoMode,
    setDemoMode: context.setDemoMode,
    toggleDemoMode: context.toggleDataMode
  }
}
