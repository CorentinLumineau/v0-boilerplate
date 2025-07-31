# Deploying Both Frontend and Backend on Vercel - Monorepo Setup

This guide will walk you through deploying both your frontend and backend applications simultaneously using Vercel's monorepo support.

## Prerequisites

- Your monorepo is already set up with Turbo and pnpm
- You have a Vercel account
- Your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Create the Frontend Project

### 1.1 Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**

### 1.2 Import Your Repository
1. Select your Git provider (GitHub, GitLab, or Bitbucket)
2. Find and select your `v0-boilerplate` repository
3. Click **"Import"**

### 1.3 Configure Frontend Project Settings
1. **Project Name**: `your-app-frontend` (or any name you prefer)
2. **Framework Preset**: `Next.js` (should auto-detect)
3. **Root Directory**: `apps/frontend` ⭐ **IMPORTANT**
4. **Build Command**: `pnpm build` ⭐ **NOT** `pnpm build --filter=@boilerplate/frontend`
5. **Output Directory**: `.next`
6. **Install Command**: `pnpm install`

### 1.4 Environment Variables (Optional)
Add any environment variables your frontend needs:
- `NEXT_PUBLIC_API_URL`: Will be set after backend deployment

### 1.5 Deploy Frontend
1. Click **"Deploy"**
2. Wait for the build to complete
3. Note the deployment URL (e.g., `https://your-app-frontend.vercel.app`)

## Step 2: Create the Backend Project

### 2.1 Create Another Project
1. In Vercel Dashboard, click **"New Project"** again
2. Select the **same repository** (`v0-boilerplate`)

### 2.2 Configure Backend Project Settings
1. **Project Name**: `your-app-backend` (or any name you prefer)
2. **Framework Preset**: `Next.js` (should auto-detect)
3. **Root Directory**: `apps/backend` ⭐ **IMPORTANT**
4. **Build Command**: `pnpm build` ⭐ **NOT** `pnpm build --filter=@boilerplate/backend`
5. **Output Directory**: `.next`
6. **Install Command**: `pnpm install`

### 2.3 Environment Variables
Add backend-specific environment variables:
- `DATABASE_URL`: Your database connection string (⚠️ **REQUIRED** - see database setup below)
- `BETTER_AUTH_SECRET`: Your Better Auth secret key (32+ characters)
- `BETTER_AUTH_BASE_URL`: Your backend URL with protocol (e.g., `https://your-app-backend.vercel.app`)
- `NEXT_PUBLIC_APP_URL`: Your frontend URL (e.g., `https://your-app-frontend.vercel.app`)

### 2.3.1 Database Setup (Critical)
**⚠️ Important:** You must set up a production database BEFORE deploying the backend.

**Recommended Database Providers:**
- **Neon** (recommended): Free tier, auto-scaling PostgreSQL
- **Supabase**: Free tier with additional features
- **Railway**: Simple PostgreSQL hosting
- **AWS RDS**: Enterprise-grade option

**Steps:**
1. Create a PostgreSQL database with your chosen provider
2. Get the connection string (format: `postgresql://user:password@host:port/database`)
3. Add `DATABASE_URL` to your backend environment variables in Vercel
4. The build process will automatically run migrations on first deployment

### 2.4 Deploy Backend
1. Click **"Deploy"**
2. Wait for the build to complete *(migrations run automatically during build)*
3. Note the deployment URL (e.g., `https://your-app-backend.vercel.app`)
4. Verify migration success by checking the build logs for "Database migrations completed"

## Step 3: Update Frontend Environment Variables

### 3.1 Update API URL
1. Go back to your **Frontend Project** in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_API_URL` to your backend URL:
   ```
   NEXT_PUBLIC_API_URL=https://your-app-backend.vercel.app
   ```
4. Click **"Save"**
5. Trigger a new deployment by clicking **"Redeploy"**

## Step 4: Configure Custom Domains (Optional)

### 4.1 Frontend Domain
1. In your Frontend Project settings
2. Go to **Domains**
3. Add your custom domain (e.g., `app.yourdomain.com`)

### 4.2 Backend Domain
1. In your Backend Project settings
2. Go to **Domains**
3. Add your API subdomain (e.g., `api.yourdomain.com`)

## Step 5: Verify Deployment

### 5.1 Test Frontend
- Visit your frontend URL
- Verify the app loads correctly
- Check that it can communicate with the backend

### 5.2 Test Backend
- Visit your backend URL + `/api/health` (e.g., `https://your-app-backend.vercel.app/api/health`)
- Verify the API responds correctly

## Step 6: Set Up Automatic Deployments

### 6.1 Both projects will automatically deploy when you:
- Push to the `main` branch
- Create a pull request
- Merge a pull request

### 6.2 Deployment Order
- Both projects deploy simultaneously
- Backend typically deploys first (faster build)
- Frontend deploys second and picks up the new backend URL

## Troubleshooting

