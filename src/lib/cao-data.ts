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
  sector: 'private' | 'public' | 'semi-public'
}

export interface DGAInfo {
  id: string
  name: string
  fullName: string
  description: string
  minimumSalary: number // Annual minimum salary for DGA
  taxRules: {
    incomeTax: boolean
    socialSecurity: {
      aow: boolean // AOW (state pension)
      wlz: boolean // WLZ (long-term care)
      ww: boolean // WW (unemployment) - DGAs are excluded
      wia: boolean // WIA (disability) - DGAs are excluded
    }
  }
  benefits: {
    unemploymentBenefit: boolean
    sicknessBenefit: boolean
    disabilityBenefit: boolean
  }
  lastUpdated: string
}

export const DGA_INFO: DGAInfo = {
  id: "dga",
  name: "DGA",
  fullName: "Directeur-Grootaandeelhouder",
  description: "Director-major shareholder with at least 5% ownership. Special tax and employment rules apply.",
  minimumSalary: 48000, // 2025 minimum
  taxRules: {
    incomeTax: true,
    socialSecurity: {
      aow: true,  // DGAs pay AOW
      wlz: true,  // DGAs pay WLZ
      ww: false,  // DGAs don't pay WW
      wia: false  // DGAs don't pay WIA
    }
  },
  benefits: {
    unemploymentBenefit: false, // DGAs can't claim WW
    sicknessBenefit: false,     // No automatic sickness benefit
    disabilityBenefit: false    // No WIA benefits
  },
  lastUpdated: "2025-01-01"
}

