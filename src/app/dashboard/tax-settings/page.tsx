'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Plus, 
  Edit,
  Save,
  X,
  Info
} from "lucide-react"

interface TaxSettings {
  id: string
  taxYear: number
  aowRate: number
  wlzRate: number
  wwRate: number
  wiaRate: number
  zvwRate: number
  aowMaxBase: number
  wlzMaxBase: number
  wwMaxBase: number
  wiaMaxBase: number
  holidayAllowanceRate: number
  minimumWage: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface TaxSettingsForm {
  taxYear: number
  aowRate: number
  wlzRate: number
  wwRate: number
  wiaRate: number
  zvwRate: number
  aowMaxBase: number
  wlzMaxBase: number
  wwMaxBase: number
  wiaMaxBase: number
  holidayAllowanceRate: number
  minimumWage: number
  isActive: boolean
}

export default function TaxSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [taxSettings, setTaxSettings] = useState<TaxSettings[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<TaxSettingsForm>({
    taxYear: new Date().getFullYear(),
    aowRate: 17.90,
    wlzRate: 9.65,
    wwRate: 2.70,
    wiaRate: 0.60,
    zvwRate: 5.65,
    aowMaxBase: 40000,
    wlzMaxBase: 40000,
    wwMaxBase: 69000,
    wiaMaxBase: 69000,
    holidayAllowanceRate: 8.0,
    minimumWage: 1995,
    isActive: true
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.companyId) {
      fetchTaxSettings()
    }
  }, [session])

  const fetchTaxSettings = async () => {
    try {
      const response = await fetch("/api/tax-settings")
      if (response.ok) {
        const data = await response.json()
        setTaxSettings(data)
      }
    } catch (error) {
      console.error("Error fetching tax settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof TaxSettingsForm, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (formData.taxYear < 2020 || formData.taxYear > 2030) {
      newErrors.taxYear = 'Tax year must be between 2020 and 2030'
    }

    if (formData.aowRate < 0 || formData.aowRate > 100) {
      newErrors.aowRate = 'AOW rate must be between 0 and 100%'
    }

    if (formData.wlzRate < 0 || formData.wlzRate > 100) {
      newErrors.wlzRate = 'WLZ rate must be between 0 and 100%'
    }

    if (formData.zvwRate < 0 || formData.zvwRate > 100) {
      newErrors.zvwRate = 'ZVW rate must be between 0 and 100%'
    }

    if (formData.minimumWage <= 0) {
      newErrors.minimumWage = 'Minimum wage must be positive'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const url = editingId ? `/api/tax-settings/${editingId}` : '/api/tax-settings'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchTaxSettings()
        setShowForm(false)
        setEditingId(null)
        resetForm()
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.error || 'Failed to save tax settings' })
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      taxYear: new Date().getFullYear(),
      aowRate: 17.90,
      wlzRate: 9.65,
      wwRate: 2.70,
      wiaRate: 0.60,
      zvwRate: 5.65,
      aowMaxBase: 40000,
      wlzMaxBase: 40000,
      wwMaxBase: 69000,
      wiaMaxBase: 69000,
      holidayAllowanceRate: 8.0,
      minimumWage: 1995,
      isActive: true
    })
    setErrors({})
  }

  const startEdit = (settings: TaxSettings) => {
    setFormData({
      taxYear: settings.taxYear,
      aowRate: settings.aowRate,
      wlzRate: settings.wlzRate,
      wwRate: settings.wwRate,
      wiaRate: settings.wiaRate,
      zvwRate: settings.zvwRate,
      aowMaxBase: settings.aowMaxBase,
      wlzMaxBase: settings.wlzMaxBase,
      wwMaxBase: settings.wwMaxBase,
      wiaMaxBase: settings.wiaMaxBase,
      holidayAllowanceRate: settings.holidayAllowanceRate,
      minimumWage: settings.minimumWage,
      isActive: settings.isActive
    })
    setEditingId(settings.id)
    setShowForm(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(2)}%`
  }

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tax settings...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tax Settings</h1>
            <p className="text-gray-500">Configure Dutch tax rates and social security contributions</p>
          </div>
          <Button 
            onClick={() => {
              resetForm()
              setShowForm(true)
              setEditingId(null)
            }}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Tax Year</span>
          </Button>
        </div>

        {/* Current Tax Settings */}
        {taxSettings.filter(ts => ts.isActive).slice(0, 1).map(activeSetting => (
          <Card key={activeSetting.id} className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-800">Active Tax Settings ({activeSetting.taxYear})</CardTitle>
                <Badge variant="success">Active</Badge>
              </div>
              <CardDescription className="text-green-600">
                Currently applied tax rates and social security contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-green-800">AOW (Pension)</p>
                  <p className="text-lg font-bold text-green-900">{formatPercentage(activeSetting.aowRate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">WLZ (Long-term Care)</p>
                  <p className="text-lg font-bold text-green-900">{formatPercentage(activeSetting.wlzRate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">ZVW (Health Insurance)</p>
                  <p className="text-lg font-bold text-green-900">{formatPercentage(activeSetting.zvwRate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Holiday Allowance</p>
                  <p className="text-lg font-bold text-green-900">{formatPercentage(activeSetting.holidayAllowanceRate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Tax Settings History */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Settings History</CardTitle>
            <CardDescription>
              All configured tax years and their settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {taxSettings.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900">No tax settings configured</p>
                <p className="text-sm text-gray-500 mb-4">Get started by adding tax settings for the current year</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tax Settings
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {taxSettings.map((settings) => (
                  <div key={settings.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">{settings.taxYear}</h3>
                        {settings.isActive && <Badge variant="success">Active</Badge>}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(settings)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div>
                        <p className="font-medium text-gray-600">AOW</p>
                        <p>{formatPercentage(settings.aowRate)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">WLZ</p>
                        <p>{formatPercentage(settings.wlzRate)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">WW</p>
                        <p>{formatPercentage(settings.wwRate)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">WIA</p>
                        <p>{formatPercentage(settings.wiaRate)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">ZVW</p>
                        <p>{formatPercentage(settings.zvwRate)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Holiday Allowance</p>
                        <p>{formatPercentage(settings.holidayAllowanceRate)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Dutch Tax Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="space-y-2 text-sm">
              <p><strong>Income Tax:</strong> Progressive tax with two brackets (2025: 36.93% up to €75,518, then 49.50%)</p>
              <p><strong>AOW:</strong> Old-age pension contribution, typically around 17.90%</p>
              <p><strong>WLZ:</strong> Long-term care insurance, typically around 9.65%</p>
              <p><strong>WW:</strong> Unemployment insurance, varies by sector (around 2.94%)</p>
              <p><strong>WIA:</strong> Work and income capacity insurance (around 0.58%)</p>
              <p><strong>Holiday Allowance:</strong> Mandatory 8% of annual salary (vakantiegeld)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

