import { NextRequest, NextResponse } from 'next/server'

// Office background images available in the public folder
const OFFICE_BACKGROUNDS = [
  '/images/office-backgrounds/office1.png',
  '/images/office-backgrounds/office2.jpg',
  '/images/office-backgrounds/office3.jpg',
  '/images/office-backgrounds/office4.jpg',
  '/images/office-backgrounds/office5.jpg'
]

export async function GET(request: NextRequest) {
  try {
    // Get current date to determine which background to show
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)
    
    // Select background based on day of year to ensure daily rotation
    const backgroundIndex = dayOfYear % OFFICE_BACKGROUNDS.length
    const selectedBackground = OFFICE_BACKGROUNDS[backgroundIndex]
    
    return NextResponse.json({
      success: true,
      backgroundUrl: selectedBackground,
      date: today.toISOString().split('T')[0], // YYYY-MM-DD format
      index: backgroundIndex
    })
  } catch (error) {
    console.error('Error fetching daily background:', error)
    
    // Return fallback background on error
    return NextResponse.json({
      success: false,
      backgroundUrl: OFFICE_BACKGROUNDS[0], // Default to first office background
      error: 'Failed to fetch daily background'
    }, { status: 500 })
  }
}

