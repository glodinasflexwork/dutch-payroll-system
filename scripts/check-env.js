#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Checks if all required environment variables are properly set
 */

const requiredEnvVars = [
  'AUTH_DATABASE_URL',
  'HR_DATABASE_URL', 
  'PAYROLL_DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'MAILTRAP_API_TOKEN',
  'EMAIL_FROM'
];

const optionalEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'NODE_ENV'
];

console.log('🔍 Checking environment variables...\n');

let hasErrors = false;

// Check required variables
console.log('📋 Required Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: MISSING`);
    hasErrors = true;
  } else if (varName.includes('DATABASE_URL')) {
    // Validate database URL format
    if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
      console.log(`❌ ${varName}: INVALID FORMAT (must start with postgresql:// or postgres://)`);
      hasErrors = true;
    } else {
      console.log(`✅ ${varName}: SET (${value.substring(0, 20)}...)`);
    }
  } else {
    console.log(`✅ ${varName}: SET`);
  }
});

console.log('\n📋 Optional Variables:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: NOT SET`);
  } else {
    console.log(`✅ ${varName}: SET`);
  }
});

console.log('\n🔍 Environment Summary:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`Platform: ${process.platform}`);
console.log(`Node Version: ${process.version}`);

if (hasErrors) {
  console.log('\n❌ Environment validation failed! Please set the missing required variables.');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are properly set!');
  process.exit(0);
}

