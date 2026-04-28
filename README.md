# SecureSense 

This project has been updated with **Week 5: Vulnerability Remediation & Advanced Security Hardening**. 
The application now implements Anti-CSRF token protection, strict Content Security Policies (CSP) without unsafe-inline, secure APIs with API key and JWT authentication, rate-limiting against brute force attacks, and comprehensive security headers via Helmet.

> **Note:** The application was initially built as an intentionally vulnerable system for educational purposes, but has been fully secured through iterative security improvements (Weeks 1-5).

## Security Measures Implemented (Weeks 1-5)

### 🛡️ Middleware & Security Tasks Overview

- **securityHeaders.js**: Implements HTTP security headers and CSP using Helmet. Includes HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, and removal of X-Powered-By. Strict CSP blocks inline scripts and restricts external resources to trusted CDNs. Frameguard and objectSrc prevent clickjacking and embedded objects. CSP and headers are configured for maximum browser protection.
- **csrfProtection.js**: Provides Anti-CSRF protection using `csurf` with secure, httpOnly cookies. All forms include hidden CSRF tokens, and tokens are validated per session.
- **rateLimiter.js**: Express rate limiting for both general API (100 requests/15min/IP) and login endpoint (5 attempts/15min/IP) to prevent brute-force attacks.
- **apiKeyAuth.js**: Validates API keys via `X-API-Key` header for secure API access.
- **jwtAuth.js**: Verifies JWT tokens for stateless authentication and API protection.
- **rbac.js**: Role-Based Access Control (RBAC) middleware enforces Zero Trust and Least Privilege. Users are only allowed access to endpoints permitted by their role, regardless of location.
- **corsConfig.js**: Restricts CORS to whitelisted origins, allowed methods, and headers.
- **Input Validation**: All user input is validated and sanitized (e.g., email format, payload size) using the validator library and built-in checks.
- **Error Handling**: Generic error messages are sent to users; detailed logs are written to `security.log` using Winston.
- **Phishing Simulation**: Social engineering awareness and reporting protocol documented in `docs/phishing_simulation.md`.

### ✅ Authentication & Authorization (Zero Trust)
- **Password Hashing**: Bcrypt with 10 salt rounds (no plain text storage)
- **JWT Token-Based Auth**: Token generation and validation for API access
- **API Key Authentication**: Secure API key validation via `X-API-Key` header
- **Session Security**: httpOnly cookies with `sameSite: strict` and secure flag for production
- **Role-Based Access Control (RBAC)**: Zero Trust implementation via `role` field in the database and `requireRole` middleware. Users are granted 'Least Privilege' access—meaning a standard user cannot access administrative endpoints regardless of their location.

### ✅ Anti-CSRF Protection (Week 5)
- **CSRF Tokens**: csurf middleware generates and validates tokens on all form submissions
- **Token Integration**: Hidden CSRF token fields in register/login forms
- **Session-Based**: Tokens tied to user sessions for maximum security

### ✅ Content Security Policy (CSP)
- **Strict CSP Directives**: Default to 'self' for most resources
- **Script Protection**: Scripts only from same origin and whitelisted CDNs (removed `unsafe-inline`)
- **Form Submission**: Only to same origin (`formAction: 'self'`)
- **Clickjacking Prevention**: `frameAncestors: 'none'` prevents framing

### ✅ Security Headers (via Helmet)
- **HSTS**: Enforces HTTPS (1 year max-age, includeSubDomains, preload)
- **X-Content-Type-Options**: Prevents MIME sniffing (`nosniff`)
- **X-Frame-Options**: Prevents clickjacking (`deny`)
- **X-XSS-Protection**: Legacy XSS filter support
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **X-Powered-By**: Removed to hide server technology (Express.js)
- **Code-Level WAF**: Helmet acts as a "Code-Level WAF" to filter malicious headers. To satisfy the WAF requirement, security policies act as a barrier against the OWASP Top 10 by utilizing specialized middleware, the application automatically drops requests containing known malicious patterns before they reach the logic layer.

### ✅ Phishing Awareness (Social Engineering Simulation)
- I simulated a phishing attack by designing a 'Credential Harvesting' email. I documented how employees should identify red flags (e.g., mismatched URLs, urgent tone) and established a reporting protocol for suspicious communications in `docs/phishing_simulation.md`.

### ✅ Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Login Endpoint**: 5 attempts per 15 minutes (brute-force protection)

### ✅ Input Validation & Sanitization
- **Email Validation**: Using validator library for email format verification
- **Payload Limits**: 10KB max for JSON/URL-encoded requests
- **SQL Injection Prevention**: Sequelize ORM with parameterized queries

### ✅ Error Handling
- **Generic User Messages**: No stack traces or sensitive details exposed to clients
- **Security Logging**: Winston logger records all authentication events and errors

### ✅ CORS Protection
- **Whitelisted Origins**: Only trusted domains allowed
- **Restricted Methods**: Limited to GET, POST, PUT, DELETE, PATCH
- **Allowed Headers**: Content-Type, Authorization, X-API-Key only

---

## Previously Fixed Vulnerabilities (Now Secured)

The following vulnerabilities were part of the initial intentional design but have been **FIXED**:

1.  **Weak Authentication** ✅ FIXED
    - Passwords are now hashed with bcrypt (10 rounds)
    - Plain text storage has been eliminated
    
2.  **Input Handling** ✅ FIXED
    - Email validation implemented via validator library
    - Input is now properly validated before processing
    
