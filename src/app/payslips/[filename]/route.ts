import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename
    
    // Validate filename to prevent directory traversal attacks
    if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }
    
    // Check if we're in serverless environment
    const isProduction = process.env.NODE_ENV === 'production'
    const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    
    let filePath: string
    
    if (isServerless || isProduction) {
      // Serverless: read from /tmp/payslips/
      filePath = path.join('/tmp', 'payslips', filename)
      console.log('🔍 Serving payslip from temporary directory:', filePath)
    } else {
      // Local development: read from public/payslips/
      filePath = path.join(process.cwd(), 'public', 'payslips', filename)
      console.log('🔍 Serving payslip from public directory:', filePath)
    }
    
    // Read the HTML file
    const htmlContent = await readFile(filePath, 'utf8')
    
    // Return HTML response with proper headers
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    
  } catch (error) {
    console.error('Error serving payslip file:', error)
    
    if ((error as any).code === 'ENOENT') {
      return NextResponse.json({ error: 'Payslip not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

