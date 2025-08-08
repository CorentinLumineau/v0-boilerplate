# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

This is a **Turborepo monorepo** with the following **single web app** structure:

```
/
├── apps/
│   └── web/               # Next.js 15 unified web application (frontend + API)
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
│   ├── config/            # Shared configurations (ESLint, Tailwind, TypeScript)
│   └── types/             # Shared API types only
├── package.json           # Root workspace configuration
└── turbo.json            # Turborepo configuration
```

## Development Principles

- Never hardcode values that can change on another project. Use `@packages/config/project.config.ts` and use it throughout the whole project
- Always generate/update the type in @packages/types/ and use them in project. We should not have interfaces created within the frontend/backend
- Never commit changes

## Memory Notes

- All UI components shadcn should be located to @packages/ui/ not in dedicated project

## Troubleshooting Notes

- On troubleshooting issue, dont forget to get the latest documentation of technical stack by calling context7 mcp

## Common Commands

### Root Level Commands (Turborepo)
- `pnpm build` - Build all apps and packages
- `pnpm dev` - Start all development servers concurrently
- `pnpm lint` - Lint all apps and packages
- `pnpm type-check` - Type check all TypeScript code
- `pnpm test` - Run tests across all apps
- `pnpm clean` - Clean build outputs
- `pnpm format` - Format code with Prettier

### Individual App Commands
- `pnpm --filter @boilerplate/web dev` - Start web application
- `make dev-web` - Start web application (alternative)

### Package Management
- Uses `pnpm` workspaces with `pnpm@10.10.0`
- Workspace dependencies use `workspace:*` protocol
- Turborepo handles task orchestration and caching

## Architecture Overview

This is a **unified web application** built with TypeScript, featuring comprehensive theming and internationalization.

### Key Technologies

#### Web Application (apps/web)
- **Next.js 15** with App Router and React 19 (unified frontend + API)
- **TypeScript** with strict configuration
- **Tailwind CSS** with shadcn/ui components
- **next-themes** for dark/light mode switching
- **Radix UI** primitives for accessible components
- **Lucide React** for icons
- **Better Auth** for authentication
- **Prisma** for database operations
- **PWA support** with next-pwa

#### Shared Packages (Minimal)
- **@boilerplate/config** - Shared ESLint, Tailwind, and TypeScript configs
- **@boilerplate/types** - Shared API types between frontend and backend

### Core Architecture Patterns

#### Theme System (Web App)
The web application features a sophisticated theming system:
- **8 color themes** defined in `apps/web/app/lib/theme/` (default, red, orange, green, blue, teal, purple, pink)
- **Dynamic theme switching** via CSS custom properties
- **Radius customization** with 5 preset values (0 to 1.0rem)
- **Base theme structure** defining color tokens
- **Shared theme types** in `@boilerplate/types`

#### Settings Management (Web App)
- **Context-based settings store** in `apps/web/app/hooks/use-settings-store.tsx`
- **Specialized hooks** for theme and language settings
- **localStorage persistence** for user preferences
- **Memoized setters** to prevent unnecessary re-renders

#### Component Architecture (Simplified)
- **All UI components** in `apps/web/app/components/` using Radix UI primitives
- **Layout components**: Sidebar, Header with user dropdown
- **Settings panel**: Color theme selector, radius selector
- **Shared utilities**: `apps/web/app/lib/utils.ts`

#### API Architecture (Unified)
- **Next.js API Routes** at `/api/*` (same domain as frontend)
- **Health check endpoint** at `/api/health`
- **No CORS needed** - same origin for frontend and API
- **Built-in TypeScript support**
- **Better Auth integration** for authentication

#### Internationalization
- **Two languages supported**: English and French
- **Translation files** in `apps/web/app/locales/`
- **i18n utilities** in `apps/web/app/lib/i18n.ts`
- **Language switching** integrated into settings store

### Workspace Structure

#### Apps
- `apps/web/` - Next.js 15 unified web application
  - `app/` - Next.js pages, layouts, and API routes
    - `(web)/` - Public pages (landing page)
    - `(auth)/` - Authentication pages
    - `(protected)/` - Protected dashboard pages
    - `api/` - API route handlers
    - `components/` - UI components
    - `hooks/` - Custom React hooks (settings management)
    - `lib/` - Utilities, auth, database, and theme logic
    - `locales/` - Translation files
  - `middleware.ts` - Next.js middleware for auth
  - `prisma/` - Database schema and migrations
  - `public/` - Static assets and PWA files

#### Packages (Minimal)
- `packages/config/` - Shared tool configurations
- `packages/types/` - Shared API types only

### Configuration Notes

