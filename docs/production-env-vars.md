# Production Environment Variables

This document lists all required and optional environment variables for production deployment.

## Backend Environment Variables

```env
# Required: Set NODE_ENV to production
NODE_ENV=production

# Required: Database connection
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Required: Better Auth secret (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-very-secure-random-32-character-secret-here

# Required: Backend API URL (where the backend is deployed)
BETTER_AUTH_BASE_URL=https://api.boilerplate.lumineau.app

# Required: Frontend URLs for CORS and redirects
NEXT_PUBLIC_APP_URL=https://boilerplate.lumineau.app
NEXT_PUBLIC_API_URL=https://api.boilerplate.lumineau.app

# Optional: Social Authentication Providers
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Frontend Environment Variables

```env
# Required: API URLs
NEXT_PUBLIC_APP_URL=https://boilerplate.lumineau.app
NEXT_PUBLIC_API_URL=https://api.boilerplate.lumineau.app
```

## Important Notes

1. **NODE_ENV**: Must be set to `production` for proper cookie configuration
2. **BETTER_AUTH_SECRET**: Must be at least 32 characters long and cryptographically secure
3. **URLs**: Must use HTTPS in production for secure cookies
4. **Database**: Ensure your production database is properly secured and backed up

## Vercel Deployment

When deploying to Vercel, add these environment variables in:
- Project Settings → Environment Variables
- Select "Production" environment
- Add each variable with its production value