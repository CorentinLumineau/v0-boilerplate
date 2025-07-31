# Production Deployment Checklist

## Environment Variables Setup

### Backend (api.boilerplate.lumineau.app)
Set these environment variables in your deployment platform:

```bash
NODE_ENV=production
VERCEL_ENV=production
BETTER_AUTH_BASE_URL=https://api.boilerplate.lumineau.app
BETTER_AUTH_SECRET=your-production-secret-here
NEXT_PUBLIC_APP_URL=https://boilerplate.lumineau.app
NEXT_PUBLIC_API_URL=https://api.boilerplate.lumineau.app
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Frontend (boilerplate.lumineau.app)
Set these environment variables in your deployment platform:

```bash
NODE_ENV=production
VERCEL_ENV=production
NEXT_PUBLIC_API_URL=https://api.boilerplate.lumineau.app
NEXT_PUBLIC_APP_URL=https://boilerplate.lumineau.app
```

## Cross-Subdomain Authentication Verification

After deployment, check that cookies are set correctly:

1. **Expected Cookie Domain**: `.lumineau.app` (note the leading dot)
2. **Expected SameSite**: `None` (for cross-subdomain access)
3. **Expected Secure**: `true` (required for SameSite=None)
4. **Expected HttpOnly**: `true` (for security)

## Testing Cross-Subdomain Authentication

1. Sign in on `https://boilerplate.lumineau.app`
2. Check browser dev tools > Application > Cookies
3. Verify cookies have domain `.lumineau.app`
4. Navigate between frontend and backend - session should persist

## Troubleshooting

If cookies still show `api.boilerplate.lumineau.app`:
- Verify `NODE_ENV=production` is set
- Verify `BETTER_AUTH_BASE_URL` uses https://
- Check deployment logs for auth configuration output
- Clear browser cookies and try again

## Production Security Checklist

- [ ] `BETTER_AUTH_SECRET` is a secure random string (64+ characters)
- [ ] `requireEmailVerification` set to `true` in production
- [ ] Database connection uses SSL
- [ ] CORS is properly configured
- [ ] Environment variables are not exposed in client-side code