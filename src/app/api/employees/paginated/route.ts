import { NextRequest, NextResponse } from "next/server"
import { validateAuth } from "@/lib/auth-utils"
import { getHRClient } from "@/lib/database-clients"
import { validateSubscription } from "@/lib/subscription"
import { withCache, cacheKeys } from "@/lib/cache-utils"

export async function GET(request: NextRequest) {
  try {
    const { context, error, status } = await validateAuth(request, ['employee'])
    
    if (!context || error) {
      return NextResponse.json({ error }, { status })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const search = url.searchParams.get('search') || ''
    const department = url.searchParams.get('department') || ''
    const employmentType = url.searchParams.get('employmentType') || ''
    const sortBy = url.searchParams.get('sortBy') || 'employeeNumber'
    const sortOrder = url.searchParams.get('sortOrder') || 'asc'

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json({ 
        error: "Invalid pagination parameters" 
      }, { status: 400 })
    }

    // Validate subscription
    const subscriptionValidation = await validateSubscription(context.companyId)
    if (!subscriptionValidation.isValid) {
      return NextResponse.json({ error: subscriptionValidation.error }, { status: 403 })
    }

    // Build cache key
    const cacheKey = `employees-paginated-${context.companyId}-${page}-${limit}-${search}-${department}-${employmentType}-${sortBy}-${sortOrder}`

    // Use cache wrapper for the query
    const result = await withCache(cacheKey, async () => {
      // Build where clause for filtering
      const whereClause: any = {
        companyId: context.companyId,
        isActive: true
      }

      // Add search filter
      if (search) {
        whereClause.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { employeeNumber: { contains: search, mode: 'insensitive' } },
          { bsn: { contains: search } }
        ]
      }

      // Add department filter
      if (department && department !== 'all') {
        whereClause.department = department
      }

      // Add employment type filter
      if (employmentType && employmentType !== 'all') {
        whereClause.employmentType = employmentType
      }

      // Build order by clause
      const orderBy: any = {}
      orderBy[sortBy] = sortOrder

      // Execute queries in parallel
      const [employees, totalCount, departments] = await Promise.all([
        // Get paginated employees with selected fields only
        getHRClient().employee.findMany({
          where: whereClause,
          select: {
            id: true,
            employeeNumber: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            position: true,
            department: true,
            employmentType: true,
            salary: true,
            hourlyRate: true,
            startDate: true,
            isActive: true,
            bsn: true,
            taxTable: true
          },
          orderBy,
          skip: (page - 1) * limit,
          take: limit
        }),

        // Get total count for pagination
        getHRClient().employee.count({
          where: whereClause
        }),

        // Get unique departments for filtering
        getHRClient().employee.findMany({
          where: {
            companyId: context.companyId,
            isActive: true,
            department: { not: null }
          },
          select: { department: true },
          distinct: ['department']
        })
      ])

      const totalPages = Math.ceil(totalCount / limit)
      const uniqueDepartments = departments
        .map(d => d.department)
        .filter(Boolean)
        .sort()

      return {
        employees,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          departments: uniqueDepartments,
          search,
          department,
          employmentType,
          sortBy,
          sortOrder
        }
      }
    }, 2) // Cache for 2 minutes

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error("Error fetching paginated employees:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

