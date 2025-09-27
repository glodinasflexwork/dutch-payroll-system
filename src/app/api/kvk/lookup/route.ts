import { NextRequest, NextResponse } from "next/server"

// Types for KvK API response
interface KvKApiResponse {
  kvkNummer: string
  naam: string
  statutaireNaam?: string
  sbiActiviteiten?: Array<{
    sbiCode: string
    sbiOmschrijving: string
    indHoofdactiviteit: string
  }>
  _embedded?: {
    eigenaar?: {
      adressen?: Array<{
        type: string
        volledigAdres: string
        straatnaam: string
        huisnummer: number
        huisletter?: string
        huisnummerToevoeging?: string
        postcode: string
        plaats: string
        land: string
      }>
    }
  }
}

// Our response interface
interface CompanyLookupResponse {
  success: boolean
  company?: {
    name: string
    address: string
    street: string
    houseNumber: string
    houseNumberAddition?: string
    city: string
    postalCode: string
    kvkNumber: string
    status: string
    industry: string
    employeeCount: number
  }
  companies?: any[]
  error?: string
}

// KvK Test API configuration
const KVK_TEST_API_BASE = "https://api.kvk.nl/test/api/v1/basisprofielen"
const KVK_TEST_API_KEY = "l7xx1f2691f2520d487b902f4e0b57a0b197"

function isValidKvKNumber(kvkNumber: string): boolean {
  const kvkRegex = /^\d{8}$/;
  return kvkRegex.test(kvkNumber);
}

function mapSbiToIndustry(sbiCode: string, sbiDescription: string): string {
  // Map SBI codes to our industry categories
  const sbiToIndustryMap: { [key: string]: string } = {
    "62": "Technology", // Computer programming
    "63": "Technology", // Information service activities
    "86": "Healthcare", // Human health activities
    "64": "Finance", // Financial service activities
    "65": "Finance", // Insurance
    "85": "Education", // Education
    "10": "Manufacturing", // Food products
    "47": "Retail", // Retail trade
    "41": "Construction", // Construction of buildings
    "49": "Transportation", // Land transport
    "55": "Hospitality", // Accommodation
    "56": "Hospitality", // Food and beverage service
    "69": "Professional Services", // Legal and accounting
    "70": "Professional Services", // Management consultancy
    "94997": "Other" // Overige belangenbehartiging (rest)
  }

  // Try to match by SBI code prefix
  for (const [code, industry] of Object.entries(sbiToIndustryMap)) {
    if (sbiCode.startsWith(code)) {
      return industry
    }
  }

  return "Other"
}

async function fetchFromKvKApi(kvkNumber: string): Promise<KvKApiResponse | null> {
  try {
    const response = await fetch(`${KVK_TEST_API_BASE}/${kvkNumber}`, {
      headers: {
        'apikey': KVK_TEST_API_KEY,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null // Company not found
      }
      throw new Error(`KvK API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('KvK API fetch error:', error)
    throw error
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const kvkNumber = searchParams.get("kvkNumber")
    const name = searchParams.get("name")
    const action = searchParams.get("action")

    if (kvkNumber) {
      // Validate KvK number format
      if (!isValidKvKNumber(kvkNumber)) {
        return NextResponse.json({
          success: false,
          error: "Invalid KvK number format. KvK number must be exactly 8 digits."
        } as CompanyLookupResponse, { status: 400 })
      }

      try {
        // Fetch from real KvK API
        const kvkData = await fetchFromKvKApi(kvkNumber)
        
        if (!kvkData) {
          return NextResponse.json({
            success: false,
            error: "Company not found with this KvK number"
          } as CompanyLookupResponse, { status: 404 })
        }

        // Extract address information
        const address = kvkData._embedded?.eigenaar?.adressen?.[0]
        const mainActivity = kvkData.sbiActiviteiten?.find(activity => 
          activity.indHoofdactiviteit === "Ja"
        )

        // Map the KvK API response to our format
        const company = {
          name: kvkData.naam || kvkData.statutaireNaam || "",
          address: address?.volledigAdres || "",
          street: address?.straatnaam || "",
          houseNumber: address?.huisnummer?.toString() || "",
          houseNumberAddition: address?.huisletter || address?.huisnummerToevoeging || "",
          city: address?.plaats || "",
          postalCode: address?.postcode || "",
          kvkNumber: kvkData.kvkNummer,
          status: "Active", // KvK API doesn't provide status in test data
          industry: mainActivity ? mapSbiToIndustry(mainActivity.sbiCode, mainActivity.sbiOmschrijving) : "Other",
          employeeCount: 0 // Not available in basic profile
        }

        return NextResponse.json({
          success: true,
          company
        } as CompanyLookupResponse)

      } catch (error) {
        console.error("KvK API error:", error)
        return NextResponse.json({
          success: false,
          error: "Failed to lookup company information from KvK"
        } as CompanyLookupResponse, { status: 500 })
      }
    }

    if (name && action === "search") {
      // Search functionality not implemented for KvK API yet
      return NextResponse.json({
        success: false,
        error: "Search by name not yet implemented with KvK API"
      } as CompanyLookupResponse, { status: 501 })
    }

    return NextResponse.json({
      success: false,
      error: "Please provide either kvkNumber or name parameter"
    } as CompanyLookupResponse, { status: 400 })

  } catch (error) {
    console.error("KvK lookup error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to lookup company information"
    } as CompanyLookupResponse, { status: 500 })
  }
}

