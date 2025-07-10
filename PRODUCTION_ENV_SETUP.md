# Production Environment Variables Setup

## Required Environment Variables for Vercel

Add these environment variables in your Vercel project settings:

### Authentication Database (Required for NextAuth PrismaAdapter)
```
DATABASE_URL=postgresql://neondb_owner:***REMOVED***@ep-spring-bread-a2zggns1-pooler.eu-central-1.aws.neon.tech/salarysync_auth?sslmode=require&channel_binding=require
```

### Three-Database Architecture
```
AUTH_DATABASE_URL=postgresql://neondb_owner:***REMOVED***@ep-spring-bread-a2zggns1-pooler.eu-central-1.aws.neon.tech/salarysync_auth?sslmode=require&channel_binding=require

HR_DATABASE_URL=postgresql://neondb_owner:***REMOVED***@ep-sweet-cell-a2sb5v58-pooler.eu-central-1.aws.neon.tech/salarysync_hr?sslmode=require&channel_binding=require

PAYROLL_DATABASE_URL=postgresql://neondb_owner:***REMOVED***@ep-fancy-haze-a25vlf52-pooler.eu-central-1.aws.neon.tech/salarysync_payroll?sslmode=require&channel_binding=require
```

### Email Service (Mailtrap)
```
MAILTRAP_API_TOKEN=8f07f19cb8eb0d93c18f144cc1941e47
MAILTRAP_API_URL=https://send.api.mailtrap.io/api/send
EMAIL_FROM=hello@salarysync.online
EMAIL_FROM_NAME=SalarySync
```

### NextAuth Configuration
```
NEXTAUTH_URL=https://www.salarysync.nl
NEXTAUTH_SECRET=dutch-payroll-2025-super-secret-key-for-production-change-this-random-string
```

### Other Required Variables
```
NODE_ENV=production
```

## Why DATABASE_URL is Required

Even though we use a three-database architecture, NextAuth's PrismaAdapter requires the `DATABASE_URL` environment variable. This should point to the auth database to maintain compatibility.

## Steps to Add in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable above
4. Redeploy the application

This will resolve the "Internal server error" during registration.