3.  **Cross-Site Scripting (XSS)** ✅ FIXED
    - Strict CSP prevents inline script execution
    - EJS template escaping protects against XSS
    
4.  **SQL Injection** ✅ FIXED
    - Sequelize ORM with parameterized queries
    - No raw SQL string concatenation
    
5.  **Security Misconfiguration** ✅ FIXED
    - Helmet middleware provides comprehensive security headers
    - CSRF protection via csurf middleware
    - Secure session settings (httpOnly, sameSite, secure)
    
6.  **Poor Error Handling** ✅ FIXED
    - Generic error messages sent to clients
    - Detailed errors logged to security.log only

## Project Structure

*   **`app.js`**: Main entry point with Express setup, middleware configuration, and route mounting
*   **`config/database.js`**: SQLite database connection configuration
*   **`models/User.js`**: User database schema with hashed password storage
*   **`routes/`**: 
    - `authRoutes.js` - Authentication routes with CSRF protection
    - `api.js` - Secure API routes with JWT and API key authentication
*   **`controllers/`**:
    - `authController.js` - Login/Register logic with input validation and bcrypt
    - `pageController.js` - Public page rendering
*   **`middleware/`**:
    - `securityHeaders.js` - Helmet CSP, HSTS, and security header configuration
    - `corsConfig.js` - CORS policy with whitelisted origins
    - `rateLimiter.js` - Express rate-limit configuration
    - `jwtAuth.js` - JWT token verification middleware
    - `apiKeyAuth.js` - API key validation middleware
    - `csrfProtection.js` - CSRF token generation and validation (Week 5)
*   **`views/`**: EJS templates for user interface with CSRF tokens in forms
*   **`public/css/`**: Styling (no inline styles to maintain CSP compliance)

## Security Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| **helmet** | ^8.1.0 | Security headers (CSP, HSTS, X-Frame-Options, etc.) |
| **bcrypt** | ^6.0.0 | Password hashing with salt rounds |
| **jsonwebtoken** | ^9.0.3 | JWT token generation and validation |
| **express-rate-limit** | ^8.4.1 | Rate limiting for brute-force protection |
| **cors** | ^2.8.6 | CORS policy enforcement |
| **csurf** | ^1.11.0 | CSRF token middleware (Week 5) |
| **cookie-parser** | ^1.4.6 | Cookie parsing for CSRF tokens (Week 5) |
| **validator** | ^13.15.35 | Input validation (email, etc.) |
| **winston** | ^3.19.0 | Security event logging |
| **express-session** | ^1.19.0 | Secure session management |
| **sequelize** | ^6.37.8 | ORM with parameterized queries (SQL injection prevention) |

## Security Best Practices Implemented

- ✅ **Defense in Depth**: Multiple layers of security (validation, authentication, headers, rate limiting)
- ✅ **Zero Trust Architecture**: Every API request is validated via JWT (`requireRole` middleware).
- ✅ **Least Privilege**: Users default to 'user' roles; API keys and JWT tokens provide granular access control.
- ✅ **Code-Level WAF**: Helmet filters malicious requests.
- ✅ **Secure by Default**: HTTPS enforced (HSTS), httpOnly cookies, secure session flags
- ✅ **Input Validation**: All user inputs validated before processing
- ✅ **Parameterized Queries**: Sequelize ORM prevents SQL injection
- ✅ **Security Logging**: All authentication events logged to security.log
- ✅ **Error Handling**: Generic error messages to users, detailed logs for admins

## Environment Variables

Create a `.env` file with the following:

```
# Server
NODE_ENV=development
PORT=3000

# Database (optional, defaults to SQLite)
DB_PATH=./database.sqlite

# Security
SESSION_SECRET=your-session-secret-key
JWT_SECRET=your-jwt-secret-key
VALID_API_KEYS=api-key-1,api-key-2

# Logging
LOG_FILE=security.log
```

## How to Run Locally

1.  Ensure you have Node.js (v18+) installed.
2.  Navigate to the project folder in your terminal.
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Configure environment variables (create a `.env` file):
    ```
    NODE_ENV=development
    SESSION_SECRET=your-secret-key-here
    JWT_SECRET=your-jwt-secret-here
    VALID_API_KEYS=key1,key2,key3
    PORT=3000
    ```
5.  Start the application:
    ```bash
    node app.js
    ```
6.  Open your browser and navigate to `http://localhost:3000`.

## Security Testing

The application is now **fully secured** against the original vulnerabilities. To verify security measures:

### Testing CSRF Protection
- Try submitting a form without a valid CSRF token - requests will be rejected
- CSRF tokens are generated per session and validated on every form submission

### Testing CSP Compliance
- Check browser console (DevTools) - no CSP violations should occur
- Inline scripts are blocked by strict CSP policy
- Only whitelisted external scripts can execute

### Testing Security Headers
- Inspect HTTP response headers in your browser:
  - `Strict-Transport-Security` (HSTS)
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: deny`
  - `Content-Security-Policy` (with no unsafe-inline)
  - Note: `X-Powered-By` header is **removed** to hide server technology

### Testing Rate Limiting
- Attempt login more than 5 times in 15 minutes - requests will be rate-limited
- General API endpoints limited to 100 requests per 15 minutes

### Testing Password Security
- All passwords are hashed with bcrypt - check `database.sqlite` to verify
- Database stores only hashed passwords, never plain text

### Testing Input Validation
- Try registering with invalid email - validation will reject it
- Payloads larger than 10KB will be rejected
