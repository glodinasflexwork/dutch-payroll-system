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
  },
  {
    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  },
  {
    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  }
]

export const useDynamicBackground = () => {
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>(fallbackBackgrounds[0])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadBackground = async () => {
      try {
        setIsLoading(true)
        
        // Try to fetch from API first
        const response = await fetch('/api/daily-background', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.background) {
            setBackgroundStyle({
              background: `url(${data.background})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            })
          } else {
            // Use daily rotating fallback
            const today = new Date().getDate()
            const backgroundIndex = today % fallbackBackgrounds.length
            setBackgroundStyle(fallbackBackgrounds[backgroundIndex])
          }
        } else {
          // API failed, use daily rotating fallback
          const today = new Date().getDate()
          const backgroundIndex = today % fallbackBackgrounds.length
          setBackgroundStyle(fallbackBackgrounds[backgroundIndex])
        }
      } catch (error) {
        console.log('Background API unavailable, using fallback')
        // Use daily rotating fallback
        const today = new Date().getDate()
        const backgroundIndex = today % fallbackBackgrounds.length
        setBackgroundStyle(fallbackBackgrounds[backgroundIndex])
      } finally {
        setIsLoading(false)
      }
    }

    loadBackground()
  }, [])

  return { backgroundStyle, isLoading }
}

