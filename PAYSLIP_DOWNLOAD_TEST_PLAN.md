# Payslip Download Functionality - Comprehensive Test Plan

## Executive Summary

This test plan ensures the robustness and reliability of the payslip download functionality across all scenarios, preventing future issues and maintaining consistent user experience.

## Test Scope

### In Scope
- Payslip generation during payroll processing
- PayslipGeneration record creation and management
- Payslip download API endpoints
- Frontend payslip download interface
- Universal Company Resolution integration
- Error handling and user feedback
- File system operations for payslip storage

### Out of Scope
- Payroll calculation logic (separate test suite)
- Authentication and authorization (covered by auth tests)
- General UI/UX testing (covered by frontend tests)

## Test Categories

## 1. Unit Tests

### 1.1 Backend API Tests

#### 1.1.1 PayslipGeneration Model Tests
```javascript
// Test file: tests/unit/models/payslip-generation.test.js

describe('PayslipGeneration Model', () => {
  test('should create PayslipGeneration record with valid data', async () => {
    const data = {
      employeeId: 'valid-employee-id',
      companyId: 'valid-company-id',
      payrollRecordId: 'valid-payroll-record-id',
      fileName: 'payslip-EMP0001-2025-08.html',
      status: 'generated'
    };
    
    const payslip = await payrollClient.payslipGeneration.create({ data });
    expect(payslip).toBeDefined();
    expect(payslip.status).toBe('generated');
  });

  test('should fail with missing required fields', async () => {
    const invalidData = { fileName: 'test.html' };
    
    await expect(
      payrollClient.payslipGeneration.create({ data: invalidData })
    ).rejects.toThrow();
  });

  test('should update downloadedAt timestamp on download', async () => {
    const payslip = await createTestPayslip();
    const beforeDownload = payslip.downloadedAt;
    
    await payrollClient.payslipGeneration.update({
      where: { id: payslip.id },
      data: { downloadedAt: new Date() }
    });
    
    const updated = await payrollClient.payslipGeneration.findUnique({
      where: { id: payslip.id }
    });
    
    expect(updated.downloadedAt).not.toBe(beforeDownload);
  });
});
```

#### 1.1.2 Download API Tests
```javascript
// Test file: tests/unit/api/payslips/download.test.js

describe('/api/payslips/download', () => {
  describe('POST - Availability Check', () => {
    test('should return available=true for existing payslip', async () => {
      const { employee, payrollRecord, payslipGeneration } = await setupTestData();
      
      const response = await request(app)
        .post('/api/payslips/download')
        .send({
          employeeId: employee.id,
          year: payrollRecord.year,
          month: payrollRecord.month
        })
        .expect(200);
      
      expect(response.body.available).toBe(true);
      expect(response.body.payslip.fileName).toBe(payslipGeneration.fileName);
    });

    test('should return available=false for non-existent payslip', async () => {
      const { employee } = await setupTestData();
      
      const response = await request(app)
        .post('/api/payslips/download')
        .send({
          employeeId: employee.id,
          year: 2099,
          month: 12
        })
        .expect(200);
      
      expect(response.body.available).toBe(false);
      expect(response.body.message).toContain('not available');
    });

    test('should handle Universal Company Resolution failure', async () => {
      // Mock company resolution failure
      jest.spyOn(universalResolver, 'resolveCompanyFromSession')
        .mockResolvedValue({ success: false, error: 'No company found' });
      
      const response = await request(app)
        .post('/api/payslips/download')
        .send({
          employeeId: 'test-employee-id',
          year: 2025,
          month: 8
        })
        .expect(401);
      
      expect(response.body.error).toContain('company');
    });
  });

  describe('GET - File Download', () => {
    test('should serve existing payslip file', async () => {
      const { employee, payrollRecord, payslipGeneration } = await setupTestData();
      
      const response = await request(app)
        .get(`/api/payslips/download?employeeId=${employee.id}&year=${payrollRecord.year}&month=${payrollRecord.month}`)
        .expect(200);
      
      expect(response.headers['content-type']).toContain('text/html');
      expect(response.headers['content-disposition']).toContain(payslipGeneration.fileName);
    });

    test('should regenerate missing file and serve it', async () => {
      const { employee, payrollRecord, payslipGeneration } = await setupTestData();
      
      // Delete the physical file
      await fs.unlink(payslipGeneration.filePath);
      
      const response = await request(app)
        .get(`/api/payslips/download?employeeId=${employee.id}&year=${payrollRecord.year}&month=${payrollRecord.month}`)
        .expect(200);
      
      expect(response.headers['content-type']).toContain('text/html');
      expect(response.text).toContain('LOONSTROOK');
    });

    test('should return 404 for non-existent payslip', async () => {
      const { employee } = await setupTestData();
      
      const response = await request(app)
        .get(`/api/payslips/download?employeeId=${employee.id}&year=2099&month=12`)
        .expect(404);
      
      expect(response.body.error).toContain('not found');
    });
  });
});
```

