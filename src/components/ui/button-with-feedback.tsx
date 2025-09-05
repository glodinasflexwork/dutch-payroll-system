import { useState } from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ButtonWithFeedbackProps extends ButtonProps {
  onAsyncClick?: () => Promise<void>
  successMessage?: string
  errorMessage?: string
  loadingText?: string
  showSuccessIcon?: boolean
  resetDelay?: number
}

export function ButtonWithFeedback({
  onAsyncClick,
  successMessage = "Success!",
  errorMessage = "Error occurred",
  loadingText,
  showSuccessIcon = true,
  resetDelay = 2000,
  children,
  className,
  disabled,
  ...props
}: ButtonWithFeedbackProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleClick = async () => {
    if (!onAsyncClick || state === 'loading') return

    setState('loading')
    
    try {
      await onAsyncClick()
      setState('success')
      
      // Reset to idle after delay
      setTimeout(() => {
        setState('idle')
      }, resetDelay)
    } catch (error) {
      setState('error')
      console.error('Button action failed:', error)
      
      // Reset to idle after delay
      setTimeout(() => {
        setState('idle')
      }, resetDelay)
    }
  }

  const isDisabled = disabled || state === 'loading'

  const getButtonContent = () => {
    switch (state) {
      case 'loading':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {loadingText || children}
          </>
        )
      case 'success':
        return (
          <>
            {showSuccessIcon && <Check className="w-4 h-4 mr-2" />}
            {successMessage}
          </>
        )
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            {errorMessage}
          </>
        )
      default:
        return children
    }
  }

  const getButtonVariant = () => {
    switch (state) {
      case 'success':
        return 'default' // Keep original variant but with success styling
      case 'error':
        return 'destructive'
      default:
        return props.variant || 'default'
    }
  }

  return (
    <Button
      {...props}
      variant={getButtonVariant()}
      className={cn(
        className,
        state === 'success' && "bg-green-600 hover:bg-green-700 border-green-600",
        "transition-all duration-200"
      )}
      disabled={isDisabled}
      onClick={onAsyncClick ? handleClick : props.onClick}
    >
      {getButtonContent()}
    </Button>
  )
}

// Navigation button with loading state
interface NavButtonProps extends ButtonProps {
  href?: string
  isLoading?: boolean
  loadingText?: string
}

export function NavButton({
  href,
  isLoading = false,
  loadingText = "Loading...",
  children,
  className,
  disabled,
  onClick,
  ...props
}: NavButtonProps) {
  const [isNavigating, setIsNavigating] = useState(false)

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || isNavigating) return

    if (href) {
      setIsNavigating(true)
      // Simulate navigation delay for feedback
      setTimeout(() => {
        window.location.href = href
      }, 100)
    }

    if (onClick) {
      onClick(e)
    }
  }

  const showLoading = isLoading || isNavigating

  return (
    <Button
      {...props}
      className={cn(
        "transition-all duration-200",
        showLoading && "opacity-75",
        className
      )}
      disabled={disabled || showLoading}
      onClick={handleClick}
    >
      {showLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {showLoading ? loadingText : children}
    </Button>
  )
}

