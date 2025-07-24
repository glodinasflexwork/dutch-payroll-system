# Automatic Employee Portal Invitation Integration

## Overview

This document describes the integration between the employee creation form and the automatic portal invitation system. When creating a new employee, administrators can now automatically send portal invitations by simply checking a checkbox during the employee creation process.

## Integration Architecture

### Components Involved

1. **Employee Creation Form** (`/dashboard/employees/add`)
   - Multi-step form with 5 steps
   - Final step includes portal invitation checkbox
   - Seamlessly integrated with invitation system

2. **Employee Creation API** (`/api/employees`)
   - Handles employee record creation
   - Automatically triggers invitation when `sendInvitation` flag is true
   - Provides comprehensive error handling

3. **Employee Invitation API** (`/api/employees/invite`)
   - Sends secure invitation emails
   - Uses correct employee signup endpoint
   - Updates employee portal status

4. **Email Service** (`/lib/email-service.ts`)
   - Handles email delivery
   - Supports both console logging and SMTP
   - Includes invitation token generation

## How It Works

### Step-by-Step Process

1. **Employee Creation Form Navigation**
   ```
   Step 1: Personal Information (Name, Email, BSN)
   Step 2: Employment Information (Department, Position, Contract Details)
   Step 3: Salary Information (Monthly Salary Amount)
   Step 4: Emergency Contact (Optional)
   Step 5: Portal Access (Invitation Checkbox) ← KEY INTEGRATION POINT
   ```

2. **Portal Access Step**
   - Displays checkbox: "Send portal invitation to employee"
   - When checked, sets `sendInvitation: true` in form data
   - Final button changes to "Create Employee"

3. **API Integration Flow**
   ```javascript
   // Employee Creation API (/api/employees)
   if (data.sendInvitation) {
     // Create employee first
     const employee = await hrClient.employee.create({...})
     
     // Then send invitation
     const inviteResponse = await fetch('/api/employees/invite', {
       method: 'POST',
       body: JSON.stringify({
         employeeId: employee.id,
         email: employee.email,
         firstName: employee.firstName
       })
     })
     
     // Handle invitation result
     if (inviteResponse.ok) {
       // Update employee status to INVITED
       await hrClient.employee.update({
         where: { id: employee.id },
         data: { portalAccessStatus: 'INVITED' }
       })
     }
   }
   ```

4. **Invitation Email Delivery**
   - Generates secure invitation token
   - Creates invitation record in database
   - Sends email with signup link: `/auth/employee-signup?token=...`
   - Sets expiration time (24 hours default)

## Technical Implementation

### Key Files Modified

1. **`/src/app/api/employees/route.ts`**
   - Added automatic invitation triggering
   - Enhanced error handling for invitation failures
   - Improved response structure

2. **`/src/app/api/employees/invite/route.ts`**
   - Fixed invitation URL to use `/auth/employee-signup`
   - Improved error handling and validation
   - Enhanced response messages

3. **`/src/lib/email-service.ts`**
   - Supports both development and production email sending
   - Includes comprehensive invitation email template
   - Handles token generation and validation

### Database Schema

The integration uses the existing employee portal access fields:

```prisma
model Employee {
  id                   String   @id @default(cuid())
  email               String   @unique
  firstName           String
  lastName            String
  
  // Portal access fields
  portalAccessStatus  PortalAccessStatus @default(NO_ACCESS)
  invitedAt          DateTime?
  invitationToken    String?   @unique
  invitationExpires  DateTime?
  
  // ... other fields
}

enum PortalAccessStatus {
  NO_ACCESS
  INVITED
  ACTIVE
  SUSPENDED
}
```

## Usage Instructions

### For Administrators

1. **Navigate to Employee Creation**
   - Go to Dashboard → Employees → Add New Employee

2. **Fill Out Employee Information**
   - Complete all required fields across the 5 steps
   - Personal Information: Name, Email, BSN
   - Employment Information: Department, Position, Contract details
   - Salary Information: Monthly salary amount
   - Emergency Contact: Optional but recommended