### 1.2 Frontend Component Tests

#### 1.2.1 PayrollPage Component Tests
```javascript
// Test file: tests/unit/components/payroll-page.test.tsx

describe('PayrollPage Component', () => {
  test('should render payroll records with download buttons', async () => {
    const mockRecords = [
      {
        id: 'record-1',
        employeeId: 'employee-1',
        employeeNumber: 'EMP0001',
        firstName: 'John',
        lastName: 'Doe',
        year: 2025,
        month: 8,
        grossPay: 3500,
        netPay: 2551.22
      }
    ];

    render(<PayrollPage />);
    
    // Mock API responses
    fetchMock.mockResponseOnce(JSON.stringify({ payrollRecords: mockRecords }));
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Download Payslip')).toBeInTheDocument();
    });
  });

  test('should call download API with correct employee ID', async () => {
    const mockRecord = {
      id: 'record-1',
      employeeId: 'employee-id-123',
      employeeNumber: 'EMP0001',
      firstName: 'John',
      lastName: 'Doe',
      year: 2025,
      month: 8
    };

    render(<PayrollPage />);
    
    const downloadButton = screen.getByText('Download Payslip');
    fireEvent.click(downloadButton);
    
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/payslips/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: 'employee-id-123', // Should use employeeId, not employeeNumber
          year: 2025,
          month: 8
        })
      });
    });
  });

  test('should show error toast when payslip not available', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ 
      available: false, 
      message: 'Payslip not available' 
    }));

    render(<PayrollPage />);
    
    const downloadButton = screen.getByText('Download Payslip');
    fireEvent.click(downloadButton);
    
    await waitFor(() => {
      expect(screen.getByText(/not available/i)).toBeInTheDocument();
    });
  });
});
```

## 2. Integration Tests

### 2.1 End-to-End Payroll to Download Flow

