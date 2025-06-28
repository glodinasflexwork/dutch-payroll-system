'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Settings, Globe } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserSettings()
    }
  }, [session])

  const fetchUserSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/settings')
      if (response.ok) {
        const data = await response.json()
        setLanguage(data.language || 'en')
      }
    } catch (error) {
      console.error('Error fetching user settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language
        })
      })

      if (response.ok) {
        toast.success('Settings saved successfully')
        // Refresh the page to apply language changes
        router.refresh()
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="grid gap-6">
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Language Preferences</span>
              </CardTitle>
              <CardDescription>
                Choose your preferred language for the interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Interface Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🇺🇸</span>
                        <span>English</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="nl">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🇳🇱</span>
                        <span>Nederlands (Dutch)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600">
                  The interface will be displayed in your selected language. Changes take effect immediately after saving.
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={saveSettings} 
                  disabled={saving}
                  className="w-full sm:w-auto"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Name</Label>
                  <p className="text-sm text-gray-900">{session?.user?.name || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="text-sm text-gray-900">{session?.user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

