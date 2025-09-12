# JWT Token Refresh Production Fix

## Problem Description

After a user creates a company in the Dutch payroll system, the NextAuth JWT token contains stale information (`hasCompany: false`) even though the company exists in the database. This causes the middleware to redirect users to the company setup page instead of allowing access to the dashboard, creating a redirect loop.

## Root Cause

NextAuth JWT tokens are stateless and contain user information that was valid at the time of token creation. When a user creates a company, the JWT token is not automatically updated with the new company information, leading to a mismatch between the token data and the actual database state.

## Solution Overview

The production fix implements an automatic JWT token refresh mechanism that signs the user out and back in after successful company creation. This forces NextAuth to regenerate the JWT token with fresh data from the database.

## Implementation Details

### 1. Modified Company Setup Page (`/src/app/setup/company/page.tsx`)

The company setup page now includes an automatic JWT refresh mechanism:

```typescript
// After successful company creation
if (response.ok) {
  // Store credentials for automatic re-login
  const userEmail = session?.user?.email
  const companyId = data.companyId || data.company?.id
  
  // Store redirect information in sessionStorage
  if (companyId) {
    sessionStorage.setItem('post-login-company-id', companyId)
    sessionStorage.setItem('post-login-redirect', 'dashboard')
  }
  
  // Sign out and redirect to re-authentication page
  const { signOut } = await import('next-auth/react')
  const reAuthUrl = new URL('/auth/re-authenticate', window.location.origin)
  reAuthUrl.searchParams.set('email', userEmail)
  reAuthUrl.searchParams.set('reason', 'company-created')
  if (companyId) {
    reAuthUrl.searchParams.set('company-id', companyId)
  }
  
  await signOut({ 
    redirect: true, 
    callbackUrl: reAuthUrl.toString() 
  })
}
```

### 2. Re-Authentication Page (`/src/app/auth/re-authenticate/page.tsx`)

A new page that handles the automatic re-authentication process:

- **Purpose**: Automatically sign users back in after company creation
- **Features**:
  - Detects if user is still signed in and refreshes session
  - Redirects to sign-in if user is signed out
  - Handles redirect to dashboard with company information
  - Provides user feedback during the process
  - Includes debug information in development mode

### 3. Enhanced Sign-In Page (`/src/app/auth/signin/page.tsx`)

Modified to support email pre-filling from the re-authentication flow:

```typescript
// Pre-fill email if provided in URL (from re-authentication flow)
const emailParam = searchParams.get('email')
if (emailParam) {
  setEmail(decodeURIComponent(emailParam))
  setMessage("Please sign in to complete the session refresh.")
}
```

## User Experience Flow

### Successful Automatic Refresh (Ideal Case)
1. User completes company setup form
2. Company is created successfully in database
3. System automatically signs user out
4. User is redirected to re-authentication page
5. System detects user session and refreshes it
6. User is automatically redirected to dashboard with company access

### Manual Sign-In Flow (Fallback)
1. User completes company setup form
2. Company is created successfully in database
3. System attempts automatic refresh but user is fully signed out
4. User is redirected to sign-in page with email pre-filled
5. User enters password and signs in
6. User is redirected to dashboard with fresh JWT token containing company information

## Fallback Mechanisms

The implementation includes multiple fallback mechanisms:

1. **Primary**: Automatic sign-out and re-authentication
2. **Secondary**: Traditional session update method
3. **Tertiary**: Manual redirect with user notification

```typescript
try {
  // Primary: Automatic JWT refresh
  await signOut({ redirect: true, callbackUrl: reAuthUrl.toString() })
} catch (jwtRefreshError) {
  try {
    // Secondary: Traditional session update
    const updateResult = await update()
    // ... redirect logic
  } catch (fallbackError) {
    // Tertiary: Manual notification
    alert('Company created successfully! Please refresh the page or sign out and back in to access your dashboard.')
    window.location.href = '/dashboard'
  }
}
```

## Technical Benefits

1. **Reliable JWT Refresh**: Forces NextAuth to regenerate tokens with fresh database data
2. **Seamless UX**: Automatic process requires no user intervention in most cases
3. **Robust Fallbacks**: Multiple fallback mechanisms ensure users can always access their dashboard
4. **Debug Support**: Comprehensive logging in development mode for troubleshooting
5. **Session Storage**: Preserves redirect information across sign-out/sign-in cycle

## Security Considerations

- No sensitive data is stored in sessionStorage (only company ID and redirect path)
- Email is passed via URL parameters but is already known to the authenticated user
- Sign-out clears all authentication tokens before re-authentication
- Re-authentication uses standard NextAuth flows

## Testing

To test the fix:

1. Create a new user account
2. Complete the company setup process
3. Verify automatic redirect to dashboard without manual intervention
4. Check that the user has proper access to company features

## Monitoring

The fix includes comprehensive logging that can be monitored:

- Company creation success/failure
- JWT refresh attempts and results
- Fallback mechanism usage
- Redirect success/failure

## Future Improvements

1. **Real-time JWT Updates**: Implement a mechanism to update JWT tokens without sign-out
2. **Session Synchronization**: Add real-time session synchronization across browser tabs
3. **Enhanced Error Handling**: More granular error handling for different failure scenarios
4. **Performance Optimization**: Reduce the number of redirects in the happy path

## Files Modified

- `/src/app/setup/company/page.tsx` - Added automatic JWT refresh logic
- `/src/app/auth/re-authenticate/page.tsx` - New re-authentication page
- `/src/app/auth/signin/page.tsx` - Added email pre-fill functionality
- `/src/middleware.ts` - Enhanced with session refresh detection (previous fix)

This production fix ensures that users can seamlessly access their dashboard after company creation without encountering redirect loops or authentication issues.