3. **Enable Portal Invitation**
   - On the final "Portal Access" step
   - Check the box: "Send portal invitation to employee"
   - Click "Create Employee"

4. **Confirmation**
   - System creates employee record
   - Automatically sends invitation email
   - Employee status set to "INVITED"
   - Admin receives confirmation of successful creation

### For Employees

1. **Receive Invitation Email**
   - Email sent to employee's registered email address
   - Contains secure signup link with token
   - Link expires in 24 hours

2. **Complete Signup**
   - Click link in email
   - Redirected to `/auth/employee-signup?token=...`
   - Complete password setup and profile
   - Gain access to employee portal

## Configuration

### Environment Variables

```bash
# Email Service Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@company.com

# Application URLs
NEXTAUTH_URL=http://localhost:3000
```

### Email Templates

The invitation email includes:
- Company branding
- Personal greeting with employee name
- Secure signup link with token
- Instructions for completing signup
- Support contact information

## Error Handling

### Common Scenarios

1. **Email Delivery Failure**
   - Employee created successfully
   - Portal status remains "NO_ACCESS"
   - Admin notified of email failure
   - Manual invitation can be sent later

2. **Invalid Employee Data**
   - Validation errors displayed in form
   - No employee created
   - No invitation sent

3. **Duplicate Email Address**
   - Creation fails with clear error message
   - Suggests checking existing employees
   - No partial data created

### Error Messages

- **Success**: "Employee created successfully and invitation sent!"
- **Partial Success**: "Employee created but invitation email failed to send"
- **Validation Error**: "Please correct the highlighted fields"
- **Duplicate Error**: "An employee with this email already exists"

## Testing

### Manual Testing

1. **Test with Invitation**
   - Create employee with checkbox checked
   - Verify invitation email sent
   - Confirm employee status is "INVITED"

2. **Test without Invitation**
   - Create employee with checkbox unchecked
   - Verify no email sent
   - Confirm employee status is "NO_ACCESS"

### Automated Testing

A test script is available at `/test-employee-creation-with-invitation.js`:

```bash
node test-employee-creation-with-invitation.js
```

## Security Considerations

1. **Invitation Tokens**
   - Cryptographically secure random tokens
   - Single-use tokens (invalidated after signup)
   - 24-hour expiration time
   - Stored securely in database

2. **Email Validation**
   - Email format validation
   - Duplicate email prevention
   - Secure email delivery

3. **Access Control**
   - Only authenticated administrators can create employees
   - Invitation links are user-specific
   - Portal access requires completed signup

## Monitoring and Logging

### Invitation Tracking

- All invitation attempts logged
- Success/failure rates tracked
- Email delivery status monitored
- Employee signup completion tracked

### Log Examples

```
[INFO] Employee invitation sent: employee@company.com
[INFO] Invitation token generated: inv_abc123...
[WARN] Email delivery failed: SMTP timeout
[INFO] Employee completed signup: employee@company.com
```

## Troubleshooting

### Common Issues

1. **Invitations Not Sending**
   - Check SMTP configuration
   - Verify email service credentials
   - Check firewall/network settings

2. **Signup Links Not Working**
   - Verify NEXTAUTH_URL configuration
   - Check token expiration
   - Ensure database connectivity

3. **Form Validation Errors**
   - Check required field completion
   - Verify BSN format (Dutch social security number)
   - Ensure unique email addresses

### Support

For technical support or questions about the invitation integration:
- Check application logs for detailed error messages
- Verify environment configuration
- Test email service connectivity
- Contact system administrator

## Future Enhancements

### Planned Features

1. **Bulk Invitations**
   - Send invitations to multiple employees
   - CSV import with automatic invitations
   - Batch processing capabilities

2. **Invitation Templates**
   - Customizable email templates
   - Multi-language support
   - Company branding options

3. **Advanced Scheduling**
   - Schedule invitations for future dates
   - Reminder emails for incomplete signups
   - Automatic re-invitations

4. **Analytics Dashboard**
   - Invitation success rates
   - Signup completion tracking
   - Employee engagement metrics

---

*Last updated: July 24, 2025*
*Version: 1.0*

