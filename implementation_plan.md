# Implementation Plan: Employee Invitation System, Authentication & HR Database Integration

## 1. Research and Design Employee Invitation System

### 1.1 Overview of Employee Invitation Systems

Employee invitation systems are crucial for securely onboarding new users into a platform, especially in multi-tenant applications like a payroll system where employers manage their own set of employees. The core idea is to allow an authorized user (in this case, an employer or HR manager) to initiate the creation of an account for another user (an employee) without directly handling their sensitive credentials. Instead, the system generates a unique, time-limited invitation link that is sent to the employee's email address. Upon clicking this link, the employee is guided through a process to set up their own password and complete their account registration, thereby linking their new user account to their pre-existing employee record.

This approach offers several benefits:

*   **Security**: It avoids the need for employers to manage or transmit employee passwords, reducing the risk of credential compromise. Employees create their own secure passwords.
*   **User Experience**: It provides a streamlined and intuitive onboarding flow for employees, guiding them directly to the necessary registration steps.
*   **Scalability**: It can easily accommodate a large number of employees being invited by various employers without manual intervention from the system administrators.
*   **Auditability**: Each invitation can be tracked, including who sent it, when it was sent, and its status (pending, accepted, expired).

Common components of an employee invitation system typically include:

*   **Invitation Generation**: A mechanism to create a unique, cryptographically secure token for each invitation. This token is usually stored in the database along with its expiration time and the associated employee's details.
*   **Email Service Integration**: The ability to send an email containing the invitation link to the employee. This requires integration with an email sending service (like Mailtrap, as configured in the `.env` file).
*   **Invitation Landing Page**: A web page where the invited employee lands after clicking the invitation link. This page validates the token and prompts the employee to set their password and complete any remaining registration details.
*   **Account Linking Logic**: Backend logic to associate the newly created user account (in the authentication database) with the existing employee record (in the HR database).
*   **Invitation Management**: Features for employers to view the status of sent invitations, resend invitations, or revoke them if necessary.

### 1.2 Proposed Invitation Flow for SalarySync

Given the current architecture of SalarySync, where employee records are created in the HR database (`hr.prisma`) and user authentication is handled by a separate authentication database (`auth.prisma`), the following invitation flow is proposed:

1.  **Employer Initiates Invitation**: When an employer or HR manager uses the "Add Employee" form (or a new "Invite Employee" button) in the dashboard, they will provide the employee's details, including their email address.
2.  **Employee Record Creation/Update**: The system will first create or update the employee record in the HR database, as it currently does. This record will contain all the necessary HR-related information for the employee.
3.  **Invitation Token Generation**: After successfully creating/updating the HR employee record, the system will generate a unique, single-use invitation token. This token will be stored in the `auth.prisma` database, associated with the employee's email address and potentially a reference to their HR employee ID.
4.  **Invitation Email Dispatch**: An email containing a link with this unique token will be sent to the employee's email address (e.g., `https://salarysync.com/invite?token=<unique_token>`). The email will instruct the employee to click the link to set up their account.
5.  **Employee Account Setup**: When the employee clicks the link, they will be directed to a dedicated page (e.g., `/auth/invite`). This page will:
    *   Validate the invitation token (check for validity, expiration, and if it has already been used).
    *   If valid, prompt the employee to set a password for their new SalarySync account.
    *   Create a new user entry in the `auth.prisma` database with the provided email and password, and assign the `employee` role.
    *   Crucially, link this new user account to the corresponding employee record in the HR database. This linking mechanism is a critical component and will be detailed in a later section.
    *   Mark the invitation token as used.
6.  **Redirection to Employee Portal**: Upon successful account setup, the employee will be automatically logged in and redirected to their employee portal dashboard (e.g., `/employee-portal/dashboard`).

### 1.3 Security Considerations for Invitation System

Implementing a secure invitation system requires careful attention to several aspects:

