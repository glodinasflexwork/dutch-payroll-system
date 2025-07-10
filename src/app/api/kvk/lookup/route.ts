import { NextRequest, NextResponse } from "next/server"

// Mock KvK data for demonstration
// In production, this would connect to the actual KvK API
const mockKvKData = [
  {
    kvkNumber: "12345678",
    name: "Tech Solutions B.V.",
    address: "Techniekstraat 123",
    city: "Amsterdam",
    postalCode: "1012AB",
    status: "active"
  },
  {
    kvkNumber: "87654321",
    name: "Digital Innovations B.V.",
    address: "Innovatielaan 456",
    city: "Utrecht",
    postalCode: "3511AB",
    status: "active"
  },
  {
    kvkNumber: "11223344",
    name: "Green Energy Solutions",
    address: "Duurzaamheidsweg 789",
    city: "Rotterdam",
    postalCode: "3011AB",
    status: "active"
  },
  {
    kvkNumber: "44332211",
    name: "Creative Design Studio",
    address: "Kunstlaan 321",
    city: "Den Haag",
    postalCode: "2511AB",
    status: "active"
  },
  {
    kvkNumber: "55667788",
    name: "Healthcare Partners B.V.",
    address: "Zorgstraat 654",
    city: "Eindhoven",
    postalCode: "5611AB",
    status: "active"
  }
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const kvkNumber = searchParams.get("kvkNumber")
    const name = searchParams.get("name")
    const action = searchParams.get("action")

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    if (kvkNumber) {
      // Lookup by KvK number
      const company = mockKvKData.find(c => c.kvkNumber === kvkNumber)
      
      if (company) {
        return NextResponse.json({
          success: true,
          company: {
            name: company.name,
            address: company.address,
            city: company.city,
            postalCode: company.postalCode,
            kvkNumber: company.kvkNumber,
            status: company.status
          }
        })
      } else {
        return NextResponse.json({
          success: false,
          error: "Company not found with this KvK number"
        }, { status: 404 })
      }
    }

    if (name && action === "search") {
      // Search by company name
      const companies = mockKvKData.filter(c => 
        c.name.toLowerCase().includes(name.toLowerCase())
      )

      return NextResponse.json({
        success: true,
        companies: companies.map(c => ({
          name: c.name,
          address: c.address,
          city: c.city,
          postalCode: c.postalCode,
          kvkNumber: c.kvkNumber,
          status: c.status
        }))
      })
    }

    return NextResponse.json({
      success: false,
      error: "Please provide either kvkNumber or name parameter"
    }, { status: 400 })

  } catch (error) {
    console.error("KvK lookup error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to lookup company information"
    }, { status: 500 })
  }
}

// For production use with actual KvK API:
/*
async function lookupKvKCompany(kvkNumber: string) {
  const KVK_API_KEY = process.env.KVK_API_KEY
  const KVK_API_URL = "https://api.kvk.nl/api/v1/zoeken"
  
  if (!KVK_API_KEY) {
    throw new Error("KvK API key not configured")
  }

  const response = await fetch(`${KVK_API_URL}?kvkNummer=${kvkNumber}`, {
    headers: {
      'apikey': KVK_API_KEY,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`KvK API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (data.resultaten && data.resultaten.length > 0) {
    const company = data.resultaten[0]
    return {
      name: company.naam,
      address: company.adres?.volledigAdres,
      city: company.adres?.plaats,
      postalCode: company.adres?.postcode,
      kvkNumber: company.kvkNummer,
      status: company.status
    }
  }
  
  return null
}

async function searchKvKCompanies(name: string) {
  const KVK_API_KEY = process.env.KVK_API_KEY
  const KVK_API_URL = "https://api.kvk.nl/api/v1/zoeken"
  
  if (!KVK_API_KEY) {
    throw new Error("KvK API key not configured")
  }

  const response = await fetch(`${KVK_API_URL}?naam=${encodeURIComponent(name)}`, {
    headers: {
      'apikey': KVK_API_KEY,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`KvK API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (data.resultaten) {
    return data.resultaten.map((company: any) => ({
      name: company.naam,
      address: company.adres?.volledigAdres,
      city: company.adres?.plaats,
      postalCode: company.adres?.postcode,
      kvkNumber: company.kvkNummer,
      status: company.status
    }))
  }
  
  return []
}
*/

