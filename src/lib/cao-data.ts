// Dutch CAO (Collective Labor Agreement) data structure
// This maps industries to their corresponding CAOs with relevant payroll information

export interface CAOInfo {
  id: string
  name: string
  fullName: string
  industry: string
  description: string
  minimumWage?: number // Monthly minimum wage in euros
  standardWorkingHours: number // Hours per week
  holidayDays: number // Minimum holiday days per year
  holidayAllowanceRate: number // Percentage (usually 8% but can vary)
  overtimeRules: {
    threshold: number // Hours per week before overtime
    rate: number // Multiplier for overtime pay
  }
  website?: string
  lastUpdated: string
}

export const DUTCH_CAOS: CAOInfo[] = [
  {
    id: "cao-ict",
    name: "CAO ICT",
    fullName: "Collectieve Arbeidsovereenkomst voor de ICT-sector",
    industry: "Information Technology",
    description: "CAO voor werknemers in de ICT-sector, inclusief software development, IT-consultancy en technische dienstverlening.",
    minimumWage: 2800,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: {
      threshold: 40,
      rate: 1.5
    },
    website: "https://www.ictcao.nl",
    lastUpdated: "2025-01-01"
  },
  {
    id: "cao-metalektro",
    name: "CAO Metalektro",
    fullName: "Collectieve Arbeidsovereenkomst Metalektro",
    industry: "Manufacturing & Engineering",
    description: "CAO voor de metaal- en elektrotechnische industrie, inclusief machinebouw en automotive.",
    minimumWage: 2600,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: {
      threshold: 40,
      rate: 1.5
    },
    website: "https://www.metalektro.nl",
    lastUpdated: "2025-01-01"
  },
  {
    id: "cao-bouw",
    name: "CAO Bouw",
    fullName: "Collectieve Arbeidsovereenkomst Bouwnijverheid",
    industry: "Construction",
    description: "CAO voor de bouwnijverheid, inclusief woningbouw, utiliteitsbouw en infrastructuur.",
    minimumWage: 2500,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: {
      threshold: 40,
      rate: 1.5
    },
    website: "https://www.bouwnijverheid.nl",
    lastUpdated: "2025-01-01"
  },
  {
    id: "cao-zorg",
    name: "CAO Zorg",
    fullName: "Collectieve Arbeidsovereenkomst Zorg en Welzijn",
    industry: "Healthcare",
    description: "CAO voor zorgverleners in ziekenhuizen, verpleeghuizen en thuiszorg.",
    minimumWage: 2400,
    standardWorkingHours: 36,
    holidayDays: 26,
    holidayAllowanceRate: 8.0,
    overtimeRules: {
      threshold: 36,
      rate: 1.5
    },
    website: "https://www.caozorg.nl",
    lastUpdated: "2025-01-01"
  },
  {
    id: "cao-onderwijs",
    name: "CAO Onderwijs",
    fullName: "Collectieve Arbeidsovereenkomst Primair Onderwijs",
    industry: "Education",
    description: "CAO voor onderwijspersoneel in het primair en voortgezet onderwijs.",
    minimumWage: 2700,
    standardWorkingHours: 40,
    holidayDays: 30,
    holidayAllowanceRate: 8.0,
    overtimeRules: {
      threshold: 40,
      rate: 1.25
    },
    website: "https://www.cao-onderwijs.nl",
    lastUpdated: "2025-01-01"
  },
  {
    id: "cao-horeca",
    name: "CAO Horeca",
    fullName: "Collectieve Arbeidsovereenkomst Horeca en Catering",
    industry: "Hospitality & Catering",
    description: "CAO voor restaurants, hotels, cafés en cateringbedrijven.",
    minimumWage: 2200,
    standardWorkingHours: 38,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: {
      threshold: 38,
      rate: 1.5
    },
    website: "https://www.horecacao.nl",
    lastUpdated: "2025-01-01"
  },
  {
    id: "cao-detailhandel",
    name: "CAO Detailhandel",
    fullName: "Collectieve Arbeidsovereenkomst Detailhandel",
    industry: "Retail",
    description: "CAO voor werknemers in winkels, supermarkten en andere detailhandel.",
    minimumWage: 2300,
    standardWorkingHours: 38,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: {
      threshold: 38,
      rate: 1.5
    },
    website: "https://www.detailhandelcao.nl",
    lastUpdated: "2025-01-01"
  },
  {
    id: "cao-transport",
    name: "CAO Transport",
    fullName: "Collectieve Arbeidsovereenkomst Goederenvervoer",
    industry: "Transportation & Logistics",
    description: "CAO voor transport- en logistieke bedrijven, inclusief vrachtvervoer.",
    minimumWage: 2400,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: {
      threshold: 40,
      rate: 1.5
    },
    website: "https://www.transportcao.nl",
    lastUpdated: "2025-01-01"
  },
  {
    id: "cao-financiele-dienstverlening",
    name: "CAO Financiële Dienstverlening",
    fullName: "Collectieve Arbeidsovereenkomst Financiële Dienstverlening",
    industry: "Financial Services",
    description: "CAO voor banken, verzekeraars en andere financiële instellingen.",
    minimumWage: 3000,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: {
      threshold: 40,
      rate: 1.5
    },
    website: "https://www.financielecao.nl",
    lastUpdated: "2025-01-01"
  },
  {
    id: "cao-overheid",
    name: "CAO Rijk",
    fullName: "Collectieve Arbeidsovereenkomst Rijk",
    industry: "Government",
    description: "CAO voor rijksambtenaren en overheidspersoneel.",
    minimumWage: 2800,
    standardWorkingHours: 36,
    holidayDays: 29,
    holidayAllowanceRate: 8.0,
    overtimeRules: {
      threshold: 36,
      rate: 1.5
    },
    website: "https://www.rijksoverheid.nl/cao",
    lastUpdated: "2025-01-01"
  },
  {
    id: "cao-algemeen",
    name: "Geen specifieke CAO",
    fullName: "Algemene arbeidsvoorwaarden (geen CAO)",
    industry: "Other",
    description: "Voor bedrijven die niet onder een specifieke CAO vallen. Gebruikt wettelijke minimumvoorwaarden.",
    minimumWage: 2070, // Wettelijk minimumloon 2025
    standardWorkingHours: 40,
    holidayDays: 20, // Wettelijk minimum
    holidayAllowanceRate: 8.0,
    overtimeRules: {
      threshold: 40,
      rate: 1.5
    },
    lastUpdated: "2025-01-01"
  }
]