*   **Token Uniqueness and Randomness**: Invitation tokens must be sufficiently long, random, and unique to prevent brute-force attacks or guessing. Cryptographically secure random number generators should be used.
*   **Token Expiration**: Invitation tokens should have a limited lifespan (e.g., 24-48 hours). Expired tokens should no longer be valid for account registration.
*   **Single-Use Tokens**: Each token should be valid for only one account registration attempt. Once used, it should be invalidated immediately.
*   **HTTPS Enforcement**: All communication involving invitation links and account setup should occur over HTTPS to protect the integrity and confidentiality of the data.
*   **Rate Limiting**: Implement rate limiting on the invitation sending and token validation endpoints to prevent abuse and denial-of-service attacks.
*   **Input Validation**: Strictly validate all user inputs during the account setup process to prevent injection attacks and ensure data integrity.
*   **Email Verification**: While the invitation process itself acts as a form of email verification, consider adding an additional step for employees to re-verify their email after account creation, especially if the initial invitation email is compromised.
*   **Audit Logging**: Log all significant events related to invitations (generation, sending, acceptance, expiration, errors) for security auditing and troubleshooting.
*   **Employer Oversight**: Provide employers with a way to view the status of invitations they have sent (e.g., pending, accepted, expired) and the ability to resend or revoke invitations.

### 1.4 Technical Design for Invitation Token Management

To support the proposed invitation flow, a new model, `InvitationToken`, will be added to `auth.prisma`:

```prisma
model InvitationToken {
  id        String   @id @default(cuid())
  token     String   @unique
  email     String
  employeeId String?  // Optional: Link to HR employee record if created first
  companyId String   // Link to the company that issued the invitation
  expiresAt DateTime
  usedAt    DateTime? // Timestamp when the token was used
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([token])
  @@index([email])
  @@index([companyId])
}
```

**Rationale for fields:**

*   `id`: Unique identifier for the invitation record.
*   `token`: The unique, cryptographically secure string sent in the invitation link. It must be unique to prevent collisions.
*   `email`: The email address to which the invitation is sent. This is crucial for identifying the recipient.
*   `employeeId`: An optional field to link to the HR employee record. This is particularly useful if the HR employee record is created *before* the invitation is sent, allowing for a direct association. This field would reference the `id` from the `Employee` model in `hr.prisma`.
*   `companyId`: The ID of the company that the employee is being invited to join. This ensures that invitations are scoped to the correct organization.
*   `expiresAt`: The timestamp when the invitation token becomes invalid. This enforces time-limited access.
*   `usedAt`: A timestamp to record when the token was successfully used. This ensures single-use and provides an audit trail.
*   `createdAt`, `updatedAt`: Standard timestamps for record management.

**Invitation Generation Logic (Backend - e.g., in `src/app/api/employees/route.ts` or a new invitation API):**

1.  When an employer creates a new employee record, after successful creation in `hrClient.employee`:
2.  Generate a secure, random `token` string.
3.  Calculate `expiresAt` (e.g., `now() + 48 hours`).
4.  Create a new `InvitationToken` record in `authClient.invitationToken.create()` with the generated `token`, employee's `email`, `employeeId` (from the newly created HR record), `companyId`, and `expiresAt`.
5.  Construct the invitation URL: `https://<your-domain>/auth/invite?token=<generated_token>`.
6.  Send an email to the employee's email address containing this URL.

**Invitation Validation and Account Setup Logic (Frontend/Backend - e.g., in `src/app/auth/invite/route.ts` or a dedicated page component):**

1.  When an employee accesses the `/auth/invite?token=<token>` URL:
2.  Extract the `token` from the URL.
3.  Query `authClient.invitationToken.findUnique()` to find the `InvitationToken` record using the `token`.
4.  Validate the token:
    *   Check if the token exists.
    *   Check if `expiresAt` is in the future.
    *   Check if `usedAt` is `null` (i.e., not yet used).
5.  If valid, present a form for the employee to set their password.
6.  Upon form submission:
    *   Create a new `User` record in `authClient.user.create()` with the employee's email, the new password (hashed), and the `employee` role.
    *   Update the `InvitationToken` record by setting `usedAt = now()`.
    *   If `employeeId` is present in the `InvitationToken`, ensure the newly created `User` is linked to this `employeeId` (this will be covered in the linking mechanism section).
7.  Redirect the employee to the employee portal dashboard.

This design provides a robust and secure foundation for the employee invitation system. The next phases will detail the integration with the existing employee portal and the crucial linking between the authentication and HR databases.



## 2. Plan Employee Portal Integration with Authentication Database

Integrating the existing mock-up employee portal with the real authentication database involves several key steps to ensure secure and seamless user access. The primary goal is to replace any mock authentication mechanisms with a robust system that leverages the `auth.prisma` database for user verification and session management.

