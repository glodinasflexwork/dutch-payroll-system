import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient as HRClient } from '@prisma/hr-client'

const hrClient = new HRClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    // Fetch employee documents
    const documents = await hrClient.document.findMany({
      where: {
        employeeId: employeeId
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      documents
    })

  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('documentType') as string
    const notes = formData.get('notes') as string

    if (!file || !documentType) {
      return NextResponse.json(
        { success: false, error: 'File and document type are required' },
        { status: 400 }
      )
    }

    // In a real implementation, you would:
    // 1. Save the file to a secure storage (AWS S3, etc.)
    // 2. Scan for viruses
    // 3. Validate file type and size
    // For demo purposes, we'll create a mock file path
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `/documents/${employeeId}/${fileName}`

    // Create document record
    const document = await hrClient.document.create({
      data: {
        employeeId,
        documentType: documentType as any,
        fileName,
        originalName: file.name,
        filePath,
        fileSize: file.size,
        mimeType: file.type,
        notes: notes || null,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      document
    })

  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    const employeeId = searchParams.get('employeeId')

    if (!documentId || !employeeId) {
      return NextResponse.json(
        { success: false, error: 'Document ID and Employee ID are required' },
        { status: 400 }
      )
    }

    // Verify document belongs to employee
    const document = await hrClient.document.findFirst({
      where: {
        id: documentId,
        employeeId: employeeId
      }
    })

    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete document record
    await hrClient.document.delete({
      where: {
        id: documentId
      }
    })

    // In a real implementation, you would also delete the file from storage

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}

