import { NextRequest, NextResponse } from 'next/server'

// Mock document data for demo purposes - reflecting Dutch payroll compliance requirements
const mockDocuments = [
  {
    id: 'doc-1',
    employeeId: 'mock-employee-id',
    documentType: 'ID_BEWIJS',
    fileName: 'id_bewijs_sarah_johnson.pdf',
    originalName: 'ID Bewijs - Sarah Johnson.pdf',
    filePath: '/documents/mock-employee-id/id_bewijs_sarah_johnson.pdf',
    fileSize: 2048576,
    mimeType: 'application/pdf',
    status: 'APPROVED',
    uploadedAt: '2024-06-15T10:30:00Z',
    updatedAt: '2024-06-15T10:30:00Z',
    expiresAt: '2029-06-15T00:00:00Z',
    notes: 'Valid Dutch ID document - Required for payroll compliance',
    isRequired: true,
    category: 'IDENTITY_VERIFICATION'
  },
  {
    id: 'doc-2',
    employeeId: 'mock-employee-id',
    documentType: 'LOONBELASTINGVERKLARING',
    fileName: 'loonbelasting_2024_sarah_johnson.pdf',
    originalName: 'Loonbelastingverklaring 2024 - Sarah Johnson.pdf',
    filePath: '/documents/mock-employee-id/loonbelasting_2024_sarah_johnson.pdf',
    fileSize: 1536000,
    mimeType: 'application/pdf',
    status: 'APPROVED',
    uploadedAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-10T14:20:00Z',
    expiresAt: '2024-12-31T23:59:59Z',
    notes: 'Signed tax declaration - Required for Dutch tax compliance',
    isRequired: true,
    category: 'TAX_COMPLIANCE'
  },
  {
    id: 'doc-3',
    employeeId: 'mock-employee-id',
    documentType: 'CONTRACT',
    fileName: 'employment_contract_sarah_johnson.pdf',
    originalName: 'Employment Contract - Sarah Johnson.pdf',
    filePath: '/documents/mock-employee-id/employment_contract_sarah_johnson.pdf',
    fileSize: 3072000,
    mimeType: 'application/pdf',
    status: 'APPROVED',
    uploadedAt: '2024-03-01T09:00:00Z',
    updatedAt: '2024-03-01T09:00:00Z',
    expiresAt: null,
    notes: 'Signed employment contract - Required for legal employment',
    isRequired: true,
    category: 'EMPLOYMENT_AGREEMENT'
  }
]

// Check if employee has completed all required documents for payroll processing
const checkPayrollEligibility = (documents: any[]) => {
  const requiredTypes = ['ID_BEWIJS', 'LOONBELASTINGVERKLARING', 'CONTRACT']
  const approvedDocs = documents.filter(doc => doc.status === 'APPROVED')
  const hasAllRequired = requiredTypes.every(type => 
    approvedDocs.some(doc => doc.documentType === type)
  )
  
  return {
    isEligible: hasAllRequired,
    completedDocuments: approvedDocs.length,
    totalRequired: requiredTypes.length,
    missingDocuments: requiredTypes.filter(type => 
      !approvedDocs.some(doc => doc.documentType === type)
    )
  }
}

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

    // Filter documents for the specific employee
    const documents = mockDocuments.filter(doc => doc.employeeId === employeeId)
    
    // Check payroll eligibility based on required documents
    const eligibility = checkPayrollEligibility(documents)

    return NextResponse.json({
      success: true,
      documents,
      payrollEligibility: eligibility,
      complianceStatus: {
        isCompliant: eligibility.isEligible,
        message: eligibility.isEligible 
          ? 'All required documents approved - Employee eligible for payroll processing'
          : `Missing required documents: ${eligibility.missingDocuments.join(', ')}`,
        requiredDocuments: [
          {
            type: 'ID_BEWIJS',
            name: 'Dutch ID Document',
            description: 'Valid Dutch identity document (ID card or passport)',
            required: true,
            status: documents.find(d => d.documentType === 'ID_BEWIJS')?.status || 'MISSING'
          },
          {
            type: 'LOONBELASTINGVERKLARING',
            name: 'Tax Declaration',
            description: 'Signed Loonbelastingverklaring for current tax year',
            required: true,
            status: documents.find(d => d.documentType === 'LOONBELASTINGVERKLARING')?.status || 'MISSING'
          },
          {
            type: 'CONTRACT',
            name: 'Employment Contract',
            description: 'Signed employment contract',
            required: true,
            status: documents.find(d => d.documentType === 'CONTRACT')?.status || 'MISSING'
          }
        ]
      }
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

    // Create mock document for demo
    const newDocument = {
      id: `doc-${Date.now()}`,
      employeeId,
      documentType,
      fileName: `${Date.now()}_${file.name}`,
      originalName: file.name,
      filePath: `/documents/${employeeId}/${Date.now()}_${file.name}`,
      fileSize: file.size,
      mimeType: file.type,
      status: 'PENDING',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: null,
      notes: notes || null
    }

    // In demo mode, we just return success without actually storing
    return NextResponse.json({
      success: true,
      document: newDocument,
      message: 'Document uploaded successfully (demo mode)'
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

    // In demo mode, we just return success
    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully (demo mode)'
    })

  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}