export const DUTCH_CAOS: CAOInfo[] = [
  // Technology & IT
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
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.ictcao.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },
  {
    id: "cao-uitzendkrachten",
    name: "CAO Uitzendkrachten",
    fullName: "Collectieve Arbeidsovereenkomst voor Uitzendkrachten",
    industry: "Temporary Employment",
    description: "CAO voor uitzendkrachten en tijdelijke werknemers via uitzendbureaus.",
    minimumWage: 2200,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.abu.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },

  // Manufacturing & Industry
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
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.metalektro.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },
  {
    id: "cao-chemie",
    name: "CAO Chemie",
    fullName: "Collectieve Arbeidsovereenkomst Chemische Industrie",
    industry: "Chemical Industry",
    description: "CAO voor werknemers in de chemische industrie, petrochemie en farmaceutische sector.",
    minimumWage: 2900,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.chemiecao.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },
  {
    id: "cao-voeding",
    name: "CAO Voeding",
    fullName: "Collectieve Arbeidsovereenkomst Voedingsindustrie",
    industry: "Food Industry",
    description: "CAO voor werknemers in de voedingsmiddelenindustrie en drankenindustrie.",
    minimumWage: 2500,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.voedingindustrie.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },

  // Construction & Real Estate
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
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.bouwnijverheid.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },
  {
    id: "cao-installatie",
    name: "CAO Installatie",
    fullName: "Collectieve Arbeidsovereenkomst Installatietechniek",
    industry: "Installation Technology",
    description: "CAO voor installatiebedrijven: elektro, sanitair, verwarming en airconditioning.",
    minimumWage: 2600,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.installatietechniek.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },
  {
    id: "cao-makelaardij",
    name: "CAO Makelaardij",
    fullName: "Collectieve Arbeidsovereenkomst Makelaardij",
    industry: "Real Estate",
    description: "CAO voor makelaars, taxateurs en vastgoedprofessionals.",
    minimumWage: 2700,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.nvm.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },

  // Healthcare & Social Services
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
    overtimeRules: { threshold: 36, rate: 1.5 },
    website: "https://www.caozorg.nl",
    lastUpdated: "2025-01-01",
    sector: 'semi-public'
  },
  {
    id: "cao-vvt",
    name: "CAO VVT",
    fullName: "Collectieve Arbeidsovereenkomst Verpleeg- en Verzorgingshuizen",
    industry: "Nursing Homes",
    description: "CAO voor werknemers in verpleeg- en verzorgingshuizen en thuiszorgorganisaties.",
    minimumWage: 2300,
    standardWorkingHours: 36,
    holidayDays: 26,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 36, rate: 1.5 },
    website: "https://www.vvt-cao.nl",
    lastUpdated: "2025-01-01",
    sector: 'semi-public'
  },
  {
    id: "cao-ggz",
    name: "CAO GGZ",
    fullName: "Collectieve Arbeidsovereenkomst Geestelijke Gezondheidszorg",
    industry: "Mental Healthcare",
    description: "CAO voor werknemers in de geestelijke gezondheidszorg en psychiatrie.",
    minimumWage: 2500,
    standardWorkingHours: 36,
    holidayDays: 26,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 36, rate: 1.5 },
    website: "https://www.ggz-cao.nl",
    lastUpdated: "2025-01-01",
    sector: 'semi-public'
  },

  // Education
  {
    id: "cao-po",
    name: "CAO Primair Onderwijs",
    fullName: "Collectieve Arbeidsovereenkomst Primair Onderwijs",
    industry: "Primary Education",
    description: "CAO voor onderwijspersoneel in het basisonderwijs en speciaal onderwijs.",
    minimumWage: 2700,
    standardWorkingHours: 40,
    holidayDays: 30,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.25 },
    website: "https://www.cao-po.nl",
    lastUpdated: "2025-01-01",
    sector: 'public'
  },
  {
    id: "cao-vo",
    name: "CAO Voortgezet Onderwijs",
    fullName: "Collectieve Arbeidsovereenkomst Voortgezet Onderwijs",
    industry: "Secondary Education",
    description: "CAO voor docenten en ondersteunend personeel in het voortgezet onderwijs.",
    minimumWage: 2800,
    standardWorkingHours: 40,
    holidayDays: 30,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.25 },
    website: "https://www.cao-vo.nl",
    lastUpdated: "2025-01-01",
    sector: 'public'
  },
  {
    id: "cao-hbo",
    name: "CAO HBO",
    fullName: "Collectieve Arbeidsovereenkomst Hoger Beroepsonderwijs",
    industry: "Higher Professional Education",
    description: "CAO voor docenten en medewerkers bij hogescholen en universiteiten van toegepaste wetenschappen.",
    minimumWage: 3200,
    standardWorkingHours: 40,
    holidayDays: 30,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.25 },
    website: "https://www.cao-hbo.nl",
    lastUpdated: "2025-01-01",
    sector: 'public'
  },

  // Retail & Hospitality
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
    overtimeRules: { threshold: 38, rate: 1.5 },
    website: "https://www.detailhandelcao.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
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
    overtimeRules: { threshold: 38, rate: 1.5 },
    website: "https://www.horecacao.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },
  {
    id: "cao-supermarkten",
    name: "CAO Supermarkten",
    fullName: "Collectieve Arbeidsovereenkomst Supermarkten",
    industry: "Supermarkets",
    description: "CAO specifiek voor supermarktketens en grootwinkelbedrijven.",
    minimumWage: 2250,
    standardWorkingHours: 38,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 38, rate: 1.5 },
    website: "https://www.supermarktcao.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },

  // Transport & Logistics
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
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.transportcao.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },
  {
    id: "cao-ov",
    name: "CAO Openbaar Vervoer",
    fullName: "Collectieve Arbeidsovereenkomst Openbaar Vervoer",
    industry: "Public Transportation",
    description: "CAO voor werknemers bij bus-, tram- en metromaatschappijen.",
    minimumWage: 2600,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.ov-cao.nl",
    lastUpdated: "2025-01-01",
    sector: 'semi-public'
  },
  {
    id: "cao-havenbedrijven",
    name: "CAO Havenbedrijven",
    fullName: "Collectieve Arbeidsovereenkomst Havenbedrijven",
    industry: "Port Operations",
    description: "CAO voor werknemers in havenbedrijven en scheepvaart.",
    minimumWage: 2800,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.havencao.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },

  // Financial Services
  {
    id: "cao-banken",
    name: "CAO Banken",
    fullName: "Collectieve Arbeidsovereenkomst Banken",
    industry: "Banking",
    description: "CAO voor werknemers bij banken en financiële instellingen.",
    minimumWage: 3000,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.bankencao.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },
  {
    id: "cao-verzekeringen",
    name: "CAO Verzekeringen",
    fullName: "Collectieve Arbeidsovereenkomst Verzekeringsbedrijven",
    industry: "Insurance",
    description: "CAO voor werknemers bij verzekeraars en assurantiebedrijven.",
    minimumWage: 2900,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.verzekeringencao.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },
  {
    id: "cao-accountancy",
    name: "CAO Accountancy",
    fullName: "Collectieve Arbeidsovereenkomst Accountantskantoren",
    industry: "Accounting & Auditing",
    description: "CAO voor accountants, belastingadviseurs en administratiekantoren.",
    minimumWage: 2800,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.accountancycao.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },

  // Government & Public Sector
  {
    id: "cao-rijk",
    name: "CAO Rijk",
    fullName: "Collectieve Arbeidsovereenkomst Rijk",
    industry: "Central Government",
    description: "CAO voor rijksambtenaren en overheidspersoneel.",
    minimumWage: 2800,
    standardWorkingHours: 36,
    holidayDays: 29,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 36, rate: 1.5 },
    website: "https://www.rijksoverheid.nl/cao",
    lastUpdated: "2025-01-01",
    sector: 'public'
  },
  {
    id: "cao-gemeenten",
    name: "CAO Gemeenten",
    fullName: "Collectieve Arbeidsovereenkomst Nederlandse Gemeenten",
    industry: "Local Government",
    description: "CAO voor gemeenteambtenaren en lokaal overheidspersoneel.",
    minimumWage: 2700,
    standardWorkingHours: 36,
    holidayDays: 29,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 36, rate: 1.5 },
    website: "https://www.vng.nl/cao",
    lastUpdated: "2025-01-01",
    sector: 'public'
  },
  {
    id: "cao-politie",
    name: "CAO Politie",
    fullName: "Collectieve Arbeidsovereenkomst Politie",
    industry: "Police",
    description: "CAO voor politieagenten en ondersteunend politiepersoneel.",
    minimumWage: 2900,
    standardWorkingHours: 36,
    holidayDays: 29,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 36, rate: 1.5 },
    website: "https://www.politie.nl/cao",
    lastUpdated: "2025-01-01",
    sector: 'public'
  },

  // Media & Communication
  {
    id: "cao-grafimedia",
    name: "CAO Grafimedia",
    fullName: "Collectieve Arbeidsovereenkomst Grafische Industrie",
    industry: "Graphic & Media",
    description: "CAO voor werknemers in de grafische industrie, drukkerijen en media.",
    minimumWage: 2500,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.grafimedia.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },
  {
    id: "cao-omroep",
    name: "CAO Omroep",
    fullName: "Collectieve Arbeidsovereenkomst Omroeporganisaties",
    industry: "Broadcasting",
    description: "CAO voor werknemers bij radio- en televisieomroepen.",
    minimumWage: 2800,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.omroepcao.nl",
    lastUpdated: "2025-01-01",
    sector: 'semi-public'
  },

  // Agriculture & Environment
  {
    id: "cao-land-tuinbouw",
    name: "CAO Land- en Tuinbouw",
    fullName: "Collectieve Arbeidsovereenkomst Land- en Tuinbouw",
    industry: "Agriculture & Horticulture",
    description: "CAO voor werknemers in de land- en tuinbouw, inclusief glastuinbouw.",
    minimumWage: 2300,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.lto.nl/cao",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },
  {
    id: "cao-afvalbeheer",
    name: "CAO Afvalbeheer",
    fullName: "Collectieve Arbeidsovereenkomst Afvalbeheer",
    industry: "Waste Management",
    description: "CAO voor werknemers in afvalinzameling, recycling en milieudiensten.",
    minimumWage: 2400,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.afvalcao.nl",
    lastUpdated: "2025-01-01",
    sector: 'semi-public'
  },

  // Professional Services
  {
    id: "cao-advocatuur",
    name: "CAO Advocatuur",
    fullName: "Collectieve Arbeidsovereenkomst Advocatenkantoren",
    industry: "Legal Services",
    description: "CAO voor werknemers bij advocatenkantoren en juridische dienstverlening.",
    minimumWage: 3000,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.advocatuur.nl/cao",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },
  {
    id: "cao-architectenbureaus",
    name: "CAO Architectenbureaus",
    fullName: "Collectieve Arbeidsovereenkomst Architectenbureaus",
    industry: "Architecture & Design",
    description: "CAO voor architecten, stedenbouwkundigen en ontwerpbureaus.",
    minimumWage: 2700,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.architectencao.nl",
    lastUpdated: "2025-01-01",
    sector: 'private'
  },

  // Energy & Utilities
  {
    id: "cao-energie",
    name: "CAO Energie",
    fullName: "Collectieve Arbeidsovereenkomst Energiebedrijven",
    industry: "Energy & Utilities",
    description: "CAO voor werknemers bij gas-, water- en elektriciteitsbedrijven.",
    minimumWage: 2900,
    standardWorkingHours: 40,
    holidayDays: 25,
    holidayAllowanceRate: 8.0,
    overtimeRules: { threshold: 40, rate: 1.5 },
    website: "https://www.energiecao.nl",
    lastUpdated: "2025-01-01",
    sector: 'semi-public'
  },

  // Default/Other
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
    overtimeRules: { threshold: 40, rate: 1.5 },
    lastUpdated: "2025-01-01",
    sector: 'private'
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

export function getEmploymentTypeOptions(): Array<{ value: string; label: string; description: string }> {
  return [
    {
      value: 'employee',
      label: 'Regular Employee',
      description: 'Standard employment contract under CAO or general labor law'
    },
    {
      value: 'dga',
      label: 'DGA (Director-Major Shareholder)',
      description: 'Director with ≥5% ownership - special tax rules apply'
    }
  ]
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

// DGA-specific functions
export function isDGA(employmentType: string): boolean {
  return employmentType === 'dga'
}

export function getDGAMinimumSalary(): number {
  return DGA_INFO.minimumSalary
}

export function getDGATaxRules(): DGAInfo['taxRules'] {
  return DGA_INFO.taxRules
}

export function validateDGASalary(annualSalary: number): { valid: boolean; message?: string } {
  const minimum = getDGAMinimumSalary()
  if (annualSalary < minimum) {
    return {
      valid: false,
      message: `DGA minimum salary is €${minimum.toLocaleString()} per year (€${Math.round(minimum/12).toLocaleString()} per month)`
    }
  }
  return { valid: true }
}

// Get applicable social security contributions based on employment type
export function getSocialSecurityContributions(employmentType: string): {
  aow: boolean;
  wlz: boolean;
  ww: boolean;
  wia: boolean;
} {
  if (isDGA(employmentType)) {
    return DGA_INFO.taxRules.socialSecurity
  }
  
  // Regular employees pay all contributions
  return {
    aow: true,
    wlz: true,
    ww: true,
    wia: true
  }
}

// Get employment benefits based on type
export function getEmploymentBenefits(employmentType: string): DGAInfo['benefits'] {
  if (isDGA(employmentType)) {
    return DGA_INFO.benefits
  }
  
  // Regular employees have all benefits
  return {
    unemploymentBenefit: true,
    sicknessBenefit: true,
    disabilityBenefit: true
  }
}

// Get sector information
export function getSectorInfo(): Array<{ value: string; label: string; count: number }> {
  const sectorCounts = DUTCH_CAOS.reduce((acc, cao) => {
    acc[cao.sector] = (acc[cao.sector] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return [
    { value: 'private', label: 'Private Sector', count: sectorCounts.private || 0 },
    { value: 'public', label: 'Public Sector', count: sectorCounts.public || 0 },
    { value: 'semi-public', label: 'Semi-Public Sector', count: sectorCounts['semi-public'] || 0 }
  ]
}

