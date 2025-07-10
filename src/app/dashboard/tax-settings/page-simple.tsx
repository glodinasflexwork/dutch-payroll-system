'use client'

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export default function TestTaxSettingsPage() {
  const { data: session, status } = useSession()
  const [taxSettings, setTaxSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (session?.user?.companyId) {
      fetchTaxSettings()
    }
  }, [session])

  const fetchTaxSettings = async () => {
    try {
      console.log("Fetching tax settings...")
      const response = await fetch("/api/tax-settings")
      console.log("Response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Tax settings data:", data)
        setTaxSettings(data)
      } else {
        const errorText = await response.text()
        console.error("API error:", errorText)
        setError(`API Error: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error("Error fetching tax settings:", error)
      setError(`Network Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return <div>Loading session...</div>
  }

  if (!session) {
    return <div>Not authenticated</div>
  }

  if (loading) {
    return <div>Loading tax settings...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tax Settings Test Page</h1>
      <p>Session: {session?.user?.email}</p>
      <p>Company ID: {session?.user?.companyId}</p>
      <p>Tax Settings Count: {taxSettings.length}</p>
      
      <h2>Tax Settings Data:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify(taxSettings, null, 2)}
      </pre>
    </div>
  )
}