```javascript
// Test file: tests/integration/payroll-to-download.test.js

describe('Payroll Processing to Payslip Download Flow', () => {
  test('should complete full payroll processing and download cycle', async () => {
    // 1. Setup test employee and company
    const { company, employee } = await setupTestCompany();
    
    // 2. Process payroll
    const payrollResponse = await request(app)
      .post('/api/payroll/management')
      .send({
        employeeIds: [employee.id],
        payPeriodStart: '2025-08-01',
        payPeriodEnd: '2025-08-31',
        dryRun: false
      })
      .expect(200);
    
    expect(payrollResponse.body.results).toHaveLength(1);
    expect(payrollResponse.body.results[0].status).toBe('success');
    
    // 3. Verify PayrollRecord was created
    const payrollRecord = await payrollClient.payrollRecord.findFirst({
      where: {
        employeeId: employee.id,
        year: 2025,
        month: 8
      }
    });
    
    expect(payrollRecord).toBeDefined();
    expect(payrollRecord.status).toBe('processed');
    
    // 4. Verify PayslipGeneration was created
    const payslipGeneration = await payrollClient.payslipGeneration.findFirst({
      where: {
        payrollRecordId: payrollRecord.id
      }
    });
    
    expect(payslipGeneration).toBeDefined();
    expect(payslipGeneration.status).toBe('generated');
    
    // 5. Test payslip availability check
    const availabilityResponse = await request(app)
      .post('/api/payslips/download')
      .send({
        employeeId: employee.id,
        year: 2025,
        month: 8
      })
      .expect(200);
    
    expect(availabilityResponse.body.available).toBe(true);
    
    // 6. Test payslip download
    const downloadResponse = await request(app)
      .get(`/api/payslips/download?employeeId=${employee.id}&year=2025&month=8`)
      .expect(200);
    
    expect(downloadResponse.headers['content-type']).toContain('text/html');
    expect(downloadResponse.text).toContain('LOONSTROOK');
    expect(downloadResponse.text).toContain(employee.firstName);
    expect(downloadResponse.text).toContain(company.name);
  });

  test('should handle multiple employees in batch processing', async () => {
    const { company, employees } = await setupTestCompanyWithMultipleEmployees(3);
    
    // Process payroll for all employees
    const payrollResponse = await request(app)
      .post('/api/payroll/management')
      .send({
        employeeIds: employees.map(e => e.id),
        payPeriodStart: '2025-08-01',
        payPeriodEnd: '2025-08-31',
        dryRun: false
      })
      .expect(200);
    
    expect(payrollResponse.body.results).toHaveLength(3);
    
    // Verify all employees have downloadable payslips
    for (const employee of employees) {
      const availabilityResponse = await request(app)
        .post('/api/payslips/download')
        .send({
          employeeId: employee.id,
          year: 2025,
          month: 8
        })
        .expect(200);
      
      expect(availabilityResponse.body.available).toBe(true);
      
      const downloadResponse = await request(app)
        .get(`/api/payslips/download?employeeId=${employee.id}&year=2025&month=8`)
        .expect(200);
      
      expect(downloadResponse.text).toContain(employee.firstName);
    }
  });
});
```

### 2.2 Universal Company Resolution Integration

```javascript
// Test file: tests/integration/company-resolution.test.js

describe('Universal Company Resolution in Payslip Download', () => {
  test('should resolve company correctly for owner user', async () => {
    const { company, owner } = await setupTestCompanyWithOwner();
    const session = await createSessionForUser(owner);
    
    const response = await request(app)
      .post('/api/payslips/download')
      .set('Cookie', session.cookie)
      .send({
        employeeId: 'test-employee-id',
        year: 2025,
        month: 8
      });
    
    // Should succeed with company resolution
    expect(response.status).not.toBe(401);
  });

  test('should handle multi-company scenarios', async () => {
    const { user, companies } = await setupUserWithMultipleCompanies(2);
    const session = await createSessionForUser(user);
    
    // Test with preferred company
    const response = await request(app)
      .post('/api/payslips/download')
      .set('Cookie', session.cookie)
      .send({
        employeeId: 'test-employee-id',
        year: 2025,
        month: 8
      });
    
    // Should resolve to preferred company
    expect(response.status).not.toBe(401);
  });

  test('should fail gracefully when no company access', async () => {
    const user = await createUserWithoutCompany();
    const session = await createSessionForUser(user);
    
    const response = await request(app)
      .post('/api/payslips/download')
      .set('Cookie', session.cookie)
      .send({
        employeeId: 'test-employee-id',
        year: 2025,
        month: 8
      })
      .expect(401);
    
    expect(response.body.error).toContain('company');
  });
});
```

## 3. End-to-End Tests

### 3.1 Browser Automation Tests

