# 🚀 Project Setup Guide

A modern Next.js 15 monorepo template with authentication, theming, and TypeScript - ready in minutes!

## 📋 Prerequisites

- **Node.js** (v18+) and **pnpm** (v10.10.0+) - `npm install -g pnpm`
- **Docker** and **Docker Compose** - for PostgreSQL database
- **Git** - for version control

## 🎯 Quick Start (3 commands)

```bash
# 1. Clone and install
git clone <your-repo-url> my-awesome-project
cd my-awesome-project && pnpm install

# 2. Setup everything (interactive)
npx tsx scripts/setup-project.ts

# 3. Start development
make db-up && make dev
```

**🎉 That's it!** Your app is running with authentication, theming, and database ready!

## 🛠️ What the Setup Script Does

The interactive setup script configures everything automatically:

### **📋 Project Configuration**
- Project name, description, and author details
- Repository URLs and package namespaces
- Updates all package.json files

### **🗄️ Database Setup**
- Database name, user, and secure password
- Docker container configuration
- Complete environment files with connection strings

### **🔐 Security Configuration**
- Auto-generates secure 64-character authentication secrets
- Configures CORS and authentication URLs
- Creates production-ready .env files

### **⚙️ Development Configuration**
- Custom frontend/backend ports (default: 3100/3101)
- Environment variables for all services
- Updates documentation with your project details

### **🌐 Production & Staging URLs**
- Production frontend and backend URLs for deployment
- Staging frontend and backend URLs for testing environment
- Automatic environment detection based on NODE_ENV and VERCEL_ENV
- URL helpers that serve the correct URLs based on current environment

## 🏗️ Project Architecture

```
my-awesome-project/
├── apps/
│   ├── frontend/          # Next.js 15 app with App Router
│   └── backend/           # Next.js 15 API server
├── packages/
│   ├── config/            # Shared ESLint, Tailwind, TypeScript configs
│   └── types/             # Shared API types
├── scripts/
│   └── setup-project.ts   # Complete project setup automation
├── project.config.ts      # Centralized project configuration
├── docker-compose.yml     # PostgreSQL database
└── Makefile              # Development commands
```

## 🎨 Features Included

### **🔐 Authentication System**
- ✅ Complete email/password auth with Better Auth
- ✅ Session management and route protection
- ✅ Login/signup pages with form validation
- ✅ User dropdown and logout functionality

### **🎨 Theming System**
- ✅ 8 beautiful color themes (default, red, orange, green, blue, teal, purple, pink)
- ✅ Dark/light mode with automatic system detection
- ✅ Radius customization (5 preset values)
- ✅ CSS custom properties for dynamic theming

### **🌍 Internationalization**
- ✅ English and French translations
- ✅ Easy language switching
- ✅ Extensible translation system

### **⚡ Developer Experience**
- ✅ TypeScript with strict configuration
- ✅ ESLint and Prettier setup
- ✅ Turborepo for fast builds and caching
- ✅ shadcn/ui components
- ✅ Tailwind CSS with optimized configuration

## 🚀 Development Commands

```bash
# Database Management
make db-up          # Start PostgreSQL database
make db-down        # Stop database
make db-restart     # Restart database
make db-clean       # Reset database (⚠️ deletes all data)
make db-logs        # View database logs

# Development
make dev            # Start both frontend and backend
make dev-frontend   # Start frontend only
make dev-backend    # Start backend only

# Building & Testing
make build          # Build all apps
make lint           # Lint all code
make type-check     # TypeScript validation
make clean          # Clean build outputs

# Quick Commands
make setup          # Install dependencies + start database
pnpm install        # Install all dependencies
```

## 🌐 Access Your Application

After setup, your app will be available at:
- **Frontend**: http://localhost:[your-frontend-port]
- **Backend API**: http://localhost:[your-backend-port]
- **API Health**: http://localhost:[your-backend-port]/api/health

## 🔧 Manual Configuration (Advanced)

If you prefer manual setup:

