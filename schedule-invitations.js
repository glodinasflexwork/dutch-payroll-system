/**
 * Invitation Scheduler
 * 
 * This script sets up a scheduled task to automatically send invitations
 * to employees who need access to the portal.
 * 
 * It uses node-cron to schedule the task to run at specified intervals.
 */

const cron = require('node-cron');
const { sendInvitations, CONFIG } = require('./auto-invite-employees');
const fs = require('fs');
const path = require('path');

// Configuration for the scheduler
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

// Parse command line arguments
const args = process.argv.slice(2);
if (args.includes('--dry-run')) {
  SCHEDULER_CONFIG.dryRun = true;
  CONFIG.dryRun = true;
  console.log('Running in dry run mode - no emails will be sent');
}

if (args.includes('--run-now')) {
  SCHEDULER_CONFIG.runOnStartup = true;
}

// Function to ensure log directory exists
function ensureLogDirectoryExists() {
  const logDir = path.dirname(SCHEDULER_CONFIG.logFilePath);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

// Function to load scheduler logs
function loadSchedulerLogs() {
  ensureLogDirectoryExists();
  
  if (!fs.existsSync(SCHEDULER_CONFIG.logFilePath)) {
    return { runs: [] };
  }
  
  try {
    const logData = fs.readFileSync(SCHEDULER_CONFIG.logFilePath, 'utf8');
    return JSON.parse(logData);
  } catch (error) {
    console.error('Error loading scheduler logs:', error);
    return { runs: [] };
  }
}

// Function to save scheduler logs
function saveSchedulerLogs(logs) {
  ensureLogDirectoryExists();
  
  try {
    fs.writeFileSync(SCHEDULER_CONFIG.logFilePath, JSON.stringify(logs, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving scheduler logs:', error);
  }
}

// Function to run the invitation process and log results
async function runInvitationProcess() {
  console.log(`\n[${new Date().toISOString()}] Running scheduled invitation process...`);
  
  try {
    // Load scheduler logs
    const logs = loadSchedulerLogs();
    
    // Run the invitation process
    const result = await sendInvitations();
    
    // Log the run
    const runLog = {
      timestamp: new Date(),
      success: true,
      total: result.total,
      successful: result.successful,
      failed: result.failed
    };
    
    logs.runs.push(runLog);
    saveSchedulerLogs(logs);
    
    console.log(`[${new Date().toISOString()}] Scheduled invitation process completed successfully`);
    console.log(`- Total processed: ${result.total}`);
    console.log(`- Successful: ${result.successful}`);
    console.log(`- Failed: ${result.failed}`);
    
    return result;
  } catch (error) {
    // Log the error
    const logs = loadSchedulerLogs();
    
    const runLog = {
      timestamp: new Date(),
      success: false,
      error: error.message
    };
    
    logs.runs.push(runLog);
    saveSchedulerLogs(logs);
    
    console.error(`[${new Date().toISOString()}] Scheduled invitation process failed:`, error);
    return { error: error.message };
  }
}

// Main function to start the scheduler
function startScheduler() {
  console.log(`Starting invitation scheduler with schedule: ${SCHEDULER_CONFIG.cronSchedule}`);
  console.log(`Dry run mode: ${SCHEDULER_CONFIG.dryRun ? 'Enabled' : 'Disabled'}`);
  
  // Schedule the task
  cron.schedule(SCHEDULER_CONFIG.cronSchedule, runInvitationProcess);
  
  console.log('Invitation scheduler started successfully');
  console.log(`Next scheduled run: ${getNextRunTime(SCHEDULER_CONFIG.cronSchedule)}`);
  
  // Run immediately if configured
  if (SCHEDULER_CONFIG.runOnStartup) {
    console.log('Running invitation process immediately...');
    runInvitationProcess();
  }
}

// Function to calculate the next run time
function getNextRunTime(cronExpression) {
  const cronParts = cronExpression.split(' ');
  
  // Simple case for daily runs
  if (cronParts[2] === '*' && cronParts[3] === '*' && cronParts[4] === '*') {
    const now = new Date();
    const nextRun = new Date();
    
    nextRun.setHours(parseInt(cronParts[1], 10));
    nextRun.setMinutes(parseInt(cronParts[0], 10));
    nextRun.setSeconds(0);
    
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    
    return nextRun.toLocaleString();
  }
  
  return 'Based on cron schedule: ' + cronExpression;
}

// Start the scheduler if running as a script
if (require.main === module) {
  startScheduler();
} else {
  // Export for use as a module
  module.exports = {
    startScheduler,
    runInvitationProcess,
    SCHEDULER_CONFIG
  };
}

