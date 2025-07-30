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
   
   # Frontend project (optional)
   NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
   ```

4. **Set up production database** (Railway, Supabase, Neon, etc.)

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