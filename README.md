# V0 Boilerplate

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://boilerplate.lumineau.app)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-red?style=for-the-badge&logo=turborepo)](https://turbo.build)

A production-ready **Next.js 15** web application with comprehensive authentication, theming, internationalization, and modern development tools. Built with TypeScript and designed for rapid project bootstrapping using a **unified single-domain architecture**.

## 🌟 Key Features

### 🔐 **Authentication System**
- **Better-auth** integration with Next.js 15 server actions
- **Simplified single-domain authentication** - no CORS complexity
- Layout-based route protection for optimal performance
- Session management with TanStack Query optimization
- Social OAuth providers (GitHub, Google) support

### 🎨 **Advanced Theming**
- **8 pre-built color themes**
- Dynamic theme switching with CSS custom properties
- **5 radius presets** (0 to 1.0rem) for component customization
- Dark/light mode support with `next-themes`
- Persistent user preferences with localStorage

### 🌍 **Internationalization (i18n)**
- **English and French** translations out of the box
- Context-based settings store for language switching
- Comprehensive translation coverage for all UI components
- Easy extension for additional languages

### 🔔 **Real-time Notifications**
- **Server-Sent Events (SSE)** for real-time updates
- Database-persisted notifications with Prisma
- Mark as read/unread functionality with optimistic updates
- Bulk operations (mark all as read)
- TanStack Query integration for efficient state management

### 📱 **Progressive Web App (PWA)**
- **next-pwa** integration with Workbox caching strategies
- Comprehensive service worker with runtime caching
- App manifest with customizable icons and metadata
- Offline-first approach for improved user experience

### 🏗️ **Unified Web Architecture**
- **Single Next.js app** serving both frontend and API routes
- **Turborepo** for optimized build orchestration
- **pnpm workspaces** with workspace protocol  
- Shared packages for types, configs, and utilities
- **No CORS issues** - same origin for all requests
- **Simplified deployment** - one Vercel project instead of two

### 🛠️ **Developer Experience**
- **Automated project setup script** for instant bootstrapping
- **TanStack Query** for server state management
- **Radix UI** primitives for accessible components
- **Tailwind CSS** with shadcn/ui component system
- **Prisma ORM** with PostgreSQL database
- **ESLint** and **TypeScript** strict configuration
- **Debug page** at `/debug` for troubleshooting
- Hot reload and fast refresh in development

## 🚀 Quick Start

1. **Clone and setup**:
   ```bash
   git clone <your-repo-url> my-new-project
   cd my-new-project
   npx tsx scripts/setup-project.ts
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start development**:
   ```bash
   make dev
   ```

4. **Open your browser**:
   - Web App: http://localhost:3000
   - API Health: http://localhost:3000/api/health

## 🔧 Development

### Database Setup

The project uses PostgreSQL with Docker Compose for local development:

```bash
# Start database
make db-up

# Stop database  
make db-down

# View database logs
make db-logs

# Reset database (⚠️ deletes all data)
make db-migrate-reset
```

### Database Management

```bash
# Run migrations
make db-migrate

# Open Prisma Studio (database GUI)
make db-studio

