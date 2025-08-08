# Employee Portal Invitation System - Integration Guide

## Overview

This document describes the enhanced automated employee portal invitation system that has been integrated into your Dutch Payroll System. The system follows the playbook requirements and provides comprehensive automation for employee portal access management.

## ✅ Playbook Requirements Implemented

1. **Automatic Employee Identification** - System identifies employees who need portal access
2. **Secure Token Generation** - Cryptographically secure invitation tokens with expiration
3. **Personalized Email Invitations** - Professional HTML and text email templates with retry support
4. **Database Status Management** - Real-time updates of employee and invitation status
5. **Comprehensive Logging** - Detailed activity logs for all operations
6. **Batch Processing** - Configurable batch sizes to avoid system overload
7. **Automatic Retry Mechanism** - Intelligent retry logic for failed invitations

## New API Endpoints

### 1. Batch Invitation Processing
```
POST /api/employees/invitations/batch
GET  /api/employees/invitations/batch
```

**Features:**
- Process multiple employees in configurable batches
- Rate limiting to prevent email service overload
- Automatic skipping of employees with existing invitations
- Comprehensive result tracking

**Example Usage:**
```javascript
// Send invitations to all employees needing access
const response = await fetch('/api/employees/invitations/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyId: 'your-company-id',
    sendImmediately: true,
    batchSize: 10,
    rateLimitDelay: 1000
  })
})
```

### 2. Retry Failed Invitations
```
POST /api/employees/invitations/retry
GET  /api/employees/invitations/retry
```

**Features:**
- Automatically identifies employees needing retry
- Handles expired tokens and stuck invitations
- Sends reminder emails with special formatting
- Configurable retry limits and delays

### 3. Comprehensive Monitoring
```
GET /api/employees/invitations/monitoring
POST /api/employees/invitations/monitoring (health actions)
```

**Features:**
- Real-time system health monitoring
- Performance metrics and trends
- Department-wise breakdown
- Automatic issue detection and alerts

### 4. Automated Scheduler
```
GET  /api/employees/invitations/scheduler
POST /api/employees/invitations/scheduler
```

**Features:**
- Configurable automated processing
- Background job scheduling
- Performance tracking
- Manual override capabilities

## Enhanced Email Service

The existing email service has been enhanced with:

### Retry Support
- Special formatting for reminder emails
- Clear indication when it's a retry attempt
- Improved subject lines for better recognition

### Template Improvements
- Professional HTML templates
- Responsive design for mobile devices
- Clear call-to-action buttons
- Company branding integration

## React Dashboard Component

A comprehensive dashboard component has been created:

### Location
```
src/components/InvitationDashboard.tsx
```

### Features
- Real-time monitoring of invitation status
- Automated scheduler control
- Manual action triggers
- Health status indicators
- Department breakdown views
- Performance trends

### Integration
```tsx
import InvitationDashboard from '@/components/InvitationDashboard'

// In your HR dashboard page
<InvitationDashboard companyId={currentCompany.id} />
```

## Database Schema Integration

The system uses your existing Employee model with these fields:

### Required Fields (Already Present)
- `portalAccessStatus`: Tracks invitation status
- `invitedAt`: Timestamp of last invitation
- `email`: Required for sending invitations
- `isActive`: Only active employees are processed

### Status Values
- `NO_ACCESS`: Employee needs invitation
- `INVITED`: Invitation sent, awaiting response
- `ACTIVE`: Employee has accepted and is using portal

## Configuration

### Environment Variables
```bash
# Email Configuration (existing)
MAILTRAP_API_TOKEN=your-token
MAILTRAP_API_URL=your-api-url
EMAIL_FROM=noreply@yourcompany.com
EMAIL_FROM_NAME="Your Company Name"

# Application URLs (existing)
NEXTAUTH_URL=https://your-domain.com
```

### Scheduler Configuration
The scheduler can be configured via the API:

```javascript
{
  enabled: true,
  batchSize: 10,           // Employees per batch
  rateLimitDelay: 1000,    // Delay between emails (ms)
  maxRetries: 3,           // Maximum retry attempts
  retryDelay: 300000,      // Delay before retry (ms)
  scheduleInterval: 60     // Run every N minutes
}
```

## Usage Examples

### 1. Manual Batch Processing
```javascript
// Send invitations to all employees needing access
const result = await fetch('/api/employees/invitations/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyId: 'company-123',
    sendImmediately: true
  })
})

const data = await result.json()
console.log(`Processed ${data.summary.total} employees`)
console.log(`Successful: ${data.summary.successful}`)
console.log(`Failed: ${data.summary.failed}`)
```

### 2. Enable Automated Processing
```javascript
// Start the automated scheduler
await fetch('/api/employees/invitations/scheduler', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyId: 'company-123',
    action: 'start',
    config: {
      scheduleInterval: 60,  // Run every hour
      batchSize: 5          // Process 5 employees at a time
    }
  })
})
```

