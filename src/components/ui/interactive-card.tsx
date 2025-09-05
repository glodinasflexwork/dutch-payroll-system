import { useState } from "react"
import { Card, CardProps } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface InteractiveCardProps extends CardProps {
  onClick?: () => void | Promise<void>
  href?: string
  isClickable?: boolean
  hoverEffect?: 'lift' | 'glow' | 'scale' | 'none'
  clickEffect?: boolean
  disabled?: boolean
}

export function InteractiveCard({
  onClick,
  href,
  isClickable = true,
  hoverEffect = 'lift',
  clickEffect = true,
  disabled = false,
  children,
  className,
  ...props
}: InteractiveCardProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (disabled || isLoading) return

    if (onClick) {
      setIsLoading(true)
      try {
        await onClick()
      } finally {
        setIsLoading(false)
      }
    }

    if (href) {
      window.location.href = href
    }
  }

  const handleMouseDown = () => {
    if (clickEffect && !disabled) {
      setIsPressed(true)
    }
  }

  const handleMouseUp = () => {
    setIsPressed(false)
  }

  const handleMouseLeave = () => {
    setIsPressed(false)
  }

  const getHoverClasses = () => {
    if (!isClickable || disabled) return ""

    switch (hoverEffect) {
      case 'lift':
        return "hover:shadow-lg hover:-translate-y-1"
      case 'glow':
        return "hover:shadow-xl hover:shadow-blue-500/25"
      case 'scale':
        return "hover:scale-105"
      case 'none':
        return ""
      default:
        return "hover:shadow-lg hover:-translate-y-1"
    }
  }

  const getClickClasses = () => {
    if (!clickEffect || disabled) return ""
    return isPressed ? "scale-95" : ""
  }

  const getCursorClass = () => {
    if (disabled) return "cursor-not-allowed opacity-50"
    if (isClickable && (onClick || href)) return "cursor-pointer"
    return ""
  }

  return (
    <Card
      {...props}
      className={cn(
        "transition-all duration-200 ease-out",
        getHoverClasses(),
        getClickClasses(),
        getCursorClass(),
        isLoading && "opacity-75",
        className
      )}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </Card>
  )
}

// Quick action card with icon and description
interface QuickActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick?: () => void | Promise<void>
  href?: string
  badge?: string
  disabled?: boolean
  className?: string
}

export function QuickActionCard({
  title,
  description,
  icon,
  onClick,
  href,
  badge,
  disabled = false,
  className
}: QuickActionCardProps) {
  return (
    <InteractiveCard
      onClick={onClick}
      href={href}
      disabled={disabled}
      className={cn("p-6", className)}
      hoverEffect="lift"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h3>
            {badge && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </InteractiveCard>
  )
}

// Stats card with animation
interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon: React.ReactNode
  onClick?: () => void
  className?: string
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  onClick,
  className
}: StatsCardProps) {
  return (
    <InteractiveCard
      onClick={onClick}
      isClickable={!!onClick}
      className={cn("p-6", className)}
      hoverEffect={onClick ? "lift" : "none"}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {change && (
            <div className="flex items-center">
              <span className={cn(
                "text-sm font-medium",
                change.type === 'increase' && "text-green-600",
                change.type === 'decrease' && "text-red-600",
                change.type === 'neutral' && "text-gray-600"
              )}>
                {change.value}
              </span>
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>
    </InteractiveCard>
  )
}