### Build Failures
1. **Check Root Directory**: Ensure it's set to `apps/frontend` or `apps/backend`
2. **Check Build Command**: Should be `pnpm build` (NOT with --filter flag)
3. **Check Install Command**: Should be `pnpm install`

### Common Error: "unknown option '--filter'"
- **Cause**: Using `pnpm build --filter=@boilerplate/frontend` when Root Directory is set to `apps/frontend`
- **Solution**: Use `pnpm build` as the build command when Root Directory is set to the specific app folder

### Environment Variables
1. **Frontend**: Use `NEXT_PUBLIC_` prefix for client-side variables
2. **Backend**: Regular environment variables work as expected

### Database Migration Issues
1. **Migration fails during build**:
   - Check `DATABASE_URL` is correct and accessible
   - Verify database exists and user has proper permissions
   - Check Vercel build logs for specific error messages

2. **"No pending migrations" error**:
   - This is normal for subsequent deployments
   - Migrations only run when there are schema changes

3. **Schema out of sync**:
   - Use `prisma db push` for quick fixes (development only)
   - Create proper migrations for production: `prisma migrate dev`

### CORS Issues
1. Update backend environment variables to include frontend URL
2. Ensure it matches your frontend domain exactly

### API Communication
1. Verify `NEXT_PUBLIC_API_URL` is set correctly
2. Check that backend API routes are working
3. Test with a simple health check endpoint

## Project Structure After Deployment

```
Your Repository
├── apps/
│   ├── frontend/          → Deployed to: your-app-frontend.vercel.app
│   └── backend/           → Deployed to: your-app-backend.vercel.app
├── packages/
│   ├── config/
│   └── types/
└── vercel.json            → Frontend deployment config (optional)
```

## Database Migration Workflow

### **How Migrations Work**
1. **Development**: Create migrations locally with `make db-migrate`
2. **Commit**: Migration files are version controlled
3. **Deploy**: Vercel runs `prisma migrate deploy` during build
4. **Production**: Database schema is automatically updated

### **Making Schema Changes**
```bash
# 1. Update your schema in apps/backend/prisma/schema.prisma
# 2. Create migration
make db-migrate
# 3. Test locally, then commit and push
git add . && git commit -m "Add user profile fields"
git push origin main
# 4. Vercel automatically deploys with migrations
```

### **Migration Commands**
- `make db-migrate` - Create and apply new migration (development)
- `make db-migrate-deploy` - Deploy migrations to production database
- `make db-migrate-reset` - Reset database (⚠️ deletes all data)

## Benefits of This Setup

✅ **Independent Scaling**: Each app scales based on its own traffic  
✅ **Isolated Deployments**: Deploy one app without affecting the other  
✅ **Separate Environment Variables**: Different configs for each app  
✅ **Easy Rollbacks**: Rollback one app independently  
✅ **Cost Optimization**: Pay only for what each app uses  
✅ **Simultaneous Deployments**: Both deploy when you push code  
✅ **Automatic Migrations**: Database schema stays in sync

## Next Steps

1. **Monitor Deployments**: Use Vercel's built-in analytics
2. **Set Up Preview Deployments**: Test changes in PRs
3. **Configure Webhooks**: Integrate with your CI/CD pipeline
4. **Set Up Monitoring**: Add error tracking and performance monitoring

## Configuration Files

### Root vercel.json (optional - only needed if not using Root Directory setting)
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

### Alternative: Deploy from Root with Turbo (not recommended for this setup)
If you want to deploy from the root directory, you would need:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm build --filter=@boilerplate/frontend",
  "outputDirectory": "apps/frontend/.next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

## Environment Variables Reference

### Frontend Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_URL`: Frontend app URL

### Backend Environment Variables
- `DATABASE_URL`: Database connection string
- `BETTER_AUTH_SECRET`: Better Auth signing secret (32+ characters)
- `BETTER_AUTH_BASE_URL`: Backend URL with protocol (e.g., `https://api.yourdomain.com`)
- `NEXT_PUBLIC_APP_URL`: Frontend URL for CORS and redirects
- `NODE_ENV`: Environment (production/development)

## Deployment Checklist

- [ ] Frontend project created with correct root directory (`apps/frontend`)
- [ ] Backend project created with correct root directory (`apps/backend`)
- [ ] Build commands set to `pnpm build` (not with --filter flag)
- [ ] Environment variables configured for both projects
- [ ] Frontend can communicate with backend
- [ ] Custom domains configured (if needed)
- [ ] Health checks passing
- [ ] Monitoring and analytics set up

## Key Points to Remember

⭐ **Root Directory**: Set to `apps/frontend` or `apps/backend`  
⭐ **Build Command**: Use `pnpm build` (simple, no filters)  
⭐ **Output Directory**: Use `.next` (relative to the app directory)  
⭐ **Install Command**: Use `pnpm install` (works from any directory)  

Your monorepo is now ready for production deployment! 🚀 