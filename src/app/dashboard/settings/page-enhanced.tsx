'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { 
  Settings, 
  Globe, 
  Palette, 
  Bell, 
  Shield, 
  Database, 
  User, 
  Mail, 
  Smartphone, 
  Key, 
  Download, 
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

interface UserSettings {
  language: string
  theme: string
  emailNotifications: boolean
  smsNotifications: boolean
  securityAlerts: boolean
  marketingEmails: boolean
  twoFactorEnabled: boolean
  lastPasswordChange?: string
  loginHistory?: Array<{
    date: string
    location: string
    device: string
  }>
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings>({
    language: 'en',
    theme: 'light',
    emailNotifications: true,
    smsNotifications: false,
    securityAlerts: true,
    marketingEmails: false,
    twoFactorEnabled: false
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

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
        setSettings(prev => ({
          ...prev,
          ...data,
          language: data.language || 'en'
        }))
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
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success('Settings saved successfully')
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

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (response.ok) {
        toast.success('Password changed successfully')
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        toast.error('Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    }
  }

  const calculateAccountActivity = () => {
    // Mock calculation - in real app this would come from API
    return {
      settingsUpdated: 5,
      loginSessions: 12,
      securityScore: 85
    }
  }

  const getDaysSincePasswordChange = () => {
    // Mock calculation - in real app this would come from API
    return 45
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

  const accountActivity = calculateAccountActivity()
  const daysSincePasswordChange = getDaysSincePasswordChange()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Security Score</p>
                  <p className="text-3xl font-bold">{accountActivity.securityScore}%</p>
                  <p className="text-blue-100 text-sm">Account protection</p>
                </div>
                <Shield className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Active Sessions</p>
                  <p className="text-3xl font-bold">{accountActivity.loginSessions}</p>
                  <p className="text-blue-100 text-sm">Login history</p>
                </div>
                <Activity className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Password Age</p>
                  <p className="text-3xl font-bold">{daysSincePasswordChange}</p>
                  <p className="text-blue-100 text-sm">Days since change</p>
                </div>
                <Clock className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance Settings */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <CardTitle className="flex items-center space-x-2 text-white">
                <Palette className="w-5 h-5" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Customize your interface preferences
              </CardDescription>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                  <SelectTrigger className="focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                  <SelectTrigger className="focus:ring-blue-500 focus:border-blue-500">
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
                        <span>Nederlands</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <CardTitle className="flex items-center space-x-2 text-white">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Manage your notification preferences
              </CardDescription>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Email notifications</Label>
                  <p className="text-xs text-gray-600">Receive updates via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">SMS notifications</Label>
                  <p className="text-xs text-gray-600">Receive alerts via SMS</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Security alerts</Label>
                  <p className="text-xs text-gray-600">Important security notifications</p>
                </div>
                <Switch
                  checked={settings.securityAlerts}
                  onCheckedChange={(checked) => updateSetting('securityAlerts', checked)}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Marketing emails</Label>
                  <p className="text-xs text-gray-600">Product updates and offers</p>
                </div>
                <Switch
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) => updateSetting('marketingEmails', checked)}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <CardTitle className="flex items-center space-x-2 text-white">
                <Shield className="w-5 h-5" />
                <span>Security</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Protect your account and data
              </CardDescription>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Two-factor authentication</Label>
                  <p className="text-xs text-gray-600">Add extra security to your account</p>
                </div>
                <Switch
                  checked={settings.twoFactorEnabled}
                  onCheckedChange={(checked) => updateSetting('twoFactorEnabled', checked)}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <div className="space-y-3 pt-2 border-t">
                <Label className="text-sm font-medium">Change Password</Label>
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="focus:ring-blue-500 focus:border-blue-500 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  <Input
                    type="password"
                    placeholder="New password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Button 
                    onClick={handlePasswordChange}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <CardTitle className="flex items-center space-x-2 text-white">
                <Database className="w-5 h-5" />
                <span>Privacy & Data</span>
              </CardTitle>
              <CardDescription className="text-blue-100">
                Manage your data and privacy settings
              </CardDescription>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-blue-50 hover:border-blue-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export my data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-blue-50 hover:border-blue-300"
                >
                  <User className="w-4 h-4 mr-2" />
                  Privacy settings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete account
                </Button>
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs text-gray-600">
                  Data retention: Your data is stored securely and can be exported or deleted at any time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <CardTitle className="flex items-center space-x-2 text-white">
              <User className="w-5 h-5" />
              <span>Account Information</span>
            </CardTitle>
            <CardDescription className="text-blue-100">
              Your account details and activity
            </CardDescription>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Name</Label>
                  <p className="text-sm text-gray-900">{session?.user?.name || 'Not set'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <p className="text-sm text-gray-900">{session?.user?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Account Type</Label>
                  <p className="text-sm text-gray-900">Professional</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Member Since</Label>
                  <p className="text-sm text-gray-900">January 2024</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Last Login</Label>
                  <p className="text-sm text-gray-900">Today at 2:30 PM</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Settings Updated</Label>
                  <p className="text-sm text-gray-900">{accountActivity.settingsUpdated} times this month</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  )
}