### 3. Monitor System Health
```javascript
// Get comprehensive metrics
const metrics = await fetch('/api/employees/invitations/monitoring?companyId=company-123')
const data = await metrics.json()

console.log(`System Status: ${data.healthChecks.systemStatus}`)
console.log(`Acceptance Rate: ${data.overview.acceptanceRate}%`)
console.log(`Employees Needing Invitations: ${data.overview.needingInvitations}`)
```

### 4. Retry Failed Invitations
```javascript
// Retry all failed/stuck invitations
const result = await fetch('/api/employees/invitations/retry', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyId: 'company-123'
  })
})
```

## Integration Steps

### 1. Add Dashboard to HR Interface
```tsx
// In your HR dashboard page (e.g., src/app/hr/invitations/page.tsx)
import InvitationDashboard from '@/components/InvitationDashboard'

export default function InvitationsPage() {
  const { data: session } = useSession()
  const currentCompany = session?.user?.currentCompany

  return (
    <div className="container mx-auto py-6">
      <InvitationDashboard companyId={currentCompany.id} />
    </div>
  )
}
```

### 2. Add Navigation Menu Item
```tsx
// Add to your HR navigation menu
{
  title: "Employee Invitations",
  href: "/hr/invitations",
  icon: Mail,
  description: "Manage employee portal invitations"
}
```

### 3. Set Up Automated Processing
```javascript
// In your application initialization or admin panel
// Enable automated processing for all companies
const companies = await getActiveCompanies()

for (const company of companies) {
  await fetch('/api/employees/invitations/scheduler', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyId: company.id,
      action: 'start',
      config: {
        scheduleInterval: 120, // Every 2 hours
        batchSize: 10
      }
    })
  })
}
```

## Monitoring and Maintenance

### Health Checks
The system provides automatic health monitoring:

- **Stuck Invitations**: Identifies invitations pending > 7 days
- **Expired Tokens**: Tracks tokens that need cleanup
- **Failure Rate**: Monitors invitation success rates
- **System Status**: Overall health indicator

### Maintenance Tasks
```javascript
// Clean up expired tokens
await fetch('/api/employees/invitations/monitoring', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyId: 'company-123',
    action: 'cleanup_expired'
  })
})

// Mark stuck invitations for retry
await fetch('/api/employees/invitations/monitoring', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyId: 'company-123',
    action: 'mark_stuck_as_failed'
  })
})
```

## Security Considerations

### Token Security
- Cryptographically secure token generation using `crypto.randomBytes()`
- Time-limited tokens (7 days expiration)
- Single-use tokens (invalidated after acceptance)
- URL-safe base64 encoding

### Access Control
- Company-based access control
- Role-based permissions (owner, admin, hr)
- Session validation for all operations

### Rate Limiting
- Configurable delays between email sends
- Batch size limits to prevent overload
- Automatic retry with exponential backoff

## Performance Optimization

### Batch Processing
- Configurable batch sizes (default: 10)
- Rate limiting between batches
- Memory-efficient processing

### Database Optimization
- Indexed queries on common filters
- Efficient pagination for large datasets
- Minimal data transfer in API responses

### Email Service
- Async email sending
- Retry logic for failed sends
- Development mode for testing

## Troubleshooting

### Common Issues

1. **Emails Not Sending**
   - Check MAILTRAP_API_TOKEN configuration
   - Verify email service connectivity
   - Check development mode settings

2. **High Failure Rate**
   - Review email addresses for validity
   - Check rate limiting settings
   - Monitor email service quotas

3. **Scheduler Not Running**
   - Verify scheduler is enabled
   - Check for error messages in logs
   - Restart scheduler if needed

### Debug Endpoints
```javascript
// Get detailed employee list needing invitations
const employees = await fetch('/api/employees/invitations/batch?companyId=company-123')

// Get retry candidates
const retryList = await fetch('/api/employees/invitations/retry?companyId=company-123')

// Get scheduler status
const scheduler = await fetch('/api/employees/invitations/scheduler?companyId=company-123')
```

## Migration from Existing System

Your existing invitation scripts (`send-invitation.js`, `schedule-invitations.js`) can be gradually replaced:

### Phase 1: Parallel Operation
- Keep existing scripts for critical operations
- Use new system for new invitations
- Monitor both systems

### Phase 2: Gradual Migration
- Migrate department by department
- Use new retry system for failed invitations
- Enable automated processing for new employees

### Phase 3: Full Migration
- Disable old scripts
- Enable full automation
- Monitor and optimize performance

## Support and Maintenance

The integrated system provides:

1. **Comprehensive Logging**: All operations are logged for audit trails
2. **Health Monitoring**: Automatic detection of issues
3. **Performance Metrics**: Track system performance over time
4. **Automated Recovery**: Retry mechanisms for failed operations

For ongoing support:
- Monitor the dashboard regularly
- Review health checks weekly
- Optimize batch sizes based on email service limits
- Update email templates as needed

The system is designed to be robust, scalable, and maintainable, following enterprise best practices for automated employee management systems.

