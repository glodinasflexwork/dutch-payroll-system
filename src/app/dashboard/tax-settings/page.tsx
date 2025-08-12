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
  Info,
  Euro,
  Calculator,
  Trash2,
  Copy,
  Download,
  Upload
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete these tax settings?')) {
      return
    }

    try {
      const response = await fetch(`/api/tax-settings/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTaxSettings()
      } else {
        alert('Failed to delete tax settings')
      }
    } catch (error) {
      alert('Network error. Please try again.')
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

  const duplicateSettings = (settings: TaxSettings) => {
    setFormData({
      taxYear: new Date().getFullYear(),
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
      isActive: false
    })
    setEditingId(null)
    setShowForm(true)
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(taxSettings, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `tax-settings-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
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

  const calculateTotalTaxRate = (settings: TaxSettings) => {
    return settings.aowRate + settings.wlzRate + settings.wwRate + settings.wiaRate + settings.zvwRate
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
        {/* Enhanced Action Buttons */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tax Configuration</h2>
            <p className="text-gray-600 mt-1">Manage Dutch tax rates and compliance settings</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              onClick={exportSettings}
              className="flex items-center space-x-2 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button 
              onClick={() => {
                resetForm()
                setShowForm(true)
                setEditingId(null)
              }}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Add Tax Year</span>
            </Button>
          </div>
        </div>

        {/* Professional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Tax Years</p>
                  <p className="text-3xl font-bold text-blue-800">{taxSettings.length}</p>
                  <p className="text-sm text-blue-600 mt-1">
                    <Settings className="w-4 h-4 inline mr-1" />
                    Configured
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Active Year</p>
                  <p className="text-3xl font-bold text-blue-800">
                    {taxSettings.find(ts => ts.isActive)?.taxYear || new Date().getFullYear()}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    <Euro className="w-4 h-4 inline mr-1" />
                    Current
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Euro className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-700 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Total Tax Rate</p>
                  <p className="text-3xl font-bold text-blue-800">
                    {taxSettings.find(ts => ts.isActive) 
                      ? formatPercentage(calculateTotalTaxRate(taxSettings.find(ts => ts.isActive)!))
                      : '0%'}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    <Calculator className="w-4 h-4 inline mr-1" />
                    Combined
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Settings className="w-6 h-6 text-blue-800" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-800 hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">Compliance</p>
                  <p className="text-3xl font-bold text-blue-800">✓</p>
                  <p className="text-sm text-blue-600 mt-1">
                    <Info className="w-4 h-4 inline mr-1" />
                    Dutch Law
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Info className="w-6 h-6 text-blue-900" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Tax Settings */}
        {taxSettings.filter(ts => ts.isActive).slice(0, 1).map(activeSetting => (
          <Card key={activeSetting.id} className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-800">Active Tax Settings ({activeSetting.taxYear})</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="success">Active</Badge>
                  <Badge variant="info">
                    Total: {formatPercentage(calculateTotalTaxRate(activeSetting))}
                  </Badge>
                </div>
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
                  <p className="text-xs text-green-600">Max: {formatCurrency(activeSetting.aowMaxBase)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">WLZ (Long-term Care)</p>
                  <p className="text-lg font-bold text-green-900">{formatPercentage(activeSetting.wlzRate)}</p>
                  <p className="text-xs text-green-600">Max: {formatCurrency(activeSetting.wlzMaxBase)}</p>
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
              <div className="mt-4 pt-4 border-t border-green-200">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-green-800">WW (Unemployment)</p>
                    <p className="text-lg font-bold text-green-900">{formatPercentage(activeSetting.wwRate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">WIA (Disability)</p>
                    <p className="text-lg font-bold text-green-900">{formatPercentage(activeSetting.wiaRate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Minimum Wage</p>
                    <p className="text-lg font-bold text-green-900">{formatCurrency(activeSetting.minimumWage)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add/Edit Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                {editingId ? 'Edit Tax Settings' : 'Add New Tax Year'}
              </CardTitle>
              <CardDescription>
                Configure Dutch tax rates and social security contributions for a specific year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tax Year</label>
                    <Input
                      type="number"
                      value={formData.taxYear}
                      onChange={(e) => handleInputChange('taxYear', parseInt(e.target.value))}
                      min="2020"
                      max="2030"
                    />
                    {errors.taxYear && <p className="text-red-500 text-sm mt-1">{errors.taxYear}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Wage (Monthly)</label>
                    <Input
                      type="number"
                      value={formData.minimumWage}
                      onChange={(e) => handleInputChange('minimumWage', parseFloat(e.target.value))}
                      step="0.01"
                    />
                    {errors.minimumWage && <p className="text-red-500 text-sm mt-1">{errors.minimumWage}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Holiday Allowance (%)</label>
                    <Input
                      type="number"
                      value={formData.holidayAllowanceRate}
                      onChange={(e) => handleInputChange('holidayAllowanceRate', parseFloat(e.target.value))}
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Social Security */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Euro className="w-5 h-5 mr-2" />
                    Social Security Contributions (Loonheffing)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">AOW Rate (%) - Pension</label>
                        <Input
                          type="number"
                          value={formData.aowRate}
                          onChange={(e) => handleInputChange('aowRate', parseFloat(e.target.value))}
                          step="0.01"
                        />
                        {errors.aowRate && <p className="text-red-500 text-sm mt-1">{errors.aowRate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">WLZ Rate (%) - Long-term Care</label>
                        <Input
                          type="number"
                          value={formData.wlzRate}
                          onChange={(e) => handleInputChange('wlzRate', parseFloat(e.target.value))}
                          step="0.01"
                        />
                        {errors.wlzRate && <p className="text-red-500 text-sm mt-1">{errors.wlzRate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">ZVW Rate (%) - Health Insurance</label>
                        <Input
                          type="number"
                          value={formData.zvwRate}
                          onChange={(e) => handleInputChange('zvwRate', parseFloat(e.target.value))}
                          step="0.01"
                        />
                        {errors.zvwRate && <p className="text-red-500 text-sm mt-1">{errors.zvwRate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">WW Rate (%) - Unemployment</label>
                        <Input
                          type="number"
                          value={formData.wwRate}
                          onChange={(e) => handleInputChange('wwRate', parseFloat(e.target.value))}
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">WIA Rate (%) - Disability</label>
                        <Input
                          type="number"
                          value={formData.wiaRate}
                          onChange={(e) => handleInputChange('wiaRate', parseFloat(e.target.value))}
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">AOW Max Base (€)</label>
                        <Input
                          type="number"
                          value={formData.aowMaxBase}
                          onChange={(e) => handleInputChange('aowMaxBase', parseFloat(e.target.value))}
                          step="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">WLZ Max Base (€)</label>
                        <Input
                          type="number"
                          value={formData.wlzMaxBase}
                          onChange={(e) => handleInputChange('wlzMaxBase', parseFloat(e.target.value))}
                          step="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">WW Max Base (€)</label>
                        <Input
                          type="number"
                          value={formData.wwMaxBase}
                          onChange={(e) => handleInputChange('wwMaxBase', parseFloat(e.target.value))}
                          step="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">WIA Max Base (€)</label>
                        <Input
                          type="number"
                          value={formData.wiaMaxBase}
                          onChange={(e) => handleInputChange('wiaMaxBase', parseFloat(e.target.value))}
                          step="1"
                        />
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-800">Total Tax Rate</p>
                        <p className="text-lg font-bold text-blue-900">
                          {formatPercentage(formData.aowRate + formData.wlzRate + formData.wwRate + formData.wiaRate + formData.zvwRate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Setting */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium">
                    Set as active tax settings (will deactivate other years)
                  </label>
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 text-sm">{errors.submit}</p>
                  </div>
                )}

                {/* Form Actions */}
                <div className="flex items-center space-x-4">
                  <Button type="submit" disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingId ? 'Update Settings' : 'Save Settings'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false)
                      setEditingId(null)
                      resetForm()
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

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
                        <Badge variant="outline">
                          Total: {formatPercentage(calculateTotalTaxRate(settings))}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => duplicateSettings(settings)}
                          title="Duplicate for new year"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(settings)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        {!settings.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(settings.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
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
              <p><strong>Income Tax:</strong> NOT calculated in payroll software - handled by tax advisors annually</p>
              <p><strong>AOW:</strong> Old-age pension contribution, typically around 17.90%</p>
              <p><strong>WLZ:</strong> Long-term care insurance, typically around 9.65%</p>
              <p><strong>WW:</strong> Unemployment insurance, varies by sector (around 2.94%)</p>
              <p><strong>WIA:</strong> Work and income capacity insurance (around 0.58%)</p>
              <p><strong>ZVW:</strong> Health insurance contribution, typically around 5.65%</p>
              <p><strong>Holiday Allowance:</strong> Mandatory 8% of annual salary (vakantiegeld)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

