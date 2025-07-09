import { NextRequest, NextResponse } from "next/server"

interface KvKCompanyData {
  kvkNumber: string
  name: string
  address?: string
  postalCode?: string
  city?: string
  status?: string
  registrationDate?: string
  activities?: string[]
}

interface KvKOpenDataResponse {
  kvkNummer: string
  naam: string
  adres?: {
    volledigAdres?: string
    postcode?: string
    plaats?: string
  }
  status?: string
  datumAanvang?: string
  hoofdactiviteit?: string
  nevenactiviteiten?: string[]
}

// Free KvK Open Dataset API (no authentication required)
const KVK_OPEN_DATA_BASE_URL = "https://api.kvk.nl/api/v1/basisprofielen"

// Validate Dutch KvK number format
function validateKvKNumber(kvkNumber: string): boolean {
  // Remove spaces and convert to string
  const cleaned = kvkNumber.replace(/\s/g, '')
  
  // Must be exactly 8 digits
  if (!/^\d{8}$/.test(cleaned)) {
    return false
  }
  
  // KvK numbers should not start with 0
  if (cleaned.startsWith('0')) {
    return false
  }
  
  return true
}

// Format KvK number for display (12345678 -> 12 34 56 78)
function formatKvKNumber(kvkNumber: string): string {
  const cleaned = kvkNumber.replace(/\s/g, '')
  return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')
}

// Search companies by name using KvK Open Data
async function searchCompaniesByName(query: string): Promise<KvKCompanyData[]> {
  try {
    // Use the free search endpoint
    const searchUrl = `https://api.kvk.nl/api/v1/zoeken?naam=${encodeURIComponent(query)}&aantal=10`
    
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SalarySync-Payroll-System'
      }
    })
    
    if (!response.ok) {
      console.error('KvK search API error:', response.status, response.statusText)
      return []
    }
    
    const data = await response.json()
    
    if (!data.resultaten || !Array.isArray(data.resultaten)) {
      return []
    }
    
    return data.resultaten.map((item: any) => ({
      kvkNumber: item.kvkNummer || '',
      name: item.naam || '',
      address: item.adres?.volledigAdres || '',
      postalCode: item.adres?.postcode || '',
      city: item.adres?.plaats || '',
      status: item.status || 'Unknown'
    }))
  } catch (error) {
    console.error('Error searching companies by name:', error)
    return []
  }
}

// Get company details by KvK number using Open Data API
async function getCompanyByKvKNumber(kvkNumber: string): Promise<KvKCompanyData | null> {
  try {
    const cleanedKvK = kvkNumber.replace(/\s/g, '')
    
    // Try the free Open Dataset API first
    const openDataUrl = `${KVK_OPEN_DATA_BASE_URL}/${cleanedKvK}`
    
    const response = await fetch(openDataUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SalarySync-Payroll-System'
      }
    })
    
    if (response.ok) {
      const data: KvKOpenDataResponse = await response.json()
      
      return {
        kvkNumber: formatKvKNumber(data.kvkNummer),
        name: data.naam,
        address: data.adres?.volledigAdres || '',
        postalCode: data.adres?.postcode || '',
        city: data.adres?.plaats || '',
        status: data.status || 'Active',
        registrationDate: data.datumAanvang || '',
        activities: data.nevenactiviteiten || []
      }
    }
    
    // If Open Data API fails, we could implement fallback to paid API here
    // For now, return null to indicate company not found
    console.error('KvK Open Data API error:', response.status, response.statusText)
    return null
    
  } catch (error) {
    console.error('Error fetching company by KvK number:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const kvkNumber = searchParams.get('kvkNumber')
    const companyName = searchParams.get('name')
    const action = searchParams.get('action') || 'lookup'
    
    // Validate KvK number lookup
    if (action === 'lookup' && kvkNumber) {
      if (!validateKvKNumber(kvkNumber)) {
        return NextResponse.json(
          { 
            error: "Invalid KvK number format. Must be 8 digits and not start with 0.",
            valid: false
          },
          { status: 400 }
        )
      }
      
      const company = await getCompanyByKvKNumber(kvkNumber)
      
      if (!company) {
        return NextResponse.json(
          { 
            error: "Company not found with this KvK number.",
            valid: true,
            found: false
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        valid: true,
        found: true,
        company,
        source: 'kvk_open_data'
      })
    }
    
    // Search companies by name
    if (action === 'search' && companyName) {
      if (companyName.length < 3) {
        return NextResponse.json(
          { 
            error: "Company name must be at least 3 characters long.",
            companies: []
          },
          { status: 400 }
        )
      }
      
      const companies = await searchCompaniesByName(companyName)
      
      return NextResponse.json({
        success: true,
        companies,
        count: companies.length,
        source: 'kvk_search'
      })
    }
    
    // Validate KvK number format only
    if (action === 'validate' && kvkNumber) {
      const isValid = validateKvKNumber(kvkNumber)
      
      return NextResponse.json({
        valid: isValid,
        formatted: isValid ? formatKvKNumber(kvkNumber) : kvkNumber,
        message: isValid ? "Valid KvK number format" : "Invalid KvK number format"
      })
    }
    
    return NextResponse.json(
      { error: "Missing required parameters. Use ?kvkNumber=12345678 or ?name=CompanyName&action=search" },
      { status: 400 }
    )
    
  } catch (error) {
    console.error("KvK API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { kvkNumber, companyName, action } = await request.json()
    
    // Handle batch lookup for multiple companies
    if (action === 'batch' && Array.isArray(kvkNumber)) {
      const results = await Promise.all(
        kvkNumber.map(async (kvk: string) => {
          if (!validateKvKNumber(kvk)) {
            return { kvkNumber: kvk, error: "Invalid format", valid: false }
          }
          
          const company = await getCompanyByKvKNumber(kvk)
          return {
            kvkNumber: kvk,
            company,
            found: !!company,
            valid: true
          }
        })
      )
      
      return NextResponse.json({
        success: true,
        results,
        processed: results.length
      })
    }
    
    // Single company lookup (same as GET)
    if (kvkNumber) {
      if (!validateKvKNumber(kvkNumber)) {
        return NextResponse.json(
          { 
            error: "Invalid KvK number format",
            valid: false
          },
          { status: 400 }
        )
      }
      
      const company = await getCompanyByKvKNumber(kvkNumber)
      
      return NextResponse.json({
        success: true,
        valid: true,
        found: !!company,
        company
      })
    }
    
    return NextResponse.json(
      { error: "Missing kvkNumber in request body" },
      { status: 400 }
    )
    
  } catch (error) {
    console.error("KvK API POST error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

