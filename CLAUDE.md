# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

This is a **Turborepo monorepo** with the following **simplified** structure:

```
/
├── apps/
│   ├── frontend/          # Next.js 15 application (contains all UI components)
│   └── backend/           # Next.js 15 API server
├── packages/
│   ├── config/            # Shared configurations (ESLint, Tailwind, TypeScript)
│   └── types/             # Shared API types only
├── package.json           # Root workspace configuration
└── turbo.json            # Turborepo configuration
```

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
- `pnpm --filter @boilerplate/frontend dev` - Start only frontend
- `pnpm --filter @boilerplate/backend dev` - Start only backend

### Package Management
- Uses `pnpm` workspaces with `pnpm@10.10.0`
- Workspace dependencies use `workspace:*` protocol
- Turborepo handles task orchestration and caching

## Architecture Overview

This is a **full-stack TypeScript monorepo** with comprehensive theming and internationalization.

### Key Technologies

#### Frontend (apps/frontend)
- **Next.js 15** with App Router and React 19
- **TypeScript** with strict configuration
- **Tailwind CSS** with shadcn/ui components
- **next-themes** for dark/light mode switching
- **Radix UI** primitives for accessible components
- **Lucide React** for icons

#### Backend (apps/backend)
- **Next.js 15** with API Routes
- **TypeScript** with full-stack support
- **Built-in CORS** via middleware
- **Environment variables** support

#### Shared Packages (Minimal)
- **@boilerplate/config** - Shared ESLint, Tailwind, and TypeScript configs
- **@boilerplate/types** - Shared API types between frontend and backend

### Core Architecture Patterns

#### Theme System (Frontend)
The frontend features a sophisticated theming system:
- **42 color themes** defined in `apps/frontend/lib/theme/` (from amber to zinc)
- **Dynamic theme switching** via CSS custom properties
- **Radius customization** with 5 preset values (0 to 1.0rem)
- **Base theme structure** defining color tokens
- **Shared theme types** in `@boilerplate/types`

#### Settings Management (Frontend)
- **Context-based settings store** in `apps/frontend/hooks/use-settings-store.tsx`
- **Specialized hooks** for theme and language settings
- **localStorage persistence** for user preferences
- **Memoized setters** to prevent unnecessary re-renders

#### Component Architecture (Simplified)
- **All UI components** in `apps/frontend/components/` using Radix UI primitives
- **Layout components**: Sidebar, Header with user dropdown
- **Settings panel**: Color theme selector, radius selector
- **Shared utilities**: `apps/frontend/lib/utils.ts`

#### API Architecture (Backend)
- **Next.js API Routes** at `/api/*`
- **Health check endpoint** at `/api/health`
- **CORS middleware** for frontend communication
- **Built-in TypeScript support**

#### Internationalization
- **Two languages supported**: English and French
- **Translation files** in `apps/frontend/locales/`
- **i18n utilities** in `apps/frontend/lib/i18n.ts`
- **Language switching** integrated into settings store

### Workspace Structure

#### Apps
- `apps/frontend/` - Next.js 15 application with App Router
  - `app/` - Next.js pages and layouts
  - `components/` - App-specific components
  - `hooks/` - Custom React hooks (settings management)
  - `lib/` - App-specific utilities and theme logic
  - `locales/` - Translation files
  - `styles/` - Global CSS styles

- `apps/backend/` - Next.js 15 API server
  - `app/api/` - API route handlers
  - `middleware.ts` - Next.js middleware
  - `app/page.tsx` - Backend documentation page

#### Packages (Minimal)
- `packages/config/` - Shared tool configurations
- `packages/types/` - Shared API types only

### Configuration Notes

#### Frontend Configuration
- **ESLint and TypeScript errors ignored during builds** for flexible development
- **Images unoptimized** for deployment flexibility
- **shadcn/ui configuration** with neutral base color
- **Path aliases** configured for clean imports (@/components, @/lib, etc.)
- **Tailwind config extends** shared configuration from `@boilerplate/config`

#### Backend Configuration
- **Next.js 15** with TypeScript support
- **Environment variables** in `.env` files
- **CORS configured** via middleware
- **Development mode** with Next.js dev server

#### Turborepo Configuration
- **Pipeline tasks**: build, dev, lint, type-check, test, clean
- **Dependency management** with proper task ordering
- **Caching enabled** for build outputs and lint results
- **Workspace dependencies** properly configured

### Development Patterns (Simplified)
- **Minimal workspace dependencies** - only essential shared packages
- **Shared configs** centralized in `@boilerplate/config`
- **Type safety** with local types and shared API types
- **Direct component imports** - no build step needed
- **Settings persistence** with error handling in frontend
- **API communication** between Next.js apps

### Getting Started
1. Install dependencies: `pnpm install`
2. Start development: `pnpm dev` (starts both Next.js apps)
3. Build all: `pnpm build`
4. Frontend: http://localhost:3100
5. Backend API: http://localhost:3101

### Why This Simplified Structure?
- **Faster development** - No build step for UI components
- **Easier debugging** - Direct component access
- **Simpler onboarding** - Less complexity for new developers
- **Future flexibility** - Easy to extract packages when you need multiple frontends