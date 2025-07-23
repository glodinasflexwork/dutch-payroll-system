# Automated Employee Portal Invitation System

This document provides comprehensive documentation for the automated employee portal invitation system implemented for the Dutch Payroll System.

## Table of Contents

1. [Overview](#overview)
2. [System Components](#system-components)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [Monitoring and Logs](#monitoring-and-logs)
7. [Troubleshooting](#troubleshooting)
8. [Security Considerations](#security-considerations)

## Overview

The Automated Employee Portal Invitation System is designed to automatically send invitations to employees who need access to the employee portal. It ensures that all employees receive their invitations in a timely manner without requiring manual intervention.

### Key Features

- **Automated Invitations**: Automatically sends invitations to employees who haven't been invited yet
- **Scheduled Execution**: Runs on a configurable schedule (daily, weekly, etc.)
- **Batch Processing**: Processes employees in batches to avoid overloading the system
- **Retry Mechanism**: Automatically retries failed invitation attempts
- **Comprehensive Logging**: Maintains detailed logs of all invitation activities
- **Dry Run Mode**: Allows testing the system without sending actual emails
- **Service Management**: Includes scripts to start and stop the service

## System Components

The system consists of the following components:

1. **`auto-invite-employees.js`**: Core script that identifies employees who need invitations and sends them
2. **`schedule-invitations.js`**: Scheduler that runs the invitation process on a defined schedule
3. **`start-invitation-service.sh`**: Shell script to start the invitation service as a background process
4. **`stop-invitation-service.sh`**: Shell script to stop the invitation service
5. **`crontab-setup.txt`**: Crontab configuration for scheduling the invitation process

## Installation

### Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher
- Access to the HR and Auth databases
- Email service configuration (Mailtrap)

### Installation Steps

1. Ensure all required files are in the project directory:
   ```
   /dutch-payroll-system/
   ├── auto-invite-employees.js
   ├── schedule-invitations.js
   ├── start-invitation-service.sh
   ├── stop-invitation-service.sh
   └── crontab-setup.txt
   ```

2. Install required Node.js packages:
   ```bash
   cd /path/to/dutch-payroll-system
   npm install node-cron axios
   ```

3. Make the service scripts executable:
   ```bash
   chmod +x start-invitation-service.sh stop-invitation-service.sh
   ```

4. Create the logs directory:
   ```bash
   mkdir -p logs
   ```

5. Set up the crontab (optional, if using cron instead of the service):
   ```bash
   crontab crontab-setup.txt
   ```

## Configuration

### Environment Variables

The system requires the following environment variables to be set in the `.env.local` file:

```
HR_DATABASE_URL=postgresql://user:password@host:port/hr_database
AUTH_DATABASE_URL=postgresql://user:password@host:port/auth_database
MAILTRAP_API_TOKEN=your_mailtrap_api_token
MAILTRAP_API_URL=https://send.api.mailtrap.io/api/send
EMAIL_FROM=noreply@yourcompany.com
EMAIL_FROM_NAME=Your Company Name
NEXTAUTH_URL=https://your-application-url.com
```

### Configuration Options

The system behavior can be configured by modifying the `CONFIG` object in `auto-invite-employees.js`:

```javascript
const CONFIG = {
  // Number of days to look back for new employees
  lookbackDays: 30,
  
  // Maximum number of invitations to send per run
  batchSize: 50,
  
  // Log file path
  logFilePath: path.join(__dirname, 'logs', 'invitation-logs.json'),
  
  // Whether to actually send emails or just simulate
  dryRun: false,
  
  // Whether to include employees who have had failed invitation attempts
  includeFailedAttempts: true,
  
  // Maximum number of retry attempts for failed invitations
  maxRetryAttempts: 3,
};
```

The scheduler can be configured by modifying the `SCHEDULER_CONFIG` object in `schedule-invitations.js`:

```javascript
const SCHEDULER_CONFIG = {
  // Cron expression for when to run the invitation process
  // Default: Every day at 9:00 AM (server time)
  cronSchedule: '0 9 * * *',
  
  // Whether to run immediately on startup
  runOnStartup: true,
  
  // Log file for the scheduler
  logFilePath: path.join(__dirname, 'logs', 'scheduler-logs.json'),
  
  // Whether to use dry run mode (no actual emails or database changes)
  dryRun: false
};
```

## Usage

### Running the Invitation Process Manually

To run the invitation process manually:

```bash
node auto-invite-employees.js
```

To run in dry run mode (no actual emails or database changes):

```bash
node auto-invite-employees.js --dry-run
```

### Starting the Invitation Service

To start the invitation service as a background process:

```bash
./start-invitation-service.sh
```

To start in dry run mode:

```bash
./start-invitation-service.sh --dry-run
```

### Stopping the Invitation Service

To stop the invitation service:

```bash
./stop-invitation-service.sh
```

### Using Crontab

If you prefer to use crontab instead of the service, you can install the provided crontab configuration:

```bash
crontab crontab-setup.txt
```

This will run the invitation process every day at 9:00 AM.

## Monitoring and Logs

### Log Files

The system generates the following log files:

- **`logs/invitation-logs.json`**: Records of all invitation attempts
- **`logs/scheduler-logs.json`**: Records of all scheduler runs
- **`logs/invitation-service.log`**: Output from the invitation service
- **`logs/cron-invitations.log`**: Output from cron-scheduled runs

### Monitoring the Service

To check if the invitation service is running:

```bash
ps aux | grep schedule-invitations.js
```

To view the most recent log output:

```bash
tail -f logs/invitation-service.log
```

## Troubleshooting

### Common Issues

1. **Service won't start**
   - Check if the service is already running
   - Ensure the scripts have executable permissions
   - Check for errors in the log file

2. **Invitations not being sent**
   - Verify email service configuration
   - Check database connectivity
   - Ensure there are employees who need invitations
   - Check the log files for errors

3. **Database connection errors**
   - Verify database URLs in the .env.local file
   - Check database server status
   - Ensure the Prisma clients are generated correctly

### Debugging

For detailed debugging, you can run the invitation process manually with the `--dry-run` flag:

```bash
node auto-invite-employees.js --dry-run
```

This will simulate the invitation process without sending actual emails or making database changes.

## Security Considerations

### Data Protection

- The system only processes employee data that is necessary for sending invitations
- Invitation tokens are securely generated using cryptographic methods
- Tokens expire after 48 hours for security
- All sensitive information is stored in the .env.local file, which should have restricted access

### Email Security

- Emails are sent using a secure API
- The system uses proper authentication for sending emails
- Email templates do not include sensitive information beyond what is necessary

### Database Security

- Database connections use secure connection strings
- The system uses the principle of least privilege for database access
- Database credentials are stored securely in the .env.local file

