// Advanced Navigation Feedback Components
// Provides immediate visual feedback for all navigation interactions

import { useState, useEffect, useRef } from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { Loader2, ArrowRight, ExternalLink, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationFeedbackProps extends ButtonProps {
  href?: string
  external?: boolean
  showArrow?: boolean
  rippleEffect?: boolean
  hoverScale?: boolean
  loadingText?: string
  children: React.ReactNode
}

export function NavigationButton({
  href,
  external = false,
  showArrow = false,
  rippleEffect = true,
  hoverScale = true,
  loadingText = "Navigating...",
  children,
  className,
  onClick,
  ...props
}: NavigationFeedbackProps) {
  const [isNavigating, setIsNavigating] = useState(false)
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  const buttonRef = useRef<HTMLButtonElement>(null)
  const rippleIdRef = useRef(0)

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Create ripple effect
    if (rippleEffect && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const newRipple = {
        id: rippleIdRef.current++,
        x,
        y
      }
      
      setRipples(prev => [...prev, newRipple])
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id))
      }, 600)
    }

    // Handle navigation
    if (href) {
      setIsNavigating(true)
      
      // Add small delay for visual feedback
      setTimeout(() => {
        if (external) {
          window.open(href, '_blank', 'noopener,noreferrer')
        } else {
          window.location.href = href
        }
        setIsNavigating(false)
      }, 150)
    }

    // Call custom onClick if provided
    if (onClick) {
      onClick(e)
    }
  }

  return (
    <Button
      ref={buttonRef}
      {...props}
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        hoverScale && "hover:scale-105 active:scale-95",
        isNavigating && "opacity-75",
        className
      )}
      disabled={props.disabled || isNavigating}
      onClick={handleClick}
    >
      {/* Ripple effects */}
      {rippleEffect && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animationDuration: '0.6s'
          }}
        />
      ))}

      {/* Button content */}
      <span className="relative flex items-center">
        {isNavigating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        
        {!isNavigating && (
          <>
            {children}
            {showArrow && !external && <ChevronRight className="w-4 h-4 ml-2" />}
            {showArrow && external && <ExternalLink className="w-4 h-4 ml-2" />}
          </>
        )}
        
        {isNavigating && loadingText}
      </span>
    </Button>
  )
}

// Interactive card with navigation feedback
interface InteractiveCardProps {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
  hoverEffect?: boolean
  pressEffect?: boolean
  glowEffect?: boolean
}

export function InteractiveCard({
  href,
  onClick,
  children,
  className,
  hoverEffect = true,
  pressEffect = true,
  glowEffect = false,
  ...props
}: InteractiveCardProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseDown = () => setIsPressed(true)
  const handleMouseUp = () => setIsPressed(false)
  const handleMouseLeave = () => {
    setIsPressed(false)
    setIsHovered(false)
  }

  const handleClick = () => {
    if (href) {
      window.location.href = href
    }
    if (onClick) {
      onClick()
    }
  }

  const isClickable = href || onClick

  return (
    <div
      className={cn(
        "border rounded-lg transition-all duration-200",
        isClickable && "cursor-pointer",
        hoverEffect && isHovered && "shadow-lg border-blue-300",
        pressEffect && isPressed && "scale-98 shadow-sm",
        glowEffect && isHovered && "shadow-blue-500/25",
        className
      )}
      onMouseDown={isClickable ? handleMouseDown : undefined}
      onMouseUp={isClickable ? handleMouseUp : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={isClickable ? handleClick : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

// Breadcrumb with navigation feedback
interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function InteractiveBreadcrumb({ items, className }: BreadcrumbProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          )}
          
          {item.href && !item.active ? (
            <NavigationButton
              href={item.href}
              variant="ghost"
              size="sm"
              className={cn(
                "h-auto p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50",
                hoveredIndex === index && "underline"
              )}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              rippleEffect={false}
              hoverScale={false}
            >
              {item.label}
            </NavigationButton>
          ) : (
            <span className={cn(
              "px-1",
              item.active ? "text-gray-900 font-medium" : "text-gray-500"
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}

// Tab navigation with smooth transitions
interface TabItem {
  id: string
  label: string
  content?: React.ReactNode
  disabled?: boolean
}

interface TabNavigationProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

export function TabNavigation({ 
  tabs, 
  activeTab, 
  onTabChange, 
  className 
}: TabNavigationProps) {
  const [indicatorStyle, setIndicatorStyle] = useState<{ width: number; left: number }>({ width: 0, left: 0 })
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})

  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab]
    if (activeTabElement) {
      setIndicatorStyle({
        width: activeTabElement.offsetWidth,
        left: activeTabElement.offsetLeft
      })
    }
  }, [activeTab])

  return (
    <div className={cn("relative", className)}>
      {/* Tab buttons */}
      <div className="flex space-x-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[tab.id] = el }}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-all duration-200 relative",
              "hover:text-blue-600 hover:bg-blue-50 rounded-t-lg",
              activeTab === tab.id 
                ? "text-blue-600 bg-blue-50" 
                : "text-gray-600",
              tab.disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active indicator */}
      <div
        className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-out"
        style={{
          width: indicatorStyle.width,
          left: indicatorStyle.left
        }}
      />
    </div>
  )
}

// Loading state for navigation
export function NavigationLoader({ message = "Loading page..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex items-center space-x-3 bg-white rounded-lg shadow-lg p-6">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="text-gray-700 font-medium">{message}</span>
      </div>
    </div>
  )
}

// Hover preview for navigation items
interface HoverPreviewProps {
  trigger: React.ReactNode
  preview: React.ReactNode
  delay?: number
  className?: string
}

export function HoverPreview({ 
  trigger, 
  preview, 
  delay = 500, 
  className 
}: HoverPreviewProps) {
  const [showPreview, setShowPreview] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setShowPreview(true)
    }, delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setShowPreview(false)
  }

  return (
    <div 
      className={cn("relative", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {trigger}
      
      {showPreview && (
        <div className="absolute top-full left-0 mt-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="bg-white border rounded-lg shadow-lg p-4 max-w-sm">
            {preview}
          </div>
        </div>
      )}
    </div>
  )
}

