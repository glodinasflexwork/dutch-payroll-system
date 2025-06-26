# Multi-Tenancy Transformation Analysis
## Dutch Payroll System → Commercial SaaS

### Current State Assessment

#### ✅ What's Already Good
- **Basic tenant isolation**: Most models have `companyId` field
- **Session-based access control**: API routes filter by `session.user.companyId`
- **Company-scoped data**: Employees, PayrollRecords, TaxSettings are company-specific
- **Modern architecture**: Next.js, Prisma, PostgreSQL - all SaaS-ready

#### ❌ Critical Issues for Multi-Tenancy

1. **Global Unique Constraints**
   - `Employee.employeeNumber` is globally unique (should be per-company)
   - `Employee.bsn` is globally unique (should be per-company)
   - This prevents multiple companies from having the same employee numbers/BSNs

2. **User-Company Relationship**
   - Current: One user = One company (1:1 relationship)
   - Needed: One user = Multiple companies with different roles (M:N relationship)
   - Users should be able to switch between companies they have access to

3. **Missing Subscription Models**
   - No subscription/billing entities
   - No plan limitations or feature gating
   - No usage tracking

4. **No Tenant-Level Configuration**
   - No tenant-specific settings
   - No resource limits per tenant
   - No feature flags per tenant

### Required Database Schema Changes

#### 1. Fix Unique Constraints
```prisma
model Employee {
  // Change from:
  employeeNumber String @unique
  bsn           String @unique
  
  // To:
  employeeNumber String
  bsn           String
  
  // Add compound unique constraints:
  @@unique([companyId, employeeNumber])
  @@unique([companyId, bsn])
}
```

#### 2. Add Subscription Models
```prisma
model Subscription {
  id            String   @id @default(cuid())
  companyId     String   @unique
  planId        String
  status        String   // active, canceled, past_due, etc.
  stripeId      String?  // Stripe subscription ID
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd  Boolean @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  company       Company @relation(fields: [companyId], references: [id])
  plan          Plan    @relation(fields: [planId], references: [id])
}

model Plan {
  id            String   @id @default(cuid())
  name          String   // "Starter", "Professional", "Enterprise"
  stripePriceId String   // Stripe price ID
  maxEmployees  Int?     // null = unlimited
  maxPayrolls   Int?     // null = unlimited
  features      Json     // Feature flags as JSON
  price         Float    // Monthly price in cents
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  
  subscriptions Subscription[]
}
```

#### 3. User-Company Many-to-Many Relationship
```prisma
model UserCompany {
  id        String   @id @default(cuid())
  userId    String
  companyId String
  role      String   // "admin", "hr", "accountant", "employee"
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  
  user      User    @relation(fields: [userId], references: [id])
  company   Company @relation(fields: [companyId], references: [id])
  
  @@unique([userId, companyId])
}

// Update User model
model User {
  // Remove: companyId String?
  // Remove: company  Company? @relation(fields: [companyId], references: [id])
  
  // Add:
  companies UserCompany[]
}

// Update Company model
model Company {
  // Add:
  userCompanies UserCompany[]
  subscription  Subscription?
}
```

#### 4. Add Tenant Configuration
```prisma
model TenantConfig {
  id            String   @id @default(cuid())
  companyId     String   @unique
  settings      Json     // Tenant-specific settings
  limits        Json     // Usage limits
  features      Json     // Enabled features
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  company       Company @relation(fields: [companyId], references: [id])
}
```

### Required Code Changes

#### 1. Update Authentication System
- Modify session to include current company context
- Add company switching functionality
- Update middleware to handle multi-company access

#### 2. Update API Routes
- Add company context validation
- Implement role-based permissions per company
- Add subscription/plan validation

#### 3. Add Subscription Management
- Stripe integration for payments
- Plan upgrade/downgrade logic
- Usage tracking and limits enforcement

#### 4. Update Frontend
- Company switcher component
- Subscription management UI
- Plan-based feature gating

### Implementation Priority

#### Phase 2A: Database Schema (Week 1)
1. Create migration for new models (Subscription, Plan, UserCompany, TenantConfig)
2. Fix unique constraints on Employee model
3. Update existing data to new schema

#### Phase 2B: Authentication & Access Control (Week 2)
1. Update authentication to support multi-company
2. Implement role-based access control
3. Add company switching functionality

#### Phase 2C: API Updates (Week 3)
1. Update all API routes for new user-company relationship
2. Add subscription validation middleware
3. Implement plan-based feature gating

#### Phase 2D: Frontend Updates (Week 4)
1. Add company switcher to navigation
2. Update forms and components for multi-tenancy
3. Add subscription management pages

### Risk Mitigation

#### Data Migration Strategy
1. **Backup current database** before any changes
2. **Create migration scripts** that preserve existing data
3. **Test migration** on copy of production data
4. **Rollback plan** in case of issues

#### Backward Compatibility
1. **Gradual migration** - keep old and new systems working temporarily
2. **Feature flags** to enable/disable new multi-tenant features
3. **Comprehensive testing** of all existing functionality

### Success Metrics

#### Technical Metrics
- ✅ Complete tenant data isolation (no cross-tenant data leaks)
- ✅ All existing functionality works with new schema
- ✅ Performance maintained or improved
- ✅ Zero data loss during migration

#### Business Metrics
- ✅ Multiple companies can use the system simultaneously
- ✅ Users can manage multiple companies
- ✅ Subscription plans work correctly
- ✅ Billing integration functional

This analysis provides the roadmap for transforming the current single-tenant system into a robust multi-tenant SaaS platform.