// Helper functions
export function getCAOByIndustry(industry: string): CAOInfo | undefined {
  return DUTCH_CAOS.find(cao => cao.industry.toLowerCase() === industry.toLowerCase())
}

export function getCAOById(id: string): CAOInfo | undefined {
  return DUTCH_CAOS.find(cao => cao.id === id)
}

export function getAllIndustries(): string[] {
  return DUTCH_CAOS.map(cao => cao.industry).sort()
}

export function getIndustryOptions(): Array<{ value: string; label: string; cao: string }> {
  return DUTCH_CAOS.map(cao => ({
    value: cao.industry,
    label: cao.industry,
    cao: cao.name
  })).sort((a, b) => a.label.localeCompare(b.label))
}

// Calculate minimum wage based on CAO
export function calculateMinimumWage(industry: string, hoursPerWeek: number = 40): number {
  const cao = getCAOByIndustry(industry)
  if (!cao) return 2070 // Default minimum wage
  
  // Convert monthly to hourly, then calculate for specific hours
  const monthlyHours = (cao.standardWorkingHours * 52) / 12 // Average monthly hours
  const hourlyRate = cao.minimumWage / monthlyHours
  const weeklyHours = Math.min(hoursPerWeek, cao.standardWorkingHours) // Don't exceed standard hours
  
  return Math.round((hourlyRate * weeklyHours * 52) / 12) // Monthly wage
}

