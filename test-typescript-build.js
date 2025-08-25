/**
 * Test TypeScript Build and Module Resolution
 * Verifies that TypeScript modules can be properly imported and used
 */

const path = require('path');
const fs = require('fs');

async function testTypeScriptBuild() {
  console.log('🔧 Testing TypeScript Build and Module Resolution...\n');

  try {
    // Test 1: Check if Next.js build output exists
    console.log('1️⃣ Checking Next.js build output...');
    
    const buildDir = path.join(__dirname, '.next');
    const serverDir = path.join(buildDir, 'server');
    
    if (fs.existsSync(buildDir)) {
      console.log('   ✅ .next build directory exists');
      
      if (fs.existsSync(serverDir)) {
        console.log('   ✅ Server build directory exists');
        
        // Check for compiled API routes
        const apiDir = path.join(serverDir, 'pages', 'api');
        if (fs.existsSync(apiDir)) {
          console.log('   ✅ API routes compiled');
        } else {
          console.log('   ❌ API routes not found in build');
        }
      } else {
        console.log('   ❌ Server build directory missing');
      }
    } else {
      console.log('   ❌ .next build directory does not exist');
      console.log('   💡 Need to run: npm run build');
    }

    // Test 2: Check TypeScript configuration
    console.log('\n2️⃣ Checking TypeScript configuration...');
    
    const tsconfigPath = path.join(__dirname, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      console.log('   ✅ tsconfig.json exists');
      console.log(`   📋 Module: ${tsconfig.compilerOptions.module}`);
      console.log(`   📋 Target: ${tsconfig.compilerOptions.target}`);
      console.log(`   📋 Module Resolution: ${tsconfig.compilerOptions.moduleResolution}`);
      
      if (tsconfig.compilerOptions.paths && tsconfig.compilerOptions.paths['@/*']) {
        console.log('   ✅ Path aliases configured (@/*)');
      } else {
        console.log('   ❌ Path aliases not configured');
      }
    } else {
      console.log('   ❌ tsconfig.json not found');
    }

    // Test 3: Check if we can use ts-node
    console.log('\n3️⃣ Testing ts-node availability...');
    
    try {
      require('ts-node');
      console.log('   ✅ ts-node is available');
    } catch (error) {
      console.log('   ❌ ts-node not available');
      console.log('   💡 Install with: npm install --save-dev ts-node');
    }

    // Test 4: Check module structure
    console.log('\n4️⃣ Checking compliance module structure...');
    
    const complianceModules = [
      'src/lib/dutch-minimum-wage.ts',
      'src/lib/dutch-social-security.ts',
      'src/lib/working-hours-calculator.ts',
      'src/lib/holiday-allowance-calculator.ts',
      'src/lib/payslip-generator.ts'
    ];

    complianceModules.forEach(modulePath => {
      const fullPath = path.join(__dirname, modulePath);
      if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${modulePath} exists`);
        
        // Check if it has proper exports
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('export ') || content.includes('module.exports')) {
          console.log(`      📤 Has exports`);
        } else {
          console.log(`      ❌ No exports found`);
        }
      } else {
        console.log(`   ❌ ${modulePath} missing`);
      }
    });

    console.log('\n🎯 RECOMMENDATIONS:\n');
    
    if (!fs.existsSync(buildDir)) {
      console.log('1. Run build first: npm run build');
    }
    
    console.log('2. Use ts-node for development: npm install --save-dev ts-node');
    console.log('3. Create proper API route structure for TypeScript');
    console.log('4. Use Next.js API route system instead of direct module imports');
    
    return true;

  } catch (error) {
    console.error('❌ Error testing TypeScript build:', error);
    return false;
  }
}

// Alternative approach: Test using Next.js API structure
async function testNextJSAPIApproach() {
  console.log('\n🚀 Testing Next.js API Approach...\n');
  
  console.log('💡 RECOMMENDED SOLUTION:');
  console.log('');
  console.log('Instead of directly importing TypeScript modules in Node.js,');
  console.log('use the Next.js API route system which handles TypeScript compilation:');
  console.log('');
  console.log('1. Keep all compliance logic in TypeScript files');
  console.log('2. Use API routes (/api/payslips/generate) for payslip generation');
  console.log('3. Let Next.js handle TypeScript compilation automatically');
  console.log('4. Call API endpoints instead of direct module imports');
  console.log('');
  console.log('This approach:');
  console.log('✅ Maintains TypeScript benefits');
  console.log('✅ Uses Next.js built-in compilation');
  console.log('✅ Proper separation of concerns');
  console.log('✅ Production-ready architecture');
  
  return true;
}

// Run tests
async function runTests() {
  console.log('🔍 TypeScript Build Analysis\n');
  console.log('=' .repeat(60));
  
  await testTypeScriptBuild();
  await testNextJSAPIApproach();
  
  console.log('\n' + '=' .repeat(60));
  console.log('\n🎯 CONCLUSION:');
  console.log('');
  console.log('The smartest fix is to use Next.js API routes properly');
  console.log('instead of trying to directly import TypeScript modules.');
  console.log('');
  console.log('This maintains all TypeScript benefits while ensuring');
  console.log('proper compilation and production compatibility.');
}

runTests().catch(console.error);

