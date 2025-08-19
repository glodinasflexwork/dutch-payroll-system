/**
 * Database Retry Logic for Production Stability
 * Handles intermittent database connection issues and timeouts
 */

export interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffMultiplier?: number
}

export class DatabaseRetryError extends Error {
  constructor(message: string, public originalError: Error, public attempts: number) {
    super(message)
    this.name = 'DatabaseRetryError'
  }
}

/**
 * Exponential backoff retry mechanism for database operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2
  } = options

  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      console.log(`🔄 Database operation attempt ${attempt}/${maxRetries + 1}`)
      const result = await operation()
      
      if (attempt > 1) {
        console.log(`✅ Database operation succeeded on attempt ${attempt}`)
      }
      
      return result
    } catch (error) {
      lastError = error as Error
      
      console.error(`❌ Database operation failed on attempt ${attempt}:`, {
        error: lastError.message,
        attempt,
        maxRetries: maxRetries + 1
      })
      
      // Don't retry on the last attempt
      if (attempt > maxRetries) {
        break
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffMultiplier, attempt - 1),
        maxDelay
      )
      
      console.log(`⏳ Retrying in ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw new DatabaseRetryError(
    `Database operation failed after ${maxRetries + 1} attempts`,
    lastError!,
    maxRetries + 1
  )
}

/**
 * Database connection health check
 */
export async function checkDatabaseHealth(client: any): Promise<boolean> {
  try {
    // Simple query to test connection
    await client.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

/**
 * Enhanced database client with retry logic
 */
export function createRetryableClient<T>(client: T) {
  return new Proxy(client as any, {
    get(target, prop) {
      const originalMethod = target[prop]
      
      // Only wrap database operation methods
      if (typeof originalMethod === 'function' && 
          (prop === 'findFirst' || prop === 'findMany' || prop === 'create' || 
           prop === 'update' || prop === 'delete' || prop === 'upsert')) {
        
        return function(...args: any[]) {
          return withRetry(() => originalMethod.apply(target, args), {
            maxRetries: 2, // Reduced for API responsiveness
            baseDelay: 500,
            maxDelay: 2000
          })
        }
      }
      
      return originalMethod
    }
  })
}

/**
 * Connection pool optimization for Vercel
 */
export const connectionConfig = {
  // Optimize for serverless environments
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Reduce connection pool size for serverless
  engineType: 'binary' as const,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty' as const
}

/**
 * Graceful error handling for production
 */
export function handleDatabaseError(error: any, context: string): never {
  console.error(`Database error in ${context}:`, {
    message: error.message,
    code: error.code,
    meta: error.meta,
    context
  })
  
  // Provide user-friendly error messages
  if (error.code === 'P2002') {
    throw new Error('A record with this information already exists')
  }
  
  if (error.code === 'P2025') {
    throw new Error('The requested record was not found')
  }
  
  if (error.message?.includes('timeout')) {
    throw new Error('Database operation timed out. Please try again.')
  }
  
  if (error.message?.includes('connection')) {
    throw new Error('Database connection issue. Please try again in a moment.')
  }
  
  // Generic error for unknown issues
  throw new Error('A database error occurred. Please try again.')
}

