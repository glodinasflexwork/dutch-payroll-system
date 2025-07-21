'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Plus, CheckCircle, AlertCircle, Edit } from 'lucide-react'

interface TimeEntry {
  id: string
  date: string
  hoursWorked: number
  description: string | null
  projectCode: string | null
  isApproved: boolean
  createdAt: string
}

interface TimeSummary {
  totalHours: number
  approvedHours: number
  pendingHours: number
  entriesCount: number
}

export default function TimeTracking() {
  const router = useRouter()
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [summary, setSummary] = useState<TimeSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [formData, setFormData] = useState({
    date: '',
    hoursWorked: '',
    description: '',
    projectCode: ''
  })

  // Mock employee ID - in real implementation, this would come from authentication
  const employeeId = 'mock-employee-id'

  useEffect(() => {
    fetchTimeEntries()
  }, [])

  const fetchTimeEntries = async () => {
    try {
      setLoading(true)
      const currentDate = new Date()
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      
      const response = await fetch(`/api/employee-portal/time-entries?employeeId=${employeeId}&month=${month}&year=${year}`)
      if (!response.ok) throw new Error('Failed to fetch time entries')
      
      const result = await response.json()
      setTimeEntries(result.timeEntries || [])
      setSummary(result.summary || null)
    } catch (err) {
      console.error('Error fetching time entries:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.date || !formData.hoursWorked) {
      alert('Please fill in date and hours worked')
      return
    }

    const hours = parseFloat(formData.hoursWorked)
    if (hours <= 0 || hours > 24) {
      alert('Hours must be between 0 and 24')
      return
    }

    try {
      const url = editingEntry 
        ? '/api/employee-portal/time-entries'
        : '/api/employee-portal/time-entries'
      
      const method = editingEntry ? 'PUT' : 'POST'
      
      const body = editingEntry 
        ? {
            timeEntryId: editingEntry.id,
            employeeId,
            hoursWorked: hours,
            description: formData.description || null,
            projectCode: formData.projectCode || null
          }
        : {
            employeeId,
            date: formData.date,
            hoursWorked: hours,
            description: formData.description || null,
            projectCode: formData.projectCode || null
          }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save time entry')
      }

      alert(editingEntry ? 'Time entry updated successfully!' : 'Time entry submitted successfully!')
      setShowForm(false)
      setEditingEntry(null)
      setFormData({ date: '', hoursWorked: '', description: '', projectCode: '' })
      fetchTimeEntries()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save time entry')
    }
  }

  const handleEdit = (entry: TimeEntry) => {
    if (entry.isApproved) {
      alert('Cannot edit approved time entries')
      return
    }
    
    setEditingEntry(entry)
    setFormData({
      date: entry.date.split('T')[0],
      hoursWorked: entry.hoursWorked.toString(),
      description: entry.description || '',
      projectCode: entry.projectCode || ''
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingEntry(null)
    setFormData({ date: '', hoursWorked: '', description: '', projectCode: '' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading time entries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/employee-portal')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portal
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Time Tracking</h1>
                <p className="text-sm text-gray-500">Log your hours for accurate payroll</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Entry
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{summary.totalHours}h</p>
                    <p className="text-sm text-gray-500">Total Hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{summary.approvedHours}h</p>
                    <p className="text-sm text-gray-500">Approved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{summary.pendingHours}h</p>
                    <p className="text-sm text-gray-500">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">{summary.entriesCount}</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold">{summary.entriesCount}</p>
                    <p className="text-sm text-gray-500">Entries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingEntry ? 'Edit Time Entry' : 'Add New Time Entry'}
              </CardTitle>
              <CardDescription>
                {editingEntry ? 'Update your time entry details' : 'Log your work hours for the day'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      disabled={!!editingEntry}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours Worked *</Label>
                    <Input
                      id="hours"
                      type="number"
                      step="0.25"
                      min="0"
                      max="24"
                      placeholder="8.0"
                      value={formData.hoursWorked}
                      onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="projectCode">Project Code (Optional)</Label>
                  <Input
                    id="projectCode"
                    placeholder="e.g., PROJ-001"
                    value={formData.projectCode}
                    onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what you worked on..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingEntry ? 'Update Entry' : 'Add Entry'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Time Entries List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Time Entries</CardTitle>
            <CardDescription>
              Current month's time entries and their approval status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timeEntries.length > 0 ? (
              <div className="space-y-3">
                {timeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        {entry.isApproved ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {new Date(entry.date).toLocaleDateString()} - {entry.hoursWorked}h
                        </p>
                        <p className="text-sm text-gray-500">
                          {entry.description || 'No description'}
                          {entry.projectCode && ` • ${entry.projectCode}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={entry.isApproved ? 'default' : 'secondary'}>
                        {entry.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                      {!entry.isApproved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No time entries found for this month</p>
                <Button onClick={() => setShowForm(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Entry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

