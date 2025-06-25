import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for company updates
const updateCompanySchema = z.object({
  name: z.string().min(1, "Company name is required").optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
  website: z.string().optional(),
  kvkNumber: z.string().optional(),
  taxNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  employeeCount: z.number().min(1).optional(),
})

// GET /api/companies - Get the user's company information
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const company = await prisma.company.findUnique({
      where: {
        id: session.user.companyId
      },
      include: {
        _count: {
          select: {
            employees: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Add employee count to the company object
    const companyWithStats = {
      ...company,
      employeeCount: company._count?.employees || 0
    }

    return NextResponse.json({
      success: true,
      companies: [companyWithStats]
    })

  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PUT /api/companies - Update the user's company information
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the request body
    const validatedData = updateCompanySchema.parse(body)

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: {
        id: session.user.companyId
      }
    })

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Update the company
    const updatedCompany = await prisma.company.update({
      where: { id: session.user.companyId },
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      company: updatedCompany
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating company:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
