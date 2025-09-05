import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getHRClient, getAuthClient } from '@/lib/database-clients'
import { sendEmployeeInvitationEmail } from '@/lib/email-service'
import crypto from 'crypto'

interface SchedulerConfig {
  enabled: boolean
  batchSize: number
  rateLimitDelay: number
  maxRetries: number
  retryDelay: number
  scheduleInterval: number // in minutes
}

// Default configuration
const DEFAULT_CONFIG: SchedulerConfig = {
  enabled: false,
  batchSize: 10,
  rateLimitDelay: 1000, // 1 second
  maxRetries: 3,
  retryDelay: 300000, // 5 minutes
  scheduleInterval: 60 // 1 hour
}

// In-memory storage for scheduler state (in production, use Redis or database)
const schedulerState = new Map<string, {
  config: SchedulerConfig
  lastRun: Date
  isRunning: boolean
  stats: {
    totalRuns: number
    successfulRuns: number
    failedRuns: number
    lastError?: string
  }
}>()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Verify user has permission for this company
    const userCompany = await getAuthClient().userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: session.user.id,
          companyId: companyId
        }
      }
    })

    if (!userCompany) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const state = schedulerState.get(companyId) || {
      config: DEFAULT_CONFIG,
      lastRun: new Date(0),
      isRunning: false,
      stats: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0
      }
    }

    return NextResponse.json({
      companyId,
      ...state,
      nextRun: state.config.enabled 
        ? new Date(state.lastRun.getTime() + state.config.scheduleInterval * 60 * 1000)
        : null
    })

  } catch (error) {
    console.error('Error fetching scheduler status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scheduler status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyId, action, config } = await request.json()

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Verify user has permission for this company
    const userCompany = await getAuthClient().userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: session.user.id,
          companyId: companyId
        }
      }
    })

    if (!userCompany || !['owner', 'admin', 'hr'].includes(userCompany.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const currentState = schedulerState.get(companyId) || {
      config: DEFAULT_CONFIG,
      lastRun: new Date(0),
      isRunning: false,
      stats: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0
      }
    }

    switch (action) {
      case 'start':
        currentState.config.enabled = true
        if (config) {
          currentState.config = { ...currentState.config, ...config }
        }
        schedulerState.set(companyId, currentState)
        
        // Start the scheduler
        startScheduler(companyId)
        
        return NextResponse.json({
          success: true,
          message: 'Scheduler started',
          config: currentState.config
        })

      case 'stop':
        currentState.config.enabled = false
        schedulerState.set(companyId, currentState)
        
        return NextResponse.json({
          success: true,
          message: 'Scheduler stopped'
        })

      case 'configure':
        if (config) {
          currentState.config = { ...currentState.config, ...config }
          schedulerState.set(companyId, currentState)
        }
        
        return NextResponse.json({
          success: true,
          message: 'Configuration updated',
          config: currentState.config
        })

      case 'run_now':
        if (currentState.isRunning) {
          return NextResponse.json({
            error: 'Scheduler is already running'
          }, { status: 400 })
        }
        
        // Run immediately
        const result = await runInvitationProcess(companyId)
        
        return NextResponse.json({
          success: true,
          message: 'Manual run completed',
          result
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error managing scheduler:', error)
    return NextResponse.json(
      { error: 'Failed to manage scheduler' },
      { status: 500 }
    )
  }
}

async function startScheduler(companyId: string) {
  const state = schedulerState.get(companyId)
  if (!state || !state.config.enabled) return

  const runScheduler = async () => {
    const currentState = schedulerState.get(companyId)
    if (!currentState || !currentState.config.enabled) return

    try {
      await runInvitationProcess(companyId)
    } catch (error) {
      console.error(`Scheduler error for company ${companyId}:`, error)
    }

    // Schedule next run
    if (currentState.config.enabled) {
      setTimeout(runScheduler, currentState.config.scheduleInterval * 60 * 1000)
    }
  }

  // Start the scheduler
  setTimeout(runScheduler, state.config.scheduleInterval * 60 * 1000)
}

async function runInvitationProcess(companyId: string): Promise<any> {
  const state = schedulerState.get(companyId)
  if (!state) throw new Error('Scheduler state not found')

  // Mark as running
  state.isRunning = true
  state.stats.totalRuns++
  schedulerState.set(companyId, state)

  const runId = crypto.randomUUID()
  console.log(`[SCHEDULER ${runId}] Starting automated invitation process for company ${companyId}`)

  try {
    // Get employees needing invitations
    const employees = await getHRClient().employee.findMany({
      where: {
        companyId,
        isActive: true,
        portalAccessStatus: 'NO_ACCESS',
        email: {
          not: null
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeNumber: true
      },
      take: state.config.batchSize
    })

    if (employees.length === 0) {
      console.log(`[SCHEDULER ${runId}] No employees found needing invitations`)
      state.isRunning = false
      state.lastRun = new Date()
      state.stats.successfulRuns++
      schedulerState.set(companyId, state)
      return { processed: 0, message: 'No employees needing invitations' }
    }

    const results = []

    for (const employee of employees) {
      try {
        if (!employee.email) continue

        // Check for existing invitation
        const existingInvitation = await getAuthClient().verificationToken.findFirst({
          where: {
            identifier: employee.email,
            expires: {
              gt: new Date()
            }
          }
        })

        if (existingInvitation) {
          console.log(`[SCHEDULER ${runId}] Skipping ${employee.email} - active invitation exists`)
          continue
        }

        // Generate invitation token
        const invitationToken = crypto.randomBytes(32).toString('hex')
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

        // Store invitation token
        await getAuthClient().verificationToken.create({
          data: {
            identifier: employee.email,
            token: invitationToken,
            expires: expires,
          },
        })

        // Create invitation link
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const invitationLink = `${baseUrl}/auth/employee-signup?token=${invitationToken}&email=${encodeURIComponent(employee.email)}`

        // Send invitation email
        await sendEmployeeInvitationEmail(
          employee.email,
          employee.firstName,
          invitationLink
        )

        // Update employee status
        await getHRClient().employee.update({
          where: { id: employee.id },
          data: {
            portalAccessStatus: 'INVITED',
            invitedAt: new Date(),
          },
        })

        results.push({
          employeeId: employee.id,
          email: employee.email,
          status: 'success'
        })

        console.log(`[SCHEDULER ${runId}] Successfully sent invitation to ${employee.email}`)

        // Rate limiting delay
        if (state.config.rateLimitDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, state.config.rateLimitDelay))
        }

      } catch (error) {
        console.error(`[SCHEDULER ${runId}] Error processing ${employee.email}:`, error)
        results.push({
          employeeId: employee.id,
          email: employee.email || '',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.status === 'success').length
    const failedCount = results.filter(r => r.status === 'failed').length

    console.log(`[SCHEDULER ${runId}] Completed: ${successCount} successful, ${failedCount} failed`)

    // Update state
    state.isRunning = false
    state.lastRun = new Date()
    if (failedCount === 0) {
      state.stats.successfulRuns++
    } else {
      state.stats.failedRuns++
      state.stats.lastError = `${failedCount} invitations failed`
    }
    schedulerState.set(companyId, state)

    return {
      processed: employees.length,
      successful: successCount,
      failed: failedCount,
      results
    }

  } catch (error) {
    console.error(`[SCHEDULER ${runId}] Fatal error:`, error)
    
    // Update state with error
    state.isRunning = false
    state.lastRun = new Date()
    state.stats.failedRuns++
    state.stats.lastError = error instanceof Error ? error.message : 'Unknown error'
    schedulerState.set(companyId, state)
    
    throw error
  }
}

