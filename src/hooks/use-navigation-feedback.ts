import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface NavigationState {
  isNavigating: boolean
  destination: string | null
  error: string | null
}

export function useNavigationFeedback() {
  const router = useRouter()
  const [state, setState] = useState<NavigationState>({
    isNavigating: false,
    destination: null,
    error: null
  })

  const navigate = useCallback(async (
    path: string, 
    options?: { 
      delay?: number
      showFeedback?: boolean
      replace?: boolean
    }
  ) => {
    const { delay = 100, showFeedback = true, replace = false } = options || {}

    if (showFeedback) {
      setState({
        isNavigating: true,
        destination: path,
        error: null
      })
    }

    try {
      // Add small delay for visual feedback
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      if (replace) {
        router.replace(path)
      } else {
        router.push(path)
      }
    } catch (error) {
      setState({
        isNavigating: false,
        destination: null,
        error: error instanceof Error ? error.message : 'Navigation failed'
      })
    }
  }, [router])

  const reset = useCallback(() => {
    setState({
      isNavigating: false,
      destination: null,
      error: null
    })
  }, [])

  return {
    ...state,
    navigate,
    reset
  }
}

// Hook for form submission feedback
interface FormSubmissionState {
  isSubmitting: boolean
  isSuccess: boolean
  error: string | null
}

export function useFormFeedback() {
  const [state, setState] = useState<FormSubmissionState>({
    isSubmitting: false,
    isSuccess: false,
    error: null
  })

  const submit = useCallback(async (
    submitFn: () => Promise<void>,
    options?: {
      successDelay?: number
      resetDelay?: number
    }
  ) => {
    const { successDelay = 500, resetDelay = 2000 } = options || {}

    setState({
      isSubmitting: true,
      isSuccess: false,
      error: null
    })

    try {
      await submitFn()
      
      setState({
        isSubmitting: false,
        isSuccess: true,
        error: null
      })

      // Reset success state after delay
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          isSuccess: false
        }))
      }, resetDelay)

    } catch (error) {
      setState({
        isSubmitting: false,
        isSuccess: false,
        error: error instanceof Error ? error.message : 'Submission failed'
      })

      // Reset error state after delay
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          error: null
        }))
      }, resetDelay)
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      isSubmitting: false,
      isSuccess: false,
      error: null
    })
  }, [])

  return {
    ...state,
    submit,
    reset
  }
}

// Hook for API call feedback
interface ApiCallState<T> {
  isLoading: boolean
  data: T | null
  error: string | null
  isSuccess: boolean
}

export function useApiCall<T>() {
  const [state, setState] = useState<ApiCallState<T>>({
    isLoading: false,
    data: null,
    error: null,
    isSuccess: false
  })

  const execute = useCallback(async (
    apiFn: () => Promise<T>,
    options?: {
      onSuccess?: (data: T) => void
      onError?: (error: string) => void
    }
  ) => {
    setState({
      isLoading: true,
      data: null,
      error: null,
      isSuccess: false
    })

    try {
      const result = await apiFn()
      
      setState({
        isLoading: false,
        data: result,
        error: null,
        isSuccess: true
      })

      if (options?.onSuccess) {
        options.onSuccess(result)
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'API call failed'
      
      setState({
        isLoading: false,
        data: null,
        error: errorMessage,
        isSuccess: false
      })

      if (options?.onError) {
        options.onError(errorMessage)
      }

      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      data: null,
      error: null,
      isSuccess: false
    })
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}

