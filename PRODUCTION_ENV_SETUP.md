# Production Environment Variables Setup

## Required Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

### Three-Database Architecture
```
AUTH_DATABASE_URL=postgresql://neondb_owner:[PASSWORD]@ep-spring-bread-a2zggns1-pooler.eu-central-1.aws.neon.tech/salarysync_auth?sslmode=require&channel_binding=require

HR_DATABASE_URL=postgresql://neondb_owner:[PASSWORD]@ep-sweet-cell-a2sb5v58-pooler.eu-central-1.aws.neon.tech/salarysync_hr?sslmode=require&channel_binding=require

PAYROLL_DATABASE_URL=postgresql://neondb_owner:[PASSWORD]@ep-fancy-haze-a25vlf52-pooler.eu-central-1.aws.neon.tech/salarysync_payroll?sslmode=require&channel_binding=require
```

**Note:** Replace `[PASSWORD]` with the actual database passwords from your Neon dashboard.

### Email Service (Mailtrap)
```
MAILTRAP_API_TOKEN=[YOUR_MAILTRAP_TOKEN]
MAILTRAP_API_URL=https://send.api.mailtrap.io/api/send
EMAIL_FROM=hello@salarysync.online
EMAIL_FROM_NAME=SalarySync
```

### NextAuth Configuration
```
NEXTAUTH_URL=https://www.salarysync.nl
NEXTAUTH_SECRET=[GENERATE_RANDOM_SECRET]
```

### Other Required Variables
```
NODE_ENV=production
```

## Clean Three-Database Architecture

The application now uses a clean three-database architecture without requiring DATABASE_URL:

- **NextAuth**: Uses dedicated auth Prisma client with AUTH_DATABASE_URL
- **Application Logic**: Uses specific database clients for each domain
- **No Legacy Dependencies**: No DATABASE_URL environment variable needed

## Steps to Add in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable above (NO DATABASE_URL needed)
4. Replace placeholder values with actual credentials
5. Redeploy the application

This maintains the clean three-database architecture while ensuring NextAuth works correctly.

## Security Notes

- Never commit actual passwords or API keys to version control
- Use placeholder values in documentation
- Rotate credentials regularly
- Use environment variables for all sensitive data

