# Deploying {{PROJECT_DISPLAY_NAME}} on Vercel - Complete Multi-Environment Setup

This guide will walk you through deploying your **{{PROJECT_DISPLAY_NAME}}** web application with full support for **Production**, **Staging**, and **Development** environments using Vercel's intelligent environment detection.

> 💡 **Note**: This guide uses your project configuration from `@packages/config/project.config.ts`. If you've customized your project using `scripts/setup-project.ts`, the examples will reflect your actual configuration.

## 🏗️ Architecture Benefits

This is a **unified web application** architecture with significant advantages:

- ✅ **Single Domain**: No CORS configuration needed
- ✅ **Simplified Deployment**: One Vercel project instead of two
- ✅ **Better Performance**: No cross-origin requests
- ✅ **Shared Authentication**: Cookies work seamlessly
- ✅ **Easier Maintenance**: Single codebase to manage

## Environment Strategy Overview

This setup provides **three environments** that automatically deploy based on Git branches:

### 🌍 **Production** (`main` branch)
- **Web App**: `{{PRODUCTION_WEB_URL}}`
- **Automatic deployment** on push to `main`

### 🟡 **Staging** (`staging` branch)
- **Web App**: `{{STAGING_WEB_URL}}`
- **Automatic deployment** on push to `staging`

### 🔧 **Development** (all other branches)
- **Web App**: `{{DEVELOP_WEB_URL_PATTERN}}`
- **Automatic deployment** on push to any feature branch
- Example: `{{EXAMPLE_DEVELOP_WEB_URL}}`

All environment detection is handled automatically through `@packages/config/project.config.ts` using Vercel's built-in environment variables.

## Prerequisites

- Your monorepo is already set up with Turbo and pnpm
- You have a Vercel account
- Your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- You have configured your project with `scripts/setup-project.ts` for proper environment URLs

## Step 1: Create the Vercel Project

### 1.1 Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**

### 1.2 Import Your Repository
1. Select your Git provider (GitHub, GitLab, or Bitbucket)
2. Find and select your project repository
3. Click **"Import"**

### 1.3 Configure Project Settings
1. **Project Name**: `{{PROJECT_NAME}}` (or any name you prefer)
2. **Framework Preset**: `Next.js` (should auto-detect)
3. **Root Directory**: `apps/web` ⭐ **IMPORTANT**
4. **Build Command**: Leave as default (uses vercel.json)
5. **Output Directory**: `.next`
6. **Install Command**: `pnpm install --frozen-lockfile`

### 1.4 Environment Variables

#### 🔑 Required Environment Variables (Set Once, Used Everywhere)
**⚠️ IMPORTANT**: These environment variables are set **once in Vercel** and automatically work across **all environments** (Production, Staging, Development):

- `DATABASE_URL`: Your database connection string 
  - ✅ **Same value for ALL environments**
  - **Recommended**: Use Neon PostgreSQL for automatic database branching
  - Neon automatically creates branch databases for non-production environments
  - **Required for deployment**

- `BETTER_AUTH_SECRET`: Your Better Auth secret key (32+ characters)
  - ✅ **Same secret for ALL environments** - Used for signing authentication tokens
  - Generate once: `openssl rand -base64 32`
  - **Required for authentication to work**

#### 🤖 Automatic Environment Variables (Provided by Vercel)
These are automatically available and used by `@packages/config/project.config.ts`:
- `VERCEL_ENV`: `'production'` | `'preview'` | `'development'`
- `VERCEL_GIT_COMMIT_REF`: Branch name (e.g., `'main'`, `'staging'`, `'feature/user-auth'`)
- `VERCEL_URL`: Deployment URL
- `NODE_ENV`: Environment type

### 1.5 Deploy
1. Click **"Deploy"**
2. Wait for the build to complete (migrations run automatically during build)
3. Note the deployment URL (e.g., `https://{{PROJECT_NAME}}.vercel.app`)

## Step 2: Configure Custom Domain (Production)

### 2.1 Set Production Domain
1. In your Project settings, go to **Domains**
2. Add your custom domain: `{{CUSTOM_WEB_DOMAIN}}`
3. Configure DNS records as instructed by Vercel
4. Enable HTTPS (automatic with Vercel)

### 2.2 Automatic Subdomain Configuration
Vercel automatically creates subdomains for:
- **Staging**: Your staging branch deployments
- **Development**: Your feature branch deployments

## Step 2.5: Configure Custom Domain for Staging (Optional)

