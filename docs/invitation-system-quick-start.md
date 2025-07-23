# Employee Portal Invitation System: Quick Start Guide

This quick start guide provides essential information to get the automated employee portal invitation system up and running quickly.

## 1. System Overview

The automated invitation system sends portal invitations to employees who:
- Have not yet been invited
- Have been added to the system recently
- Have a valid email address

The system can run as:
- A scheduled service (runs continuously in the background)
- A cron job (runs at specified times)
- A manual process (run on-demand)

## 2. Quick Setup

### Prerequisites

Ensure you have:
- Node.js installed
- Database connection details
- Email service configuration

### Step 1: Configure Environment

Make sure your `.env.local` file contains:

```
HR_DATABASE_URL=postgresql://user:password@host:port/hr_database
AUTH_DATABASE_URL=postgresql://user:password@host:port/auth_database
MAILTRAP_API_TOKEN=your_mailtrap_api_token
MAILTRAP_API_URL=https://send.api.mailtrap.io/api/send
EMAIL_FROM=noreply@yourcompany.com
EMAIL_FROM_NAME=Your Company Name
NEXTAUTH_URL=https://your-application-url.com
```

### Step 2: Install Dependencies

```bash
npm install node-cron axios
```

### Step 3: Choose Your Deployment Method

#### Option A: Run as a Service

Start the service (runs continuously in the background):

```bash
./start-invitation-service.sh
```

Stop the service when needed:

```bash
./stop-invitation-service.sh
```

#### Option B: Set Up as a Cron Job

Install the crontab configuration:

```bash
crontab crontab-setup.txt
```

#### Option C: Run Manually

Run the invitation process on-demand:

```bash
node auto-invite-employees.js
```

## 3. Testing the System

To test without sending actual emails or making database changes:

```bash
node auto-invite-employees.js --dry-run
```

Or start the service in dry run mode:

```bash
./start-invitation-service.sh --dry-run
```

## 4. Monitoring

Check service status:

```bash
ps aux | grep schedule-invitations.js
```

View logs:

```bash
tail -f logs/invitation-service.log
```

Check invitation history:

```bash
cat logs/invitation-logs.json
```

## 5. Customization

To customize the system behavior, edit:

- `auto-invite-employees.js`: Modify the `CONFIG` object
- `schedule-invitations.js`: Modify the `SCHEDULER_CONFIG` object

Common customizations:
- Change the schedule (`cronSchedule` in SCHEDULER_CONFIG)
- Adjust batch size (`batchSize` in CONFIG)
- Modify lookback period (`lookbackDays` in CONFIG)

## 6. Troubleshooting

If you encounter issues:

1. Check the log files in the `logs` directory
2. Verify database connectivity
3. Ensure email service configuration is correct
4. Run in dry run mode to diagnose issues

For detailed troubleshooting, refer to the full documentation in `docs/automated-invitation-system.md`.

## 7. Need Help?

For additional assistance:
- Refer to the comprehensive documentation
- Contact the system administrator
- Check the GitHub repository for updates

