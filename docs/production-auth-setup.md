# Production Authentication Setup

This guide explains how to properly configure authentication for production environments with cross-subdomain cookie support.

## Architecture

- Frontend: `boilerplate.lumineau.app`
- Backend: `api.boilerplate.lumineau.app`
- Cookie Domain: `.lumineau.app` (allows sharing between subdomains)

## Backend Configuration

### Environment Variables (Backend)

```env
# apps/backend/.env.production
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Better Auth
BETTER_AUTH_SECRET=your-32-character-secret-key-here
BETTER_AUTH_BASE_URL=https://api.boilerplate.lumineau.app

# Frontend URL for auth redirects and CORS
NEXT_PUBLIC_APP_URL=https://boilerplate.lumineau.app
NEXT_PUBLIC_API_URL=https://api.boilerplate.lumineau.app

# Social Providers (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### CORS Configuration

The backend middleware is already configured to handle CORS properly:
- Allows credentials (cookies)
- Accepts requests from the frontend domain
- Handles preflight requests

## Frontend Configuration

### Environment Variables (Frontend)

```env
# apps/frontend/.env.production
NEXT_PUBLIC_APP_URL=https://boilerplate.lumineau.app
NEXT_PUBLIC_API_URL=https://api.boilerplate.lumineau.app
```

### API Client Configuration

The frontend auth client is configured to send credentials with all requests:

```typescript
// apps/frontend/lib/auth-client.ts
export const authClient = createAuthClient({
  baseURL: apiUrl,
  fetchOptions: {
    credentials: 'include', // This ensures cookies are sent
  },
});
```

## Cookie Configuration Details

### Production Cookie Settings

```typescript
cookieOptions: {
  httpOnly: true,         // Prevents JavaScript access
  sameSite: "none",       // Required for cross-subdomain
  secure: true,           // Required for HTTPS
  path: "/",              // Available on all paths
  domain: ".lumineau.app" // Shared across subdomains
}
```

### Key Points

1. **Domain Setting**: The cookie domain is set to `.lumineau.app` which allows the cookie to be shared between:
   - `boilerplate.lumineau.app`
   - `api.boilerplate.lumineau.app`
   - Any other subdomain of `lumineau.app`

2. **SameSite=None**: Required for cross-subdomain cookies in modern browsers
   - Must be used with `Secure` flag
   - Requires HTTPS in production

3. **Secure Flag**: Cookies will only be sent over HTTPS connections

## Debugging Authentication Issues

1. **Check Cookie Presence**:
   - Open browser DevTools → Application → Cookies
   - Look for `better-auth.session_token` on both domains

2. **Use Debug Page**:
   - Navigate to `/debug` on your frontend
   - This will show:
     - Current session status
     - Browser cookies
     - Backend session validation
     - Environment configuration

3. **Common Issues**:

   **Issue**: Cookie not being set
   - Check: Is the backend URL using HTTPS?
   - Check: Is the cookie domain correctly set to `.lumineau.app`?
   - Check: Are there any browser console errors?

   **Issue**: Cookie set but not sent to backend
   - Check: Is `credentials: 'include'` set in fetch options?
   - Check: Is CORS properly configured on the backend?
   - Check: Is the cookie domain matching both frontend and backend?

   **Issue**: Session exists but user can't access protected pages
   - Check: Is the middleware correctly reading the session?
   - Check: Is the session validation working on the backend?
   - Check: Are there any network errors in the console?

## Vercel Deployment Settings

### Backend (api.boilerplate.lumineau.app)

1. Set all environment variables listed above
2. Ensure the build output includes the middleware
3. Set custom domain to `api.boilerplate.lumineau.app`

### Frontend (boilerplate.lumineau.app)

1. Set environment variables for API URL
2. Ensure the build includes all authentication components
3. Set custom domain to `boilerplate.lumineau.app`

## Testing Checklist

- [ ] Login works and sets cookie
- [ ] Cookie is visible in browser DevTools
- [ ] Cookie domain is `.lumineau.app`
- [ ] Refreshing the page maintains session
- [ ] Protected routes are accessible when logged in
- [ ] Logout clears the session cookie
- [ ] Cross-subdomain requests include the cookie