"use client"

import { useState, useEffect } from 'react'

interface BackgroundStyle {
  background: string
  backgroundSize?: string
  backgroundPosition?: string
  backgroundRepeat?: string
}

const fallbackBackgrounds = [
  {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
  {
    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  }
]

export const useDailyBackground = () => {
  // Initialize with a daily rotating fallback immediately
  const getDailyFallback = () => {
    const today = new Date().getDate()
    const backgroundIndex = today % fallbackBackgrounds.length
    return fallbackBackgrounds[backgroundIndex]
  }

  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>(getDailyFallback())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadBackground = async () => {
      try {
        setIsLoading(true)
        
        // Try to fetch office background from API
        const response = await fetch('/api/daily-background', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.backgroundUrl) {
            setBackgroundStyle({
              background: `url(${data.backgroundUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            })
          }
          // If API returns but no background, keep the fallback we already set
        }
        // If API fails, keep the fallback we already set
      } catch (error) {
        console.log('Background API unavailable, using fallback')
        // Keep the fallback we already set
      } finally {
        setIsLoading(false)
      }
    }

    // Try to load office background from API, fallback is already set
    loadBackground()
  }, [])

  return { backgroundStyle, isLoading }
}