#### Web App Configuration
- **ESLint and TypeScript errors ignored during builds** for flexible development
- **Images unoptimized** for deployment flexibility
- **shadcn/ui configuration** with neutral base color
- **Path aliases** configured for clean imports (@/components, @/lib, etc.)
- **Tailwind config extends** shared configuration from `@boilerplate/config`
- **PWA support** with next-pwa configuration
- **Vercel deployment** optimized with vercel.json

#### Turborepo Configuration
- **Pipeline tasks**: build, dev, lint, type-check, test, clean
- **Dependency management** with proper task ordering
- **Caching enabled** for build outputs and lint results
- **Workspace dependencies** properly configured

### Development Patterns (Simplified)
- **Single domain architecture** - no CORS complexity
- **Minimal workspace dependencies** - only essential shared packages
- **Shared configs** centralized in `@boilerplate/config`
- **Type safety** with local types and shared API types
- **Direct component imports** - no build step needed
- **Settings persistence** with error handling
- **Same-origin API communication** - no cross-domain requests

### Getting Started
1. Install dependencies: `pnpm install`
2. Start database: `make db-up`
3. Start development: `pnpm dev` (starts web application)
4. Build all: `pnpm build`
5. Web App: http://localhost:3000

### Database Management

#### Docker-Compose Services
The project includes two containerized database services:

- **PostgreSQL Database** (`postgres`): Main database server on port 5432
- **Prisma Studio** (`prisma-studio`): Database GUI management tool on port 5555

#### Database Commands
```bash
# Database lifecycle
make db-up        # Start PostgreSQL database + run migrations
make db-down      # Stop database
make db-restart   # Restart database
make db-clean     # Remove database + volumes (⚠️ deletes data)

# Database management
make db-migrate   # Run migrations
make db-reset     # Reset database with fresh schema
make db-logs      # Show database logs

# Prisma Studio (GUI database management)
make db-studio           # Start local Prisma Studio (via pnpm)
make db-studio-up        # Start containerized Prisma Studio
make db-studio-down      # Stop containerized Prisma Studio  
make db-studio-logs      # Show Prisma Studio container logs

# Alternative commands (root level)
pnpm db:studio    # Local Prisma Studio
pnpm db:migrate   # Run migrations
pnpm db:generate  # Generate Prisma client
```

#### Database Access
- **PostgreSQL**: `postgresql://auth_user:auth_password@localhost:5432/auth_db`
- **Prisma Studio**: http://localhost:5555 (when running)
- **Container Studio**: http://localhost:5555 (containerized version)

### Deployment

#### Multi-Environment Vercel Deployment
This boilerplate supports automatic multi-environment deployment:

- **Production** (`main` branch): Auto-deploy to production domain
- **Staging** (`staging` branch): Auto-deploy to staging subdomain  
- **Development** (feature branches): Auto-deploy to preview URLs

**Key Benefits:**
- ✅ **Single domain** - No CORS configuration needed
- ✅ **Automatic environment detection** via `@packages/config/project.config.ts`
- ✅ **Database branching** with Neon PostgreSQL (recommended)
- ✅ **Enhanced security headers** in vercel.json
- ✅ **Debug page** at `/debug` for troubleshooting

**Setup:**
1. Set `DATABASE_URL` and `BETTER_AUTH_SECRET` in Vercel environment variables
2. Configure custom domain for production
3. Push to branches for automatic deployment

See `docs/vercel-deployment.md` for complete deployment guide.

#### Environment Configuration
The project automatically detects environments using:
- **Local development**: `NODE_ENV=development`
- **Vercel production**: `VERCEL_ENV=production` + `main` branch
- **Vercel staging**: `VERCEL_GIT_COMMIT_REF=staging`
- **Vercel preview**: All other branches

Configuration handled in `@packages/config/project.config.ts` with functions:
- `getEnvironmentType()` - Detect current environment
- `getWebUrl()` - Get appropriate URL for environment
- `getCurrentEnvironmentUrls()` - Get all environment URLs

### Debugging & Troubleshooting

#### Debug Page
Visit `/debug` in any environment for:
- Environment detection status
- Session and authentication information  
- Cookie inspection
- API health checks
- Configuration verification (non-sensitive)

#### Common Issues
- **Authentication problems**: Check `/debug` for session and cookie status
- **Environment detection**: Verify VERCEL_ENV and branch name
- **Database issues**: Check API health at `/api/health`

### Why This Single Web App Structure?
- **No CORS issues** - Same origin for frontend and API
- **Simplified deployment** - One Vercel project instead of two
- **Better performance** - No cross-origin requests
- **Shared authentication** - Cookies work seamlessly across app and API
- **Easier maintenance** - Single codebase to manage
- **Cost effective** - Single project billing on Vercel
```