# Generate Prisma client
pnpm --filter @boilerplate/web db:generate
```

## 🐛 Troubleshooting

### Database Connection Issues

If you encounter database authentication errors like:
```
Authentication failed against database server, the provided database credentials for `user` are not valid.
```

**This issue has been fixed in the template!** The problem was that the Makefile was using hardcoded database credentials instead of reading from the environment variables created by the setup script.

**Solution:**
1. Run the setup script: `npx tsx scripts/setup-project.ts`
2. The script will automatically:
   - Create proper `.env.project` and `apps/web/.env.local` files
   - Update the Makefile to use environment variables instead of hardcoded values
   - Configure the correct database credentials

**For new projects:**
- Always run `npx tsx scripts/setup-project.ts` after cloning
- The setup script ensures all database credentials are properly configured
- The Makefile now reads from `.env.project` instead of using hardcoded values

**Manual fix (if needed):**
```bash
# Reset database with correct credentials
make db-clean
make db-up
```

### Port Already in Use

If you see "Port 3000 is in use", the app will automatically use the next available port (3001, 3002, etc.).

### Environment Variables

The project uses two environment files:
- `.env.project` - Docker Compose configuration (database credentials)
- `apps/web/.env.local` - Next.js application configuration

Both are automatically generated by the setup script and should not be manually edited.

## 🏢 Architecture Overview

### Monorepo Structure
```
boilerplate/
├── apps/
│   └── web/               # Next.js 15 unified web application
│       ├── app/
│       │   ├── (web)/     # Public pages (landing page)
│       │   ├── (auth)/    # Authentication pages  
│       │   ├── (protected)/ # Protected dashboard pages
│       │   ├── api/       # API routes
│       │   ├── components/ # UI components
│       │   └── lib/       # Utilities and libraries
│       ├── prisma/        # Database schema and migrations
│       └── public/        # Static assets
├── packages/
│   ├── config/            # Shared configurations
│   └── types/             # Shared TypeScript types
├── package.json           # Root workspace configuration
└── turbo.json            # Turborepo configuration
```

### Technology Stack

#### **Unified Web Application (`apps/web`)**
- **Next.js 15** with App Router and React 19 (frontend + API)
- **TanStack Query** for server state management
- **Tailwind CSS** with shadcn/ui components
- **Radix UI** primitives for accessibility
- **next-themes** for theme management
- **next-pwa** for Progressive Web App features
- **Better-auth** for authentication
- **Prisma ORM** with PostgreSQL
- **Server-Sent Events** for real-time features

#### **Shared Packages**
- **`@boilerplate/config`** - ESLint, Tailwind, TypeScript, and project configs
- **`@boilerplate/types`** - Shared TypeScript interfaces and types

## 🎯 Key Features in Detail

### Single Domain Benefits
- **No CORS configuration** required - everything runs on the same origin
- **Simplified authentication** - cookies work seamlessly
- **Better performance** - no cross-origin request overhead
- **Easier deployment** - single Vercel project
- **Cost effective** - one project billing

### Authentication Flow
- **Layout-based protection** eliminates per-page auth checks
- **Simplified cookie configuration** for single domain
- **Session optimization** with TanStack Query caching
- **Automatic redirects** with middleware-based routing

### Theme System
- **8 color themes** with semantic color tokens
- **Dynamic CSS custom properties** for runtime theme switching
- **Radius customization** with 5 preset values
- **Persistent user preferences** across sessions

### Notification System
- **Real-time updates** via Server-Sent Events
- **Database persistence** with Prisma models
- **Optimistic UI updates** for instant feedback
- **Bulk operations** for improved user experience

### Development Workflow
- **Turborepo caching** for faster builds
- **Parallel task execution** across workspaces
- **Shared configuration** to reduce duplication
- **Type-safe APIs** with end-to-end TypeScript

## 📋 Available Scripts

### Root Level (Turborepo)
```bash
pnpm dev          # Start web application development server
pnpm build        # Build all applications and packages
pnpm lint         # Lint all code
pnpm type-check   # TypeScript type checking
pnpm test         # Run all tests
pnpm clean        # Clean build outputs
pnpm format       # Format code with Prettier
```

### Individual Application
```bash
pnpm --filter @boilerplate/web dev       # Web app only
pnpm --filter @boilerplate/web build     # Build web app
```

### Database Operations
```bash
make db-up        # Start PostgreSQL with Docker
make db-down      # Stop PostgreSQL container
make db-migrate   # Run database migrations
make db-studio    # Open Prisma Studio
make db-reset     # Reset database (development only)
```

### Development Helpers
```bash
make dev          # Start web app (alias for pnpm dev)
make logs         # View database container logs
make clean        # Clean all build outputs and caches
```

## 🌐 Deployment

### Multi-Environment Vercel Deployment

The project supports automatic multi-environment deployment:

- **Production** (`main` branch): Auto-deploy to production domain
- **Staging** (`staging` branch): Auto-deploy to staging subdomain  
- **Development** (feature branches): Auto-deploy to preview URLs

#### Environment Variables Setup

**Required in Vercel (set once, works for all environments):**
```env
DATABASE_URL=postgresql://user:password@host:5432/database
BETTER_AUTH_SECRET=your-32-character-secret-key-here
```

**Optional (for social OAuth):**
```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Automatic Variables (provided by Vercel):**
- `VERCEL_ENV` - Environment type (production/preview/development)
- `VERCEL_GIT_COMMIT_REF` - Git branch name
- `VERCEL_URL` - Deployment URL
- `NODE_ENV` - Node environment