If you want a custom domain for your staging environment (recommended for teams):

### 2.5.1 Set Staging Custom Domain
1. In your Project settings, go to **Domains**
2. Add your staging domain: `staging.yourdomain.com` or `{{STAGING_WEB_URL}}`
3. Configure DNS records as instructed by Vercel
4. **Important**: Set this domain to point to the `staging` branch specifically

### 2.5.2 Branch-Specific Domain Configuration
1. After adding the domain, click the **Edit** button next to it
2. Set **Git Branch**: `staging`
3. This ensures the custom domain only serves the staging branch
4. Other branches will continue using Vercel's auto-generated preview URLs

### 2.5.3 Benefits of Staging Custom Domain
- ✅ **Professional URLs** for client demos and stakeholder reviews
- ✅ **Consistent staging environment** - same domain every time
- ✅ **Better testing** - mirrors production domain structure
- ✅ **Team collaboration** - easy to share staging links

> **Note**: Custom staging domains are optional. Vercel's auto-generated staging URLs work perfectly fine for most use cases.

## Step 3: Database Setup with Neon (Recommended)

### 3.1 Why Neon?
- **Free tier** with generous limits
- **Automatic database branching** - perfect for multi-environment setup
- **PostgreSQL** compatible
- **Serverless** and scales to zero

### 3.2 Setup Steps
1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new PostgreSQL database
3. Get the connection string (format: `postgresql://user:password@host/database?sslmode=require`)
4. Add `DATABASE_URL` to Vercel environment variables

### 3.3 How Neon Branching Works
- **Production** (`main` branch): Uses the main database
- **Staging** (`staging` branch): Neon creates a separate branch database
- **Development** (feature branches): Each gets its own branch database
- **All use the same DATABASE_URL** - Neon handles routing automatically!

## Step 4: Verify Multi-Environment Deployment

### 4.1 Test Production
1. Push to `main` branch
2. Visit `{{PRODUCTION_WEB_URL}}`
3. Verify the app loads correctly

### 4.2 Test Staging
1. Create and push to `staging` branch
2. Visit `{{STAGING_WEB_URL}}`
3. Verify staging environment works

### 4.3 Test Development
1. Create a feature branch (e.g., `feature/new-feature`)
2. Push to the branch
3. Visit the preview URL (shown in Vercel dashboard)
4. Verify development environment works

## Step 5: Authentication Configuration

### 5.1 Simplified Cookie Configuration
Since everything runs on the same domain, authentication is greatly simplified:

```typescript
// Automatically configured in apps/web/app/lib/auth.ts
cookieOptions: {
  httpOnly: true,         // Prevents JavaScript access
  sameSite: "lax",        // Perfect for same-origin requests
  secure: true,           // Required for HTTPS
  path: "/",              // Available on all paths
}
```

### 5.2 Key Benefits
- ✅ **No CORS configuration needed** - same origin for frontend and API
- ✅ **No cross-subdomain cookie complexity**
- ✅ **Simplified authentication flow**
- ✅ **Better security** with same-origin policy

## Step 6: API Routes

Your API routes are available at the same domain:
- **Health Check**: `/api/health`
- **Auth Routes**: `/api/auth/*`
- **Custom Routes**: `/api/*`

No additional configuration needed - they just work!

## Debugging Tools

### Debug Page
Visit `/debug` in any environment to see:
- Current environment detection
- Session information
- Cookie details
- API health status
- Configuration (non-sensitive)

### Common Issues and Solutions

**Issue**: Environment not detected correctly
- **Solution**: Check `VERCEL_ENV` and `VERCEL_GIT_COMMIT_REF` in Vercel dashboard
- The `getEnvironmentType()` function in project.config.ts handles detection

**Issue**: Database connection fails
- **Solution**: Verify `DATABASE_URL` is set in Vercel environment variables
- Check Neon dashboard for connection details
- Ensure SSL mode is enabled in connection string

**Issue**: Authentication not working
- **Solution**: Verify `BETTER_AUTH_SECRET` is set (same value for all environments)
- Check browser DevTools for `better-auth.session_token` cookie
- Use `/debug` page for detailed diagnostics

## Configuration Files

### vercel.json (apps/web/vercel.json)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "pnpm --filter {{PROJECT_NAMESPACE}}/types build && pnpm --filter {{PROJECT_NAMESPACE}}/config build && prisma generate && prisma migrate deploy && next build",
  "installCommand": "pnpm install --frozen-lockfile",
  "outputDirectory": ".next",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