### 2.1 Current State of Employee Portal Authentication (Assumed Mock-up)

Based on the initial assessment, the employee portal currently operates with a mock-up or placeholder authentication. This means it likely uses hardcoded values, local storage, or a simplified in-memory system for user sessions. The `employee-portal` API endpoints, as observed, expect an `employeeId` parameter, which implies that access control might currently be based on this ID rather than a fully authenticated user session.

### 2.2 Proposed Authentication Flow for Employee Portal

To integrate with the real authentication database, the employee portal will adopt a standard token-based authentication flow, likely leveraging JSON Web Tokens (JWTs) or similar session management techniques. The flow will be as follows:

1.  **Login**: When an employee successfully logs in (after setting up their account via the invitation link or through a direct login page), the authentication service will:
    *   Verify their credentials against the `User` model in `auth.prisma`.
    *   Generate a secure authentication token (e.g., JWT) containing relevant user information (e.g., `userId`, `email`, `role`, `companyId`, and crucially, the associated `employeeId` from the HR database).
    *   Send this token back to the client (employee portal frontend).
2.  **Client-Side Storage**: The employee portal frontend will securely store this token (e.g., in HTTP-only cookies or local storage, depending on security requirements and framework capabilities).
3.  **API Requests**: For every subsequent request to employee portal API endpoints (e.g., `/api/employee-portal`, `/api/employee-portal/contracts`), the frontend will include this authentication token in the request headers (e.g., `Authorization: Bearer <token>`).
4.  **Backend Validation**: The employee portal API endpoints will implement middleware or a validation function (similar to `validateAuth` used for employer APIs) to:
    *   Extract the token from the request.
    *   Verify the token's authenticity and integrity (e.g., check signature, expiration).
    *   Extract the user information (including `userId`, `companyId`, and `employeeId`) from the token.
    *   Use this extracted `employeeId` to fetch and return data specific to that employee from the HR database.
    *   Ensure the user has the `employee` role and is authorized to access the requested resource.

### 2.3 Required Changes to Employee Portal Frontend

*   **Login Page**: The existing login page (or the invitation setup page) will need to be updated to interact with the new authentication API endpoint. Upon successful login, it will receive and store the authentication token.
*   **API Call Interception**: Implement an interceptor or similar mechanism to automatically attach the authentication token to all outgoing API requests to the employee portal backend.
*   **Session Management**: Handle token expiration, renewal, and logout procedures. When a token expires, the user should be prompted to re-authenticate. Logout should clear the stored token.
*   **Conditional Rendering**: The frontend should conditionally render content based on the authenticated user's `role` and `employeeId`, ensuring that employees only see their own relevant data.

### 2.4 Required Changes to Employee Portal Backend (API Endpoints)

*   **Authentication Middleware**: Implement a robust authentication middleware or utility function that can be applied to all employee portal API routes. This function will be responsible for:
    *   Parsing and validating the incoming authentication token.
    *   Extracting the `userId`, `companyId`, and `employeeId` from the token.
    *   Attaching this context to the request object for downstream use by the API logic.
    *   Returning an unauthorized error if the token is invalid or missing.
*   **Data Filtering**: Modify existing employee portal API logic to filter data based on the `employeeId` extracted from the authenticated token. For example, when an employee requests their contracts, the API should only return contracts associated with *their* `employeeId` and `companyId`.
*   **Role-Based Access Control (RBAC)**: Ensure that only users with the `employee` role can access employee-specific endpoints. This can be part of the authentication middleware.

### 2.5 Technology Stack Considerations

Given that the project uses Next.js, `next-auth` is a strong candidate for handling authentication. `next-auth` provides a comprehensive solution for authentication, including:

*   **Providers**: Support for various authentication strategies (credentials, OAuth, etc.).
*   **Session Management**: Built-in session management, including JWT support.
*   **API Routes**: Easy integration with Next.js API routes for handling authentication callbacks and session management.
*   **Client-Side Hooks**: Hooks for managing session state on the frontend.

Using `next-auth` would simplify much of the token generation, validation, and session management logic, allowing developers to focus on the core business logic of the employee portal. The `auth.prisma` database would serve as the backend for `next-auth`'s credential provider.

This integration will transform the mock-up employee portal into a secure, production-ready application that leverages the centralized authentication system.



## 3. Design Linking Mechanism Between Auth and HR Databases