```javascript
// Test file: tests/e2e/payslip-download.spec.js

describe('Payslip Download E2E', () => {
  test('should download payslip through UI', async () => {
    // 1. Login
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // 2. Navigate to payroll page
    await page.click('[data-testid="payroll-nav"]');
    await page.waitForSelector('[data-testid="payroll-records"]');
    
    // 3. Click download payslip
    const downloadButton = page.locator('[data-testid="download-payslip"]').first();
    
    // Setup download handler
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    
    // 4. Verify download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/payslip.*\.html/);
    
    // 5. Verify file content
    const path = await download.path();
    const content = await fs.readFile(path, 'utf8');
    expect(content).toContain('LOONSTROOK');
    expect(content).toContain('€');
  });

  test('should show error message for unavailable payslip', async () => {
    // Setup scenario with no payslip
    await setupEmployeeWithoutPayslip();
    
    await page.goto('/payroll');
    await page.click('[data-testid="download-payslip"]');
    
    // Should show error toast
    await expect(page.locator('[data-testid="error-toast"]')).toContainText('not available');
  });

  test('should handle network errors gracefully', async () => {
    // Mock network failure
    await page.route('/api/payslips/download', route => route.abort());
    
    await page.goto('/payroll');
    await page.click('[data-testid="download-payslip"]');
    
    // Should show network error message
    await expect(page.locator('[data-testid="error-toast"]')).toContainText('network');
  });
});
```

## 4. Edge Cases and Error Scenarios

### 4.1 Data Integrity Tests

```javascript
describe('Data Integrity Edge Cases', () => {
  test('should handle orphaned PayslipGeneration records', async () => {
    // Create PayslipGeneration without corresponding PayrollRecord
    const orphanedPayslip = await payrollClient.payslipGeneration.create({
      data: {
        employeeId: 'employee-id',
        companyId: 'company-id',
        payrollRecordId: 'non-existent-payroll-record-id',
        fileName: 'orphaned-payslip.html',
        status: 'generated'
      }
    });
    
    const response = await request(app)
      .post('/api/payslips/download')
      .send({
        employeeId: 'employee-id',
        year: 2025,
        month: 8
      })
      .expect(200);
    
    expect(response.body.available).toBe(false);
  });

  test('should handle missing PayslipGeneration for existing PayrollRecord', async () => {
    // Create PayrollRecord without PayslipGeneration
    const payrollRecord = await payrollClient.payrollRecord.create({
      data: {
        employeeId: 'employee-id',
        companyId: 'company-id',
        year: 2025,
        month: 8,
        status: 'processed',
        // ... other required fields
      }
    });
    
    const response = await request(app)
      .post('/api/payslips/download')
      .send({
        employeeId: 'employee-id',
        year: 2025,
        month: 8
      })
      .expect(200);
    
    expect(response.body.available).toBe(false);
  });

  test('should handle employee ID vs employee number confusion', async () => {
    const { employee, payrollRecord } = await setupTestData();
    
    // Test with employee number instead of ID (should fail)
    const response = await request(app)
      .post('/api/payslips/download')
      .send({
        employeeId: employee.employeeNumber, // Wrong: using number instead of ID
        year: payrollRecord.year,
        month: payrollRecord.month
      })
      .expect(200);
    
    expect(response.body.available).toBe(false);
  });
});
```

### 4.2 File System Edge Cases

```javascript
describe('File System Edge Cases', () => {
  test('should handle missing payslip files', async () => {
    const { employee, payrollRecord, payslipGeneration } = await setupTestData();
    
    // Delete the physical file
    await fs.unlink(payslipGeneration.filePath);
    
    const response = await request(app)
      .get(`/api/payslips/download?employeeId=${employee.id}&year=${payrollRecord.year}&month=${payrollRecord.month}`)
      .expect(200);
    
    // Should regenerate and serve
    expect(response.headers['content-type']).toContain('text/html');
  });

  test('should handle file system permissions errors', async () => {
    const { employee, payrollRecord, payslipGeneration } = await setupTestData();
    
    // Make file unreadable
    await fs.chmod(payslipGeneration.filePath, 0o000);
    
    const response = await request(app)
      .get(`/api/payslips/download?employeeId=${employee.id}&year=${payrollRecord.year}&month=${payrollRecord.month}`)
      .expect(500);
    
    expect(response.body.error).toContain('access');
    
    // Cleanup
    await fs.chmod(payslipGeneration.filePath, 0o644);
  });

  test('should handle disk space issues during regeneration', async () => {
    // Mock fs.writeFile to simulate disk full
    const originalWriteFile = fs.writeFile;
    fs.writeFile = jest.fn().mockRejectedValue(new Error('ENOSPC: no space left'));
    
    const { employee, payrollRecord } = await setupTestData();
    
    const response = await request(app)
      .get(`/api/payslips/download?employeeId=${employee.id}&year=${payrollRecord.year}&month=${payrollRecord.month}`)
      .expect(500);
    
    expect(response.body.error).toContain('space');
    
    // Restore
    fs.writeFile = originalWriteFile;
  });
});
```