### Key Benefits of This Configuration:
- ✅ **Automatic dependency building** (types, config packages)
- ✅ **Database migrations** run automatically
- ✅ **Security headers** configured
- ✅ **Function timeouts** optimized
- ✅ **No CORS configuration needed** - single domain!

## Environment Variables Summary

### Required Variables (Set Once in Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `BETTER_AUTH_SECRET` | Authentication secret (32+ chars) | `your-super-secret-key-here` |

### Optional Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | `your-github-client-id` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | `your-github-secret` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `your-google-client-id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `your-google-secret` |

### Automatic Variables (Provided by Vercel)
| Variable | Description | Values |
|----------|-------------|--------|
| `VERCEL_ENV` | Deployment environment | `production`, `preview`, `development` |
| `VERCEL_GIT_COMMIT_REF` | Git branch name | `main`, `staging`, `feature/xyz` |
| `VERCEL_URL` | Deployment URL | Auto-generated |
| `NODE_ENV` | Node environment | `production`, `development` |

## Deployment Workflow

### 1. Development Flow
```
feature/user-auth branch → Push → {{EXAMPLE_DEVELOP_WEB_URL}}
                                 ↓
                          Review & Test
                                 ↓
                          Merge to staging
```

### 2. Staging Flow
```
staging branch → Push → {{STAGING_WEB_URL}}
                      ↓
                QA Testing
                      ↓
              Merge to main
```

### 3. Production Flow
```
main branch → Push → {{PRODUCTION_WEB_URL}} (production)
```

## Migration Commands

Database migrations are handled automatically during deployment, but you can also run them manually:

```bash
# Development: Create new migration
make db-migrate

# Deploy migrations (runs automatically on Vercel)
pnpm --filter {{PROJECT_NAMESPACE}}/web db:migrate

# Reset database (⚠️ Development only)
make db-migrate-reset
```

## Monitoring and Analytics

### Vercel Analytics
1. Enable Analytics in your Vercel project settings
2. Monitor performance, errors, and usage
3. Set up alerts for issues

### Recommended Monitoring Tools
- **Sentry**: Error tracking and performance monitoring
- **PostHog**: Product analytics and feature flags
- **Uptime monitoring**: Pingdom, UptimeRobot, or Better Uptime

## Deployment Checklist

### Initial Setup
- [ ] Project created with correct root directory (`apps/web`)
- [ ] Environment variables configured: `DATABASE_URL` and `BETTER_AUTH_SECRET`
- [ ] Database setup with Neon (or alternative)
- [ ] Custom domain configured (production)
- [ ] Custom domain configured for staging (optional, recommended for teams)

### Multi-Environment Testing
- [ ] **Production**: Push to `main` branch and verify
- [ ] **Staging**: Push to `staging` branch and verify
- [ ] **Development**: Push to feature branch and verify
- [ ] Environment detection working correctly
- [ ] Database branching working (if using Neon)

### Security Verification
- [ ] `BETTER_AUTH_SECRET` is secure (32+ characters)
- [ ] All deployments use HTTPS
- [ ] Security headers properly configured
- [ ] Environment variables not exposed

### Performance Checks
- [ ] Build times acceptable
- [ ] Function execution times optimized
- [ ] Static assets properly cached
- [ ] Images optimized

## Summary

Your **{{PROJECT_DISPLAY_NAME}}** is now deployed with:

🌍 **Production** environment on `main` branch  
🟡 **Staging** environment on `staging` branch  
🔧 **Development** environments on feature branches  

All with **automatic configuration**, **zero CORS complexity**, and **simplified authentication**!

## Benefits of This Architecture

✅ **Single Domain Simplicity**: No CORS, no cross-origin issues  
✅ **Unified Deployment**: One Vercel project to manage  
✅ **Automatic Environment Detection**: Zero manual configuration  
✅ **Database Branching**: Isolated data for each environment  
✅ **Simplified Authentication**: Same-origin cookies just work  
✅ **Better Performance**: No cross-origin request overhead  
✅ **Cost Effective**: Single project billing  

## Next Steps

1. **Set up monitoring**: Add error tracking and analytics
2. **Configure CI/CD**: Add GitHub Actions for automated testing
3. **Add custom domains**: For staging if needed
4. **Enable preview comments**: For better collaboration
5. **Set up notifications**: For deployment status

---

Need help? Check the [Vercel documentation](https://vercel.com/docs) or your project's README for more information.