The core challenge in integrating the authentication and HR databases lies in establishing a robust and reliable link between a `User` record in `auth.prisma` and an `Employee` record in `hr.prisma`. This link is essential for several reasons:

*   **Access Control**: To ensure that an authenticated user (from the `auth` database) can only access their own corresponding employee data (from the `HR` database).
*   **Data Consistency**: To maintain a single source of truth for employee-related information, avoiding duplication and potential inconsistencies.
*   **Streamlined Data Retrieval**: To enable efficient fetching of employee-specific data for the employee portal once a user is authenticated.

### 3.1 Identifying the Linking Key

The most logical and secure linking key between the `User` and `Employee` models is the **email address**. Both models already contain an `email` field, and email addresses are typically unique identifiers for individuals. However, relying solely on email can be problematic if an email address changes or if there are cases of multiple employees sharing the same email (though less common in a professional setting).

A more robust approach involves using a unique identifier that is stable and immutable. The `id` field of the `Employee` model in `hr.prisma` is a perfect candidate for this. This `id` is a unique string generated by Prisma and remains constant for the lifetime of the employee record.

Therefore, the proposed linking mechanism will primarily use the `Employee.id` from the HR database, stored within the `User` model in the authentication database.

### 3.2 Proposed Database Schema Modifications

To facilitate this linking, a new field will be added to the `User` model in `auth.prisma`:

**`auth.prisma` (Modified `User` model):**

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // Hashed password
  role          String    @default("user") // e.g., "admin", "hr", "manager", "employee"
  companyId     String?   // Link to the company the user belongs to
  employeeId    String?   @unique // NEW FIELD: Link to the corresponding Employee record in HR DB
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]

  @@index([email])
  @@index([companyId])
  @@index([employeeId]) // Add index for efficient lookups
}
```

**Rationale for `employeeId` field:**

*   **Direct Link**: Provides a direct, explicit link from the `User` account to their specific `Employee` record.
*   **Uniqueness**: The `@unique` constraint on `employeeId` ensures that one `Employee` record can only be linked to one `User` account, preventing multiple user accounts for a single employee.
*   **Data Retrieval**: When a user logs in, their `employeeId` can be easily retrieved from their `User` record, allowing the system to fetch their specific HR data.
*   **Access Control**: This `employeeId` can be included in the authentication token (JWT) to enforce granular access control, ensuring that an employee can only view or modify their own data.

### 3.3 Linking Process During Account Creation (Invitation Flow)

The `employeeId` linking will primarily occur during the employee account creation process, specifically when an invited employee sets up their account:

1.  **Invitation Token Generation**: As designed in Section 1.4, the `InvitationToken` model will store the `employeeId` (from the HR database) when the invitation is generated by the employer.
2.  **Employee Account Setup**: When the employee clicks the invitation link and completes the account setup form:
    *   The system will retrieve the `InvitationToken` using the provided token.
    *   It will extract the `employeeId` from this `InvitationToken`.
    *   When creating the new `User` record in `auth.prisma`, this `employeeId` will be populated in the `User.employeeId` field.
    *   The `User.companyId` should also be populated from the `InvitationToken.companyId` to ensure the user is correctly associated with the company.

### 3.4 Handling Existing Employees and Edge Cases

*   **Existing Employees (if any)**: If there are existing employee records in the HR database without corresponding user accounts, a one-time migration or a manual process might be needed to create `User` accounts for them and establish the `employeeId` link. This would involve sending invitations to these employees.
*   **Employee Email Changes**: If an employee's email address changes in the HR system, it should ideally be updated in the `User` record in the authentication database as well to maintain consistency. This would require a mechanism to propagate email changes between the two databases.
*   **Employee Deactivation/Deletion**: When an employee is deactivated or deleted in the HR system, their corresponding user account in the authentication database should also be handled appropriately (e.g., deactivated, soft-deleted, or hard-deleted) to prevent unauthorized access.
*   **Multiple Companies**: The `User.companyId` field, combined with the `UserCompany` model (if fully utilized), allows for a user to potentially be associated with multiple companies and have different roles. For the employee portal, the focus will be on the primary `companyId` associated with their `employeeId`.

By implementing this explicit `employeeId` link in the `User` model, SalarySync can effectively manage employee access to the portal, ensuring data security and a clear relationship between an authenticated user and their HR record.

