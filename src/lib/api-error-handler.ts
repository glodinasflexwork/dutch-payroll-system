/**
 * API Error Handler
 * Ensures all API responses are JSON and handles database connection errors gracefully
 */

import { NextResponse } from 'next/server'

export interface ApiError {
  message: string
  code?: string
  statusCode?: number
  details?: any
}

/**
 * Handle API errors and ensure JSON response
 */
export function handleApiError(error: any, context: string = 'API'): NextResponse {
  console.error(`❌ [${context}] API Error:`, {
    message: error.message,
    code: error.code,
    stack: error.stack,
    context
  })

  // Database connection errors
  if (error.message?.includes('Engine is not yet connected') || 
      error.message?.includes('connection') ||
      error.code === 'P1001') {
    return NextResponse.json({
      success: false,
      error: 'Database connection issue. Please try again in a moment.',
      code: 'DATABASE_CONNECTION_ERROR',
      timestamp: new Date().toISOString()
    }, { 
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '5'
      }
    })
  }

  // Database timeout errors
  if (error.message?.includes('timeout') || error.code === 'P1008') {
    return NextResponse.json({
      success: false,
      error: 'Database operation timed out. Please try again.',
      code: 'DATABASE_TIMEOUT',
      timestamp: new Date().toISOString()
    }, { 
      status: 504,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '3'
      }
    })
  }

  // Prisma specific errors
  if (error.code === 'P2002') {
    return NextResponse.json({
      success: false,
      error: 'A record with this information already exists',
      code: 'DUPLICATE_RECORD',
      timestamp: new Date().toISOString()
    }, { 
      status: 409,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  if (error.code === 'P2025') {
    return NextResponse.json({
      success: false,
      error: 'The requested record was not found',
      code: 'RECORD_NOT_FOUND',
      timestamp: new Date().toISOString()
    }, { 
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Authentication errors
  if (error.message?.includes('authentication') || 
      error.message?.includes('unauthorized')) {
    return NextResponse.json({
      success: false,
      error: 'Authentication required',
      code: 'AUTHENTICATION_REQUIRED',
      timestamp: new Date().toISOString()
    }, { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Validation errors
  if (error.message?.includes('validation') || 
      error.message?.includes('invalid')) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Invalid request data',
      code: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    }, { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Generic server error
  return NextResponse.json({
    success: false,
    error: 'An internal server error occurred. Please try again.',
    code: 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { 
      details: error.message,
      stack: error.stack 
    })
  }, { 
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * Wrap API handler with error handling
 */
export function withApiErrorHandler(
  handler: (request: Request, context?: any) => Promise<NextResponse>,
  context: string = 'API'
) {
  return async (request: Request, routeContext?: any): Promise<NextResponse> => {
    try {
      return await handler(request, routeContext)
    } catch (error) {
      return handleApiError(error, context)
    }
  }
}

/**
 * Create success response with consistent format
 */
export function createSuccessResponse(data: any, message?: string, status: number = 200): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }, { 
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * Create error response with consistent format
 */
export function createErrorResponse(
  message: string, 
  code: string = 'ERROR', 
  status: number = 400,
  details?: any
): NextResponse {
  return NextResponse.json({
    success: false,
    error: message,
    code,
    timestamp: new Date().toISOString(),
    ...(details && { details })
  }, { 
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