#### Deployment Setup

1. **Create Vercel Project**
   - Import your repository
   - Set **Root Directory** to `apps/web`
   - Framework preset: Next.js (auto-detected)

2. **Configure Environment Variables**
   - Add `DATABASE_URL` and `BETTER_AUTH_SECRET` in Vercel dashboard
   - Variables work across all environments automatically

3. **Database Setup (Recommended: Neon)**
   - Create PostgreSQL database at [neon.tech](https://neon.tech)
   - Neon automatically creates branch databases for staging/preview
   - Use the same `DATABASE_URL` for all environments

4. **Deploy**
   - Push to `main` for production
   - Push to `staging` for staging environment
   - Push to any branch for preview deployments

See `docs/vercel-deployment.md` for complete deployment guide.

## 🛡️ Security Features

- **Enhanced security headers** configured in vercel.json
- **Environment variable validation**
- **Secure cookie configuration** for production
- **CSRF protection** with Better-auth
- **No CORS vulnerabilities** with single domain architecture

## 🎨 Customization

### 🚀 **Project Setup Script**

This boilerplate includes a comprehensive setup script that automates project configuration:

```bash
npx tsx scripts/setup-project.ts
```

**What it configures:**
- **Project Branding**: Names, descriptions, and metadata
- **Database Configuration**: PostgreSQL credentials and connection strings
- **Environment Files**: Generates `.env` files with secure secrets
- **Package Namespaces**: Updates all package.json files
- **Docker Setup**: Configures container names and networking
- **PWA Manifest**: Updates app metadata for Progressive Web App features
- **Documentation**: Updates deployment guides with your project details

### Adding New Themes
1. Create theme file in `apps/web/app/lib/theme/`
2. Export theme colors following the existing pattern
3. Update `getAvailableThemes()` in project config
4. Theme appears automatically in settings panel

### Adding New Languages
1. Create translation files in `apps/web/app/locales/`
2. Update i18n configuration in `apps/web/app/lib/i18n.ts`
3. Update `getSupportedLocales()` in project config

### Extending the API
1. Add new routes in `apps/web/app/api/`
2. Update Prisma schema for database changes
3. Generate types in `@boilerplate/types`
4. Use TanStack Query for client-side data fetching

## 🐛 Debugging & Troubleshooting

### Debug Page
Visit `/debug` in any environment for comprehensive diagnostics:
- Environment detection status
- Authentication and session information
- Cookie inspection with copy functionality
- API health checks
- Configuration verification (non-sensitive)
- Common issues and solutions

### Common Issues
- **Authentication problems**: Check `/debug` for session and cookie status
- **Environment detection**: Verify VERCEL_ENV and branch name in debug page
- **Database issues**: Check API health at `/api/health`
- **Build failures**: Ensure all environment variables are set

## 📖 Documentation

- **Deployment Guide**: `docs/vercel-deployment.md`
- **Project Instructions**: `CLAUDE.md` (for AI assistants)
- **Migration Guide**: `MIGRATION_GUIDE.md` (historical reference)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js** team for the excellent framework
- **Vercel** for deployment platform and automatic environment detection
- **Better-auth** for simplified authentication solution
- **Radix UI** for accessible component primitives
- **shadcn/ui** for beautiful component designs
- **Neon** for PostgreSQL with database branching

---

**Ready to build something amazing?** 🚀

Start with `npx tsx scripts/setup-project.ts` to customize this boilerplate, then `make dev` to begin development!