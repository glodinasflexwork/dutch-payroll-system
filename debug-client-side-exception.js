// Script to check for potential client-side exceptions in the code
const fs = require('fs');
const path = require('path');

// Function to check for common client-side errors in React components
function checkForClientSideErrors(filePath) {
  try {
    console.log(`\n🔍 Checking file: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for common issues
    const issues = [];
    
    // Check for accessing properties of undefined/null
    if (content.includes('.portalAccess?') || content.includes('.portalAccess?.')) {
      console.log('✅ File uses optional chaining for portalAccess - good!');
    } else if (content.includes('.portalAccess.')) {
      issues.push('⚠️ Accessing portalAccess without optional chaining - could cause null reference');
    }
    
    // Check for other potential null references
    const potentialNullProps = ['department', 'contracts', 'emergencyContact', 'Company'];
    potentialNullProps.forEach(prop => {
      if (content.includes(`.${prop}?`) || content.includes(`.${prop}?.`)) {
        console.log(`✅ File uses optional chaining for ${prop} - good!`);
      } else if (content.includes(`.${prop}.`)) {
        issues.push(`⚠️ Accessing ${prop} without optional chaining - could cause null reference`);
      }
    });
    
    // Check for missing null checks in formatters
    if (content.includes('formatCurrency') && !content.includes('if (!amount')) {
      issues.push('⚠️ formatCurrency may not handle null/undefined values properly');
    }
    
    if (content.includes('formatDate') && !content.includes('if (!dateString')) {
      issues.push('⚠️ formatDate may not handle null/undefined values properly');
    }
    
    // Check for missing error handling in API calls
    if (content.includes('fetch(') && !content.includes('catch')) {
      issues.push('⚠️ API call without proper error handling');
    }
    
    // Check for missing null checks in rendering
    if (content.includes('employee.') && !content.includes('employee?')) {
      issues.push('⚠️ Accessing employee properties without checking if employee exists');
    }
    
    // Report issues
    if (issues.length > 0) {
      console.log('\n⚠️ Potential issues found:');
      issues.forEach(issue => console.log(`- ${issue}`));
    } else {
      console.log('\n✅ No common client-side issues found in this file');
    }
    
    // Check for syntax errors (very basic check)
    try {
      require('vm').runInNewContext(content);
    } catch (syntaxError) {
      console.log('\n❌ Syntax error detected:');
      console.log(syntaxError.message);
    }
    
    return issues.length === 0;
  } catch (error) {
    console.error(`❌ Error checking file ${filePath}:`, error.message);
    return false;
  }
}

// Main function to check files
async function checkFiles() {
  console.log('🔍 CHECKING FOR POTENTIAL CLIENT-SIDE EXCEPTIONS...\n');
  
  // Check the employee detail page
  const employeeDetailPage = path.join(__dirname, 'src', 'app', 'dashboard', 'employees', '[id]', 'page.tsx');
  if (fs.existsSync(employeeDetailPage)) {
    checkForClientSideErrors(employeeDetailPage);
  } else {
    console.log(`❌ Employee detail page not found at: ${employeeDetailPage}`);
  }
  
  // Check the employee API route
  const employeeApiRoute = path.join(__dirname, 'src', 'app', 'api', 'employees', '[id]', 'route.ts');
  if (fs.existsSync(employeeApiRoute)) {
    checkForClientSideErrors(employeeApiRoute);
  } else {
    console.log(`❌ Employee API route not found at: ${employeeApiRoute}`);
  }
  
  // Check for recent changes that might have introduced issues
  console.log('\n🔍 CHECKING RECENT CHANGES...');
  const recentlyModifiedFiles = [
    path.join(__dirname, 'src', 'app', 'dashboard', 'employees', '[id]', 'page.tsx'),
    path.join(__dirname, 'src', 'app', 'api', 'employees', '[id]', 'route.ts'),
    path.join(__dirname, 'src', 'components', 'ui', 'avatar.tsx'),
    path.join(__dirname, 'src', 'components', 'ui', 'separator.tsx')
  ];
  
  for (const file of recentlyModifiedFiles) {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      const lastModified = new Date(stats.mtime);
      const now = new Date();
      const hoursSinceModified = (now - lastModified) / (1000 * 60 * 60);
      
      console.log(`\n📄 ${path.basename(file)}`);
      console.log(`   Last modified: ${lastModified.toLocaleString()}`);
      console.log(`   Hours since modified: ${hoursSinceModified.toFixed(2)}`);
      
      if (hoursSinceModified < 24) {
        console.log('   ⚠️ Recently modified - potential source of issues');
        checkForClientSideErrors(file);
      }
    }
  }
  
  // Check for missing UI components
  console.log('\n🔍 CHECKING FOR MISSING UI COMPONENTS...');
  const requiredComponents = [
    { name: 'Avatar', path: path.join(__dirname, 'src', 'components', 'ui', 'avatar.tsx') },
    { name: 'Separator', path: path.join(__dirname, 'src', 'components', 'ui', 'separator.tsx') },
    { name: 'Progress', path: path.join(__dirname, 'src', 'components', 'ui', 'progress.tsx') }
  ];
  
  for (const component of requiredComponents) {
    if (fs.existsSync(component.path)) {
      console.log(`✅ ${component.name} component exists`);
    } else {
      console.log(`❌ ${component.name} component is missing at: ${component.path}`);
    }
  }
  
  console.log('\n🔍 CHECKING FOR IMPORT ERRORS...');
  // Check if the employee detail page imports components that don't exist
  if (fs.existsSync(employeeDetailPage)) {
    const content = fs.readFileSync(employeeDetailPage, 'utf8');
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import '));
    
    for (const line of importLines) {
      console.log(`   ${line.trim()}`);
      
      // Check for imports from @/components/ui
      if (line.includes('@/components/ui/')) {
        const match = line.match(/@\/components\/ui\/([a-zA-Z]+)/);
        if (match) {
          const componentName = match[1];
          const componentPath = path.join(__dirname, 'src', 'components', 'ui', `${componentName}.tsx`);
          
          if (!fs.existsSync(componentPath)) {
            console.log(`   ❌ Imports non-existent component: ${componentName} from ${componentPath}`);
          }
        }
      }
    }
  }
  
  console.log('\n🔍 FINAL RECOMMENDATIONS:');
  console.log('1. Check browser console for specific error messages');
  console.log('2. Verify all UI components exist and are properly exported');
  console.log('3. Add null checks for all object properties');
  console.log('4. Use optional chaining (?.) for accessing nested properties');
  console.log('5. Consider reverting to a known working version if issues persist');
}

checkFiles();