## 5. Performance Tests

### 5.1 Load Testing

```javascript
describe('Performance Tests', () => {
  test('should handle concurrent download requests', async () => {
    const { employee, payrollRecord } = await setupTestData();
    
    // Create 50 concurrent download requests
    const requests = Array(50).fill().map(() =>
      request(app)
        .get(`/api/payslips/download?employeeId=${employee.id}&year=${payrollRecord.year}&month=${payrollRecord.month}`)
    );
    
    const responses = await Promise.all(requests);
    
    // All should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
    });
  });

  test('should complete download within acceptable time', async () => {
    const { employee, payrollRecord } = await setupTestData();
    
    const startTime = Date.now();
    
    const response = await request(app)
      .get(`/api/payslips/download?employeeId=${employee.id}&year=${payrollRecord.year}&month=${payrollRecord.month}`)
      .expect(200);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete within 5 seconds
    expect(duration).toBeLessThan(5000);
  });

  test('should handle large payslip files efficiently', async () => {
    // Create payslip with large content
    const largeContent = 'x'.repeat(1024 * 1024); // 1MB
    const { employee, payrollRecord, payslipGeneration } = await setupTestData();
    
    await fs.writeFile(payslipGeneration.filePath, largeContent);
    
    const response = await request(app)
      .get(`/api/payslips/download?employeeId=${employee.id}&year=${payrollRecord.year}&month=${payrollRecord.month}`)
      .expect(200);
    
    expect(response.text.length).toBe(largeContent.length);
  });
});
```

## 6. Security Tests

### 6.1 Access Control Tests

```javascript
describe('Security Tests', () => {
  test('should prevent unauthorized access to payslips', async () => {
    const { employee: employee1, payrollRecord: record1 } = await setupTestData();
    const { employee: employee2 } = await setupTestData();
    
    // User 2 tries to access User 1's payslip
    const session2 = await createSessionForUser(employee2);
    
    const response = await request(app)
      .get(`/api/payslips/download?employeeId=${employee1.id}&year=${record1.year}&month=${record1.month}`)
      .set('Cookie', session2.cookie)
      .expect(401);
    
    expect(response.body.error).toContain('unauthorized');
  });

  test('should prevent SQL injection in parameters', async () => {
    const maliciousEmployeeId = "'; DROP TABLE payslip_generation; --";
    
    const response = await request(app)
      .post('/api/payslips/download')
      .send({
        employeeId: maliciousEmployeeId,
        year: 2025,
        month: 8
      })
      .expect(400);
    
    expect(response.body.error).toContain('Invalid');
  });

  test('should sanitize file paths', async () => {
    const { employee, payrollRecord } = await setupTestData();
    
    // Try path traversal attack
    const response = await request(app)
      .get(`/api/payslips/download?employeeId=${employee.id}&year=../../../etc/passwd&month=8`)
      .expect(400);
    
    expect(response.body.error).toContain('Invalid');
  });
});
```

## 7. Regression Tests

### 7.1 Known Issue Prevention

