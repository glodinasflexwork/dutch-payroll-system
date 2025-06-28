'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Building2, Users, Crown, Mail, MoreHorizontal, Settings, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

interface Company {
  id: string
  name: string
  role: string
  isActive: boolean
  industry?: string
  employeeCount?: number
}

interface Invitation {
  id: string
  email: string
  role: string
  expiresAt: string
  companyName: string
}

export default function CompaniesPage() {
  const { data: session } = useSession()
  const [companies, setCompanies] = useState<Company[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<string>('')

  // Form states
  const [companyForm, setCompanyForm] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    kvkNumber: '',
    industry: '',
    description: ''
  })

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'employee'
  })

  useEffect(() => {
    fetchCompanies()
    fetchInvitations()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/user/companies')
      if (response.ok) {
        const data = await response.json()
        setCompanies(data.companies || [])
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/companies/invitations')
      if (response.ok) {
        const data = await response.json()
        setInvitations(data.invitations || [])
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error)
    }
  }

  const createCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/companies/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm)
      })

      if (response.ok) {
        setShowCreateDialog(false)
        setCompanyForm({
          name: '',
          address: '',
          city: '',
          postalCode: '',
          phone: '',
          email: '',
          website: '',
          kvkNumber: '',
          industry: '',
          description: ''
        })
        fetchCompanies()
      }
    } catch (error) {
      console.error('Failed to create company:', error)
    }
  }

  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompany) return

    try {
      const response = await fetch('/api/companies/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: selectedCompany,
          ...inviteForm
        })
      })

      if (response.ok) {
        setShowInviteDialog(false)
        setInviteForm({ email: '', role: 'employee' })
        setSelectedCompany('')
        fetchInvitations()
      }
    } catch (error) {
      console.error('Failed to send invitation:', error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'manager':
        return <Users className="h-4 w-4 text-green-500" />
      case 'hr':
        return <Users className="h-4 w-4 text-purple-500" />
      case 'accountant':
        return <Users className="h-4 w-4 text-orange-500" />
      default:
        return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'manager':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'hr':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'accountant':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'employee':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bedrijfsbeheer</h1>
            <p className="text-gray-600">Beheer uw bedrijven en teamleden</p>
          </div>
          <div className="flex items-center space-x-3">
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Uitnodigen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Teamlid uitnodigen</DialogTitle>
                  <DialogDescription>
                    Nodig een nieuwe gebruiker uit om deel te nemen aan een van uw bedrijven.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={sendInvitation} className="space-y-4">
                  <div>
                    <Label htmlFor="company">Bedrijf</Label>
                    <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer bedrijf" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.filter(c => ['owner', 'admin'].includes(c.role)).map(company => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="email">E-mailadres</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Rol</Label>
                    <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="employee">Medewerker</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="accountant">Boekhouder</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                      Annuleren
                    </Button>
                    <Button type="submit">Uitnodiging versturen</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuw Bedrijf
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Nieuw bedrijf aanmaken</DialogTitle>
                  <DialogDescription>
                    Voeg een nieuw bedrijf toe aan uw SalarySync account.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={createCompany} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Bedrijfsnaam *</Label>
                      <Input
                        id="name"
                        value={companyForm.name}
                        onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Branche</Label>
                      <Input
                        id="industry"
                        value={companyForm.industry}
                        onChange={(e) => setCompanyForm(prev => ({ ...prev, industry: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Adres</Label>
                    <Input
                      id="address"
                      value={companyForm.address}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Plaats</Label>
                      <Input
                        id="city"
                        value={companyForm.city}
                        onChange={(e) => setCompanyForm(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Postcode</Label>
                      <Input
                        id="postalCode"
                        value={companyForm.postalCode}
                        onChange={(e) => setCompanyForm(prev => ({ ...prev, postalCode: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefoon</Label>
                      <Input
                        id="phone"
                        value={companyForm.phone}
                        onChange={(e) => setCompanyForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={companyForm.email}
                        onChange={(e) => setCompanyForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={companyForm.website}
                        onChange={(e) => setCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="kvkNumber">KvK Nummer</Label>
                      <Input
                        id="kvkNumber"
                        value={companyForm.kvkNumber}
                        onChange={(e) => setCompanyForm(prev => ({ ...prev, kvkNumber: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Beschrijving</Label>
                    <Textarea
                      id="description"
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Annuleren
                    </Button>
                    <Button type="submit">Bedrijf aanmaken</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="companies" className="space-y-6">
          <TabsList>
            <TabsTrigger value="companies">Mijn Bedrijven ({companies.length})</TabsTrigger>
            <TabsTrigger value="invitations">Uitnodigingen ({invitations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-6">
            {companies.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Geen bedrijven gevonden</h3>
                  <p className="text-gray-500 text-center mb-6">
                    Maak uw eerste bedrijf aan om te beginnen met SalarySync.
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Eerste bedrijf aanmaken
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <Card key={company.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-gray-500" />
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Instellingen
                          </DropdownMenuItem>
                          {['owner', 'admin'].includes(company.role) && (
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Verwijderen
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Uw rol:</span>
                          <Badge className={getRoleBadgeColor(company.role)}>
                            <span className="flex items-center space-x-1">
                              {getRoleIcon(company.role)}
                              <span className="capitalize">{company.role}</span>
                            </span>
                          </Badge>
                        </div>
                        {company.industry && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Branche:</span>
                            <span className="text-sm font-medium">{company.industry}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Medewerkers:</span>
                          <span className="text-sm font-medium">{company.employeeCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Status:</span>
                          <Badge variant={company.isActive ? "default" : "secondary"}>
                            {company.isActive ? "Actief" : "Inactief"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invitations" className="space-y-6">
            {invitations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Mail className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Geen uitnodigingen</h3>
                  <p className="text-gray-500 text-center">
                    Verstuurde uitnodigingen verschijnen hier.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <Card key={invitation.id}>
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{invitation.email}</p>
                          <p className="text-sm text-gray-500">
                            Uitgenodigd voor {invitation.companyName} als {invitation.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Verloopt op</p>
                          <p className="text-sm font-medium">
                            {new Date(invitation.expiresAt).toLocaleDateString('nl-NL')}
                          </p>
                        </div>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

