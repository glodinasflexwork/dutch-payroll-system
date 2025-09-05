// Enhanced Navigation Hook with Advanced Feedback
// Provides comprehensive navigation state management and user feedback

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface NavigationState {
  isNavigating: boolean
  destination: string | null
  error: string | null
  progress: number
  estimatedTime: number
  startTime: number | null
}

interface NavigationOptions {
  delay?: number
  showProgress?: boolean
  estimatedDuration?: number
  replace?: boolean
  scroll?: boolean
  onStart?: () => void
  onComplete?: () => void
  onError?: (error: string) => void
}

export function useEnhancedNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState<NavigationState>({
    isNavigating: false,
    destination: null,
    error: null,
    progress: 0,
    estimatedTime: 0,
    startTime: null
  })

  const progressInterval = useRef<NodeJS.Timeout>()
  const navigationTimeout = useRef<NodeJS.Timeout>()

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current)
      }
    }
  }, [])

  // Reset navigation state when pathname changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isNavigating: false,
      progress: 0,
      startTime: null
    }))
    
    if (progressInterval.current) {
      clearInterval(progressInterval.current)
    }
  }, [pathname])

  const navigate = useCallback(async (
    path: string,
    options: NavigationOptions = {}
  ) => {
    const {
      delay = 100,
      showProgress = true,
      estimatedDuration = 2000,
      replace = false,
      scroll = true,
      onStart,
      onComplete,
      onError
    } = options

    // Don't navigate if already navigating to the same destination
    if (state.isNavigating && state.destination === path) {
      return
    }

    const startTime = Date.now()

    setState({
      isNavigating: true,
      destination: path,
      error: null,
      progress: 0,
      estimatedTime: estimatedDuration,
      startTime
    })

    if (onStart) {
      onStart()
    }

    try {
      // Start progress simulation if enabled
      if (showProgress) {
        let progress = 0
        progressInterval.current = setInterval(() => {
          progress += Math.random() * 15 + 5 // Random progress between 5-20%
          if (progress > 90) progress = 90 // Cap at 90% until actual navigation

          setState(prev => ({
            ...prev,
            progress: Math.min(progress, 90)
          }))
        }, 100)
      }

      // Add visual feedback delay
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      // Perform navigation
      if (replace) {
        router.replace(path, { scroll })
      } else {
        router.push(path, { scroll })
      }

      // Complete progress
      if (showProgress) {
        setState(prev => ({
          ...prev,
          progress: 100
        }))
      }

      // Set timeout to reset state if navigation doesn't complete
      navigationTimeout.current = setTimeout(() => {
        setState(prev => ({
          ...prev,
          isNavigating: false,
          progress: 0,
          startTime: null
        }))
        
        if (onComplete) {
          onComplete()
        }
      }, 1000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Navigation failed'
      
      setState({
        isNavigating: false,
        destination: null,
        error: errorMessage,
        progress: 0,
        estimatedTime: 0,
        startTime: null
      })

      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }

      if (onError) {
        onError(errorMessage)
      }
    }
  }, [router, state.isNavigating, state.destination])

  const reset = useCallback(() => {
    setState({
      isNavigating: false,
      destination: null,
      error: null,
      progress: 0,
      estimatedTime: 0,
      startTime: null
    })

    if (progressInterval.current) {
      clearInterval(progressInterval.current)
    }
    if (navigationTimeout.current) {
      clearTimeout(navigationTimeout.current)
    }
  }, [])

  const prefetch = useCallback((path: string) => {
    router.prefetch(path)
  }, [router])

  return {
    ...state,
    navigate,
    reset,
    prefetch,
    currentPath: pathname
  }
}

// Hook for managing loading states across the application
interface LoadingState {
  [key: string]: boolean
}

export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({})

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }))
  }, [])

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false
  }, [loadingStates])

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean)
  }, [loadingStates])

  const clearAll = useCallback(() => {
    setLoadingStates({})
  }, [])

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    clearAll,
    loadingStates
  }
}

// Hook for managing user interaction feedback
interface InteractionState {
  hoveredElement: string | null
  pressedElement: string | null
  focusedElement: string | null
}

export function useInteractionFeedback() {
  const [state, setState] = useState<InteractionState>({
    hoveredElement: null,
    pressedElement: null,
    focusedElement: null
  })

  const setHovered = useCallback((elementId: string | null) => {
    setState(prev => ({
      ...prev,
      hoveredElement: elementId
    }))
  }, [])

  const setPressed = useCallback((elementId: string | null) => {
    setState(prev => ({
      ...prev,
      pressedElement: elementId
    }))
  }, [])

  const setFocused = useCallback((elementId: string | null) => {
    setState(prev => ({
      ...prev,
      focusedElement: elementId
    }))
  }, [])

  const isHovered = useCallback((elementId: string) => {
    return state.hoveredElement === elementId
  }, [state.hoveredElement])

  const isPressed = useCallback((elementId: string) => {
    return state.pressedElement === elementId
  }, [state.pressedElement])

  const isFocused = useCallback((elementId: string) => {
    return state.focusedElement === elementId
  }, [state.focusedElement])

  const reset = useCallback(() => {
    setState({
      hoveredElement: null,
      pressedElement: null,
      focusedElement: null
    })
  }, [])

  return {
    setHovered,
    setPressed,
    setFocused,
    isHovered,
    isPressed,
    isFocused,
    reset,
    state
  }
}

// Hook for managing page transitions
interface PageTransitionState {
  isTransitioning: boolean
  fromPage: string | null
  toPage: string | null
  transitionType: 'push' | 'replace' | 'back' | 'forward' | null
}

export function usePageTransitions() {
  const pathname = usePathname()
  const [state, setState] = useState<PageTransitionState>({
    isTransitioning: false,
    fromPage: null,
    toPage: null,
    transitionType: null
  })

  const startTransition = useCallback((
    toPage: string,
    transitionType: 'push' | 'replace' | 'back' | 'forward' = 'push'
  ) => {
    setState({
      isTransitioning: true,
      fromPage: pathname,
      toPage,
      transitionType
    })
  }, [pathname])

  const completeTransition = useCallback(() => {
    setState({
      isTransitioning: false,
      fromPage: null,
      toPage: null,
      transitionType: null
    })
  }, [])

  // Auto-complete transition when pathname changes
  useEffect(() => {
    if (state.isTransitioning && pathname === state.toPage) {
      completeTransition()
    }
  }, [pathname, state.isTransitioning, state.toPage, completeTransition])

  return {
    ...state,
    startTransition,
    completeTransition
  }
}

// Hook for managing optimistic updates
interface OptimisticState<T> {
  data: T
  isOptimistic: boolean
  error: string | null
}

export function useOptimisticUpdate<T>(initialData: T) {
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    isOptimistic: false,
    error: null
  })

  const updateOptimistically = useCallback((newData: T) => {
    setState({
      data: newData,
      isOptimistic: true,
      error: null
    })
  }, [])

  const confirmUpdate = useCallback((confirmedData: T) => {
    setState({
      data: confirmedData,
      isOptimistic: false,
      error: null
    })
  }, [])

  const revertUpdate = useCallback((error: string, originalData: T) => {
    setState({
      data: originalData,
      isOptimistic: false,
      error
    })
  }, [])

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isOptimistic: false,
      error: null
    })
  }, [initialData])

  return {
    ...state,
    updateOptimistically,
    confirmUpdate,
    revertUpdate,
    reset
  }
}