1. **Edit `project.config.ts`** with your project details
2. **Create environment files**:
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   # Edit with your database credentials and secrets
   ```
3. **Update Docker configuration** in `docker-compose.yml`
4. **Update package.json files** with your project details

## 🚀 Deployment

### **Vercel (Recommended)**

This project supports both **production** and **staging** deployments on Vercel.

#### **Production Deployment**

1. **Build and verify**:
   ```bash
   make build  # Ensure everything builds correctly
   ```

2. **Create two Vercel projects**:
   - Frontend: Import `apps/frontend`
   - Backend: Import `apps/backend`

3. **Configure environment variables** in Vercel dashboard:
   ```env
   # Backend project
   DATABASE_URL=your-production-database-url
   BETTER_AUTH_SECRET=your-production-secret
   BETTER_AUTH_URL=https://your-backend.vercel.app
   FRONTEND_URL=https://your-frontend.vercel.app
   NODE_ENV=production
   
   # Frontend project (optional)
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
   NODE_ENV=production
   ```

4. **Set up production database** (Railway, Supabase, Neon, etc.)

#### **Staging Deployment**

Set up a complete staging environment for testing before production:

1. **Create two additional Vercel projects**:
   - Frontend Staging: Import `apps/frontend` (separate project)
   - Backend Staging: Import `apps/backend` (separate project)

2. **Configure staging environment variables**:
   ```env
   # Backend Staging project
   DATABASE_URL=your-staging-database-url
   BETTER_AUTH_SECRET=your-staging-secret-key
   BETTER_AUTH_URL=https://your-backend-staging.vercel.app
   FRONTEND_URL=https://your-frontend-staging.vercel.app
   NODE_ENV=staging
   VERCEL_ENV=preview
   
   # Frontend Staging project
   NEXT_PUBLIC_API_URL=https://your-backend-staging.vercel.app
   NODE_ENV=staging
   VERCEL_ENV=preview
   ```

3. **Set up staging database**:
   - Create a separate staging database (can be smaller/cheaper tier)
   - Use the same database provider as production for consistency
   - **Important**: Never use production data in staging

4. **Configure custom domains** (optional but recommended):
   - Frontend Staging: `staging.yourdomain.com`
   - Backend Staging: `api.staging.yourdomain.com`

5. **Set up branch-based deployments**:
   - Production: Deploys from `main` branch
   - Staging: Deploys from `develop` or `staging` branch
   - Configure this in Vercel project settings → Git

#### **Environment Configuration**

The project automatically detects the environment and serves the correct URLs:
- `NODE_ENV=production` → Production URLs
- `NODE_ENV=staging` or `VERCEL_ENV=preview` → Staging URLs
- Otherwise → Development URLs (localhost)

#### **Deployment Checklist**

**Production:**
- [ ] Production database created and accessible
- [ ] Environment variables configured in Vercel
- [ ] Custom domains configured (if needed)
- [ ] SSL certificates active
- [ ] Health checks passing
- [ ] Authentication working correctly

**Staging:**
- [ ] Staging database created (separate from production)
- [ ] Staging environment variables configured
- [ ] Staging domains configured (if using custom domains)
- [ ] Branch-based deployment configured
- [ ] Staging environment mirrors production setup
- [ ] Test data populated (not production data)

#### **Testing Your Deployments**

**Production Testing:**
- Visit your production frontend URL
- Test user registration and login
- Verify API endpoints respond correctly
- Check health endpoint: `https://your-backend.vercel.app/api/health`

**Staging Testing:**
- Visit your staging frontend URL
- Test all features thoroughly before promoting to production
- Verify staging environment matches production behavior
- Use staging for PR preview deployments

### **Required Environment Variables**

#### **Production Environment Variables**
```env
# Backend (Required)
DATABASE_URL=postgresql://user:password@host:port/database
BETTER_AUTH_SECRET=your-64-character-secret-key
BETTER_AUTH_URL=https://your-backend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production

# Frontend (Optional)
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
NODE_ENV=production
```