```javascript
describe('Regression Tests', () => {
  test('should use employee ID not employee number in API calls', async () => {
    // This test prevents the bug we just fixed
    const { employee, payrollRecord } = await setupTestData();
    
    const spy = jest.spyOn(payrollClient.payslipGeneration, 'findFirst');
    
    await request(app)
      .post('/api/payslips/download')
      .send({
        employeeId: employee.id, // Should be ID, not employeeNumber
        year: payrollRecord.year,
        month: payrollRecord.month
      });
    
    expect(spy).toHaveBeenCalledWith({
      where: {
        employeeId: employee.id, // Verify it's using the actual ID
        companyId: expect.any(String),
        PayrollRecord: {
          year: payrollRecord.year,
          month: payrollRecord.month
        }
      },
      include: { PayrollRecord: true }
    });
  });

  test('should create PayslipGeneration records during payroll processing', async () => {
    // Prevent the missing PayslipGeneration issue
    const { employee } = await setupTestData();
    
    await request(app)
      .post('/api/payroll/management')
      .send({
        employeeIds: [employee.id],
        payPeriodStart: '2025-09-01',
        payPeriodEnd: '2025-09-30',
        dryRun: false
      });
    
    // Verify PayslipGeneration was created
    const payslipGeneration = await payrollClient.payslipGeneration.findFirst({
      where: {
        employeeId: employee.id,
        PayrollRecord: {
          year: 2025,
          month: 9
        }
      }
    });
    
    expect(payslipGeneration).toBeDefined();
    expect(payslipGeneration.status).toBe('generated');
  });

  test('should use Universal Company Resolution consistently', async () => {
    // Prevent company resolution inconsistencies
    const resolutionSpy = jest.spyOn(universalResolver, 'resolveCompanyFromSession');
    
    await request(app)
      .post('/api/payslips/download')
      .send({
        employeeId: 'test-employee-id',
        year: 2025,
        month: 8
      });
    
    expect(resolutionSpy).toHaveBeenCalled();
  });
});
```

## 8. Test Data Management

### 8.1 Test Fixtures

```javascript
// Test file: tests/fixtures/payslip-test-data.js

export async function setupTestData() {
  const company = await hrClient.company.create({
    data: {
      name: 'Test Company B.V.',
      kvkNumber: '12345678',
      taxNumber: 'NL123456789B01',
      address: 'Test Street 123',
      city: 'Amsterdam',
      postalCode: '1000 AA'
    }
  });

  const employee = await hrClient.employee.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      employeeNumber: 'EMP0001',
      email: 'john.doe@test.com',
      position: 'Software Engineer',
      department: 'Engineering',
      salary: 3500,
      companyId: company.id
    }
  });

  const payrollRecord = await payrollClient.payrollRecord.create({
    data: {
      employeeId: employee.id,
      companyId: company.id,
      year: 2025,
      month: 8,
      grossPay: 3500,
      netPay: 2551.22,
      status: 'processed',
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeNumber: employee.employeeNumber
    }
  });

  const payslipGeneration = await payrollClient.payslipGeneration.create({
    data: {
      employeeId: employee.id,
      companyId: company.id,
      payrollRecordId: payrollRecord.id,
      fileName: `payslip-${employee.employeeNumber}-2025-08.html`,
      filePath: `/tmp/payslips/payslip-${employee.employeeNumber}-2025-08.html`,
      status: 'generated',
      generatedAt: new Date()
    }
  });

  // Create the physical file
  const payslipHTML = generateTestPayslipHTML(company, employee, payrollRecord);
  await fs.writeFile(payslipGeneration.filePath, payslipHTML);

  return { company, employee, payrollRecord, payslipGeneration };
}

export async function cleanupTestData() {
  // Clean up in reverse order of dependencies
  await payrollClient.payslipGeneration.deleteMany({});
  await payrollClient.payrollRecord.deleteMany({});
  await hrClient.employee.deleteMany({});
  await hrClient.company.deleteMany({});
  
  // Clean up test files
  await fs.rmdir('/tmp/payslips', { recursive: true });
}
```

## 9. Continuous Integration

### 9.1 CI Pipeline Configuration

