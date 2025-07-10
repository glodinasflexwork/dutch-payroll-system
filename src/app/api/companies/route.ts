import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { authClient } from "@/lib/database-clients"
import { z } from "zod"

// Dutch business number validation patterns
const DUTCH_KVK_PATTERN = /^\d{8}$/  // 8 digits
const DUTCH_TAX_PATTERN = /^\d{9}L\d{2}$/  // 9 digits + L + 2 digits (Loonheffingsnummer)
const DUTCH_VAT_PATTERN = /^NL\d{9}B\d{2}$/  // NL + 9 digits + B + 2 digits (BTW nummer)

// Validation schema for company updates
const updateCompanySchema = z.object({
  name: z.string().min(1, "Company name is required").optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().optional(),
  kvkNumber: z.string()
    .refine((val) => !val || DUTCH_KVK_PATTERN.test(val), {
      message: "KvK number must be 8 digits (e.g., 12345678)"
    })
    .optional(),
  taxNumber: z.string()
    .refine((val) => !val || DUTCH_TAX_PATTERN.test(val), {
      message: "Tax number must be in format: 123456789L01 (9 digits + L + 2 digits)"
    })
    .optional(),
  vatNumber: z.string()
    .refine((val) => !val || DUTCH_VAT_PATTERN.test(val), {
      message: "VAT number must be in format: NL123456789B01"
    })
    .optional(),
  description: z.string().optional(),
  industry: z.string().optional(),
  foundedYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  employeeCount: z.number().min(1).optional(),
})

// Preprocess data to handle empty strings and type conversions
function preprocessCompanyData(data: any) {
  const processed = { ...data }
  
  // Convert empty strings to undefined
  Object.keys(processed).forEach(key => {
    if (processed[key] === "") {
      processed[key] = undefined
    }
  })
  
  // Convert string numbers to actual numbers
  if (processed.foundedYear && typeof processed.foundedYear === 'string') {
    const year = parseInt(processed.foundedYear)
    processed.foundedYear = isNaN(year) ? undefined : year
  }
  
  if (processed.employeeCount && typeof processed.employeeCount === 'string') {
    const count = parseInt(processed.employeeCount)
    processed.employeeCount = isNaN(count) ? undefined : count
  }
  
  return processed
}

// GET /api/companies - Get the user's company information
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/companies - Starting request")
    const session = await getServerSession(authOptions)
    console.log("Session:", session?.user?.email, "CompanyId:", session?.user?.companyId)
    
    if (!session?.user?.companyId) {
      console.log("No session or companyId found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("Fetching company with ID:", session.user.companyId)
    const company = await authClient.company.findUnique({
      where: {
        id: session.user.companyId
      },
      include: {
        _count: {
          select: {
            Employee: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    console.log("Company found:", !!company)
    if (!company) {
      console.log("Company not found in database")
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Add employee count to the company object
    const companyWithStats = {
      ...company,
      employeeCount: company._count?.Employee || 0
    }

    console.log("Returning company data successfully")
    return NextResponse.json({
      success: true,
      companies: [companyWithStats]
    })

  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
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
    console.log("Received company data:", body)
    
    // Preprocess the data to handle empty strings and type conversions
    const preprocessedData = preprocessCompanyData(body)
    console.log("Preprocessed data:", preprocessedData)
    
    // Validate the request body
    const validatedData = updateCompanySchema.parse(preprocessedData)
    console.log("Validated data:", validatedData)

    // Check if company exists
    const existingCompany = await authClient.company.findUnique({
      where: {
        id: session.user.companyId
      }
    })

    if (!existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Update the company
    const updatedCompany = await authClient.company.update({
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