#### **Staging Environment Variables**
```env
# Backend Staging (Required)
DATABASE_URL=postgresql://user:password@staging-host:port/staging-database
BETTER_AUTH_SECRET=your-staging-64-character-secret-key
BETTER_AUTH_URL=https://your-backend-staging.vercel.app
FRONTEND_URL=https://your-frontend-staging.vercel.app
NODE_ENV=staging
VERCEL_ENV=preview

# Frontend Staging (Optional)
NEXT_PUBLIC_API_URL=https://your-backend-staging.vercel.app
NODE_ENV=staging
VERCEL_ENV=preview
```

#### **Development Environment Variables** (Auto-generated by setup script)
```env
# Backend Development
DATABASE_URL=postgresql://user:password@localhost:5432/database
BETTER_AUTH_SECRET=auto-generated-secret
BETTER_AUTH_URL=http://localhost:3101
FRONTEND_URL=http://localhost:3100
NODE_ENV=development

# Frontend Development
NEXT_PUBLIC_API_URL=http://localhost:3101
NODE_ENV=development
```

### **Environment Variable Notes**
- **BETTER_AUTH_SECRET**: Must be at least 32 characters. Use different secrets for production and staging
- **DATABASE_URL**: Use separate databases for production, staging, and development
- **NODE_ENV**: Controls which URLs are served by the config helpers
- **VERCEL_ENV**: Automatically set by Vercel (production/preview/development)
- **Custom Domains**: Update URLs in environment variables when using custom domains

### **Other Platforms**
Standard Next.js 15 applications - deploy anywhere that supports Node.js.

## 🔍 Troubleshooting

### **Database Issues**
```bash
docker ps                  # Check if database is running
make db-logs               # View database logs
make db-restart            # Restart database
```

### **CORS Errors**
- Verify `FRONTEND_URL` in backend `.env`
- Ensure both servers are running on correct ports

### **Authentication Issues**
- Check `BETTER_AUTH_SECRET` is set in `.env`
- Verify database tables exist: `make db-logs`
- Test API health: http://localhost:[backend-port]/api/health

### **Port Conflicts**
```bash
# Kill processes on your configured ports
lsof -ti:[frontend-port] | xargs kill -9
lsof -ti:[backend-port] | xargs kill -9
```

### **Staging Environment Issues**
```bash
# Check staging environment variables are set correctly
echo $NODE_ENV           # Should be 'staging'
echo $VERCEL_ENV         # Should be 'preview' on Vercel

# Test staging API health
curl https://your-backend-staging.vercel.app/api/health

# Verify staging database connection
# Check Vercel build logs for database connection errors
```

### **Environment Detection Issues**
1. **Wrong URLs being served**: Check `NODE_ENV` and `VERCEL_ENV` values
2. **Staging URLs not working**: Verify staging configuration in `project.config.ts`
3. **Environment helpers not working**: Check import statements in your code

### **Common Staging Setup Mistakes**
1. **Using production database**: Always use separate staging database
2. **Same auth secret**: Use different `BETTER_AUTH_SECRET` for staging
3. **Missing VERCEL_ENV**: Set to 'preview' for staging deployments
4. **Branch configuration**: Ensure staging deploys from correct branch

## 📚 Technology Stack

- **Framework**: Next.js 15 with App Router and React 19
- **Authentication**: Better Auth with Prisma adapter
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **Build Tool**: Turborepo for monorepo management
- **Language**: TypeScript with strict configuration
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 🎉 What's Next?

After setup, you can:
1. **Create your first account** at your frontend URL
2. **Explore the codebase** - everything is well-organized and documented
3. **Customize themes** - add your brand colors
4. **Add new features** - follow the established patterns
5. **Deploy to production** - use the Vercel deployment guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run checks: `make type-check && make lint`
5. Commit: `git commit -m "Add amazing feature"`
6. Push: `git push origin feature/amazing-feature`
7. Submit a pull request

---

**Happy coding!** 🎉

Built with ❤️ using modern web technologies. If you encounter any issues, check the troubleshooting section above.