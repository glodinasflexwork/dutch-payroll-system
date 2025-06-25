# Dutch Payroll System - Enterprise Edition

A comprehensive, enterprise-grade payroll system built specifically for Dutch businesses with full tax compliance and modern technology stack.

## 🚀 Features

- **Dutch Tax Compliance**: 2025 tax rates (Income tax, AOW, WLZ, WW, WIA)
- **BSN Validation**: 11-proof algorithm for Dutch social security numbers
- **Professional Dashboard**: KPIs, analytics, and business intelligence
- **Employee Management**: Comprehensive employee records with Dutch-specific fields
- **Payroll Processing**: Automated calculations with Dutch employment law compliance
- **Reports & Analytics**: Professional reports with export capabilities
- **Modern UI/UX**: Responsive design that works on all devices

## 🏗️ Technology Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Prisma ORM, NextAuth.js, SQLite
- **Charts**: Recharts for data visualization
- **Authentication**: Enterprise-grade session management
- **Validation**: Zod for runtime type checking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd dutch-payroll-nextjs

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client and create database
npx prisma generate
npx prisma db push

# Start development server
npm run dev
```

## 🌐 Deployment to Vercel

### 1. Prepare for Deployment
```bash
# Test production build locally
npm run build
npm start
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Set up environment variables
# - Deploy
```

### 3. Environment Variables for Vercel
Set these in your Vercel dashboard:

```
DATABASE_URL="file:./prod.db"
NEXTAUTH_SECRET="your-production-secret-key"
NEXTAUTH_URL="https://your-app.vercel.app"
NODE_ENV="production"
```

### 4. Database Setup
For production, consider upgrading to PostgreSQL:
```
DATABASE_URL="postgresql://username:password@host:port/database"
```

## 📊 Usage

### Getting Started
1. **Register**: Create account with company information
2. **Add Employees**: Use comprehensive forms with Dutch validation
3. **Process Payroll**: Calculate monthly payroll with tax compliance
4. **Generate Reports**: Export professional payroll reports

### Key Features
- **Dashboard**: View KPIs and analytics
- **Employees**: Manage employee records with BSN validation
- **Payroll**: Process payroll with Dutch tax calculations
- **Reports**: Generate comprehensive reports and payslips
- **Analytics**: Interactive charts and business intelligence

## 🇳🇱 Dutch Compliance

### Tax Calculations (2025)
- **Income Tax**: 36.93% and 49.50% brackets
- **AOW (Pension)**: Old-age pension contributions
- **WLZ (Healthcare)**: Long-term care insurance
- **WW (Unemployment)**: Unemployment insurance
- **WIA (Disability)**: Work and income capacity insurance

### Validations
- **BSN**: 11-proof algorithm validation
- **Postal Codes**: 1234 AB format
- **IBAN**: Dutch bank account formatting
- **Phone Numbers**: +31 format

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Main application
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── layout/           # Layout components
│   └── dashboard/        # Dashboard-specific components
├── lib/                  # Utilities and configurations
└── types/                # TypeScript type definitions
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Commands
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema to database
- `npx prisma studio` - Open Prisma Studio

## 📚 Documentation

See `Dutch_Payroll_System_Enterprise_Documentation.md` for comprehensive system documentation.

## 🎯 Business Value

- **Cost Savings**: No monthly subscription fees
- **Dutch Compliance**: Always up-to-date with regulations
- **Professional Quality**: Enterprise-grade functionality
- **Scalable**: Grows with your business

## 📄 License

This project is proprietary software developed for specific business needs.

---

**Built with ❤️ for Dutch businesses**