```yaml
# .github/workflows/payslip-tests.yml

name: Payslip Download Tests

on:
  push:
    paths:
      - 'src/app/api/payslips/**'
      - 'src/app/payroll/**'
      - 'src/lib/payslip-generator.ts'
      - 'src/lib/universal-company-resolver.ts'
  pull_request:
    paths:
      - 'src/app/api/payslips/**'
      - 'src/app/payroll/**'
      - 'src/lib/payslip-generator.ts'
      - 'src/lib/universal-company-resolver.ts'

jobs:
  payslip-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup test databases
        run: |
          npm run db:migrate:test
          npm run db:seed:test
      
      - name: Run unit tests
        run: npm run test:unit:payslips
      
      - name: Run integration tests
        run: npm run test:integration:payslips
      
      - name: Run E2E tests
        run: npm run test:e2e:payslips
      
      - name: Generate test report
        run: npm run test:report
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

## 10. Monitoring and Alerting

### 10.1 Production Monitoring

```javascript
// monitoring/payslip-health-check.js

export async function payslipHealthCheck() {
  const checks = [
    {
      name: 'PayslipGeneration Table Access',
      check: async () => {
        const count = await payrollClient.payslipGeneration.count();
        return count >= 0;
      }
    },
    {
      name: 'File System Access',
      check: async () => {
        await fs.access('/tmp/payslips', fs.constants.R_OK | fs.constants.W_OK);
        return true;
      }
    },
    {
      name: 'Universal Company Resolution',
      check: async () => {
        const testSession = await createTestSession();
        const result = await resolveCompanyFromSession(testSession);
        return result.success;
      }
    },
    {
      name: 'Payslip Download API',
      check: async () => {
        const response = await fetch('/api/payslips/download', {
          method: 'POST',
          body: JSON.stringify({
            employeeId: 'health-check-employee',
            year: 2025,
            month: 1
          })
        });
        return response.status !== 500;
      }
    }
  ];

  const results = await Promise.allSettled(
    checks.map(async ({ name, check }) => {
      try {
        const result = await check();
        return { name, status: result ? 'pass' : 'fail' };
      } catch (error) {
        return { name, status: 'fail', error: error.message };
      }
    })
  );

  return results;
}
```

## 11. Test Execution Schedule

### 11.1 Test Categories by Frequency

| Test Category | Frequency | Trigger |
|---------------|-----------|---------|
| Unit Tests | Every commit | Git push |
| Integration Tests | Every PR | Pull request |
| E2E Tests | Daily | Scheduled |
| Performance Tests | Weekly | Scheduled |
| Security Tests | Monthly | Scheduled |
| Regression Tests | Every release | Release tag |

### 11.2 Test Environment Matrix

| Environment | Purpose | Data | Duration |
|-------------|---------|------|----------|
| Local | Development | Mock data | < 5 min |
| CI/CD | Validation | Test fixtures | < 15 min |
| Staging | Integration | Sanitized prod data | < 30 min |
| Production | Monitoring | Live data | < 2 min |

## 12. Success Criteria

### 12.1 Test Coverage Requirements

- **Unit Tests**: 95% code coverage for payslip-related modules
- **Integration Tests**: 100% coverage of critical user journeys
- **E2E Tests**: 100% coverage of UI workflows
- **Edge Cases**: 90% coverage of identified edge scenarios

### 12.2 Performance Requirements

- **Download Response Time**: < 2 seconds for existing payslips
- **Regeneration Time**: < 5 seconds for missing files
- **Concurrent Users**: Support 100 simultaneous downloads
- **File Size Limit**: Handle payslips up to 5MB

### 12.3 Reliability Requirements

- **Uptime**: 99.9% availability for download functionality
- **Error Rate**: < 0.1% for valid download requests
- **Data Integrity**: 100% consistency between PayrollRecord and PayslipGeneration
- **Recovery Time**: < 1 minute for file system issues

## Conclusion

This comprehensive test plan ensures the robustness and reliability of the payslip download functionality across all scenarios. Regular execution of these tests will prevent regressions and maintain high-quality user experience.

The test plan covers:
- ✅ All critical user journeys
- ✅ Edge cases and error scenarios
- ✅ Performance and security requirements
- ✅ Integration with existing systems
- ✅ Continuous monitoring and alerting

Implementation of this test plan will provide confidence in the payslip download functionality and prevent future issues similar to the ones we just resolved.

