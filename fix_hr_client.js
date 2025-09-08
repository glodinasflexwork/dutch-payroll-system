// Fix for HR client connection issue
const fs = require('fs');

const databaseClientsPath = '/home/ubuntu/dutch-payroll-system/src/lib/database-clients.ts';

// Read the current file
let content = fs.readFileSync(databaseClientsPath, 'utf8');

// Replace the HR client function with one that ensures connection
const newHRClientFunction = `/**
 * Get HR Database Client
 * Handles employee records, departments, leave management
 */
export function getHRClient(): HRClient {
  if (!hrClient) {
    hrClient = new HRClient({
      datasources: {
        db: {
          url: process.env.HR_DATABASE_URL
        }
      }
    })
    
    // Ensure connection is established
    hrClient.$connect().catch(console.error)
  }
  return hrClient
}`;

// Replace the existing HR client function
content = content.replace(
  /\/\*\*\s*\n\s*\* Get HR Database Client[\s\S]*?export function getHRClient\(\): HRClient \{[\s\S]*?\n\}/,
  newHRClientFunction
);

// Write the updated content back
fs.writeFileSync(databaseClientsPath, content);

console.log('✅ Fixed HR client connection in database-clients.ts');
