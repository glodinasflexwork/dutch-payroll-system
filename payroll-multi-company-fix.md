# Multi-Company Trial Access Issue Analysis

## 🚨 Problem Identified

The payroll calculation is failing with "Access Required" error due to a multi-company trial validation issue.

### Root Cause
- **Session Company ID**: `cmdc3brge0003o4f9rzjiodzm` (doesn't exist in database)
- **User's Actual Companies**: 4 companies with active trials
- **Trial API Logic**: Only checks the session companyId, ignores other companies

### Investigation Results

**User**: `cihatkaya@glodinas.nl`
**Session companyId**: `cmdc3brge0003o4f9rzjiodzm` ❌ (non-existent)
**User's companyId field**: `cmdebowu10000o4lmq3wm34wn` ✅ (Tech Solutions B.V.)

**Companies with Active Trials**:
1. Glodinas Finance B.V. (ID: cmdbgs8ip0000lb0aqs85o8g1) - Owner role
2. Tech Solutions B.V. (ID: cmdebowu10000o4lmq3wm34wn) - Owner role  
3. Marketing Plus (ID: cmdebozmu0003o4lmwcfvc2e8) - Admin role
4. Consulting Group (ID: cmdebp0qt0006o4lmftdhcq03) - HR Manager role

## 🔧 Planned Fix

### Option 1: Smart Company Resolution (Recommended)
Modify `/api/trial/status` to:
1. Check if session companyId exists and has active trial
2. If not, fall back to user's primary companyId
3. If still not found, find any company user has access to with active trial
4. Update session to point to the resolved company

### Option 2: Company Context API
Create a new API endpoint to handle company switching and update session accordingly.

### Option 3: Frontend Company Selection
Modify the frontend to explicitly pass the current company context to trial validation.

## 🎯 Implementation Plan

1. **Fix trial status API** with smart company resolution
2. **Update session management** to handle multi-company scenarios
3. **Add fallback logic** for missing/invalid company references
4. **Test with multiple companies** to ensure proper trial validation

## 📊 Expected Outcome

- Payroll calculations work regardless of which company user is viewing
- Trial validation correctly identifies active trials across all user companies
- Session automatically resolves to a valid company with trial access
- No more "Access Required" errors for users with valid trials

