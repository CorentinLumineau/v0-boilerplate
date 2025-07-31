# V0 Boilerplate

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://boilerplate.lumineau.app)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-red?style=for-the-badge&logo=turborepo)](https://turbo.build)

A production-ready **Next.js 15** monorepo boilerplate with comprehensive authentication, theming, internationalization, and modern development tools. Built with TypeScript and designed for rapid project bootstrapping.

## 🌟 Key Features

### 🔐 **Authentication System**
- **Better-auth** integration with Next.js 15 server actions
- Cross-subdomain cookie support for production deployments
- Layout-based route protection for optimal performance
- Session management with TanStack Query optimization

### 🎨 **Advanced Theming**
- **8 pre-built color themes** (default, red, orange, green, blue, teal, purple, pink)
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

### 🏗️ **Monorepo Architecture**
- **Turborepo** for optimized build orchestration
- **pnpm workspaces** with workspace protocol
- Shared packages for types, configs, and utilities
- Centralized configuration management

### 🛠️ **Developer Experience**
- **Automated project setup script** for instant bootstrapping
- **TanStack Query** for server state management
- **Radix UI** primitives for accessible components
- **Tailwind CSS** with shadcn/ui component system
- **Prisma ORM** with PostgreSQL database
- **ESLint** and **TypeScript** strict configuration
- Hot reload and fast refresh in development

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **pnpm 10.10.0+**
- **PostgreSQL** (via Docker or local installation)

### Installation

#### Option 1: Automated Setup (Recommended)

1. **Clone and run the setup script**
   ```bash
   git clone <repository-url>
   cd v0-boilerplate
   pnpm install
   npx tsx scripts/setup-project.ts
   ```

   The setup script will:
   - Configure project metadata and branding
   - Set up database credentials and environment files
   - Update package.json files with your project details
   - Configure Docker containers and networking
   - Generate secure authentication secrets
   - Update all configuration files automatically

#### Option 2: Manual Setup

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd v0-boilerplate
   pnpm install
   ```

2. **Set up the database**
   ```bash
   # Start PostgreSQL with Docker
   docker run --name v0-boilerplate-postgres \
     -e POSTGRES_USER=auth_user \
     -e POSTGRES_PASSWORD=auth_password \
     -e POSTGRES_DB=auth_db \
     -p 5432:5432 -d postgres:16-alpine
   
   # Run database migrations
   pnpm --filter @boilerplate/backend db:migrate
   ```

3. **Start development servers**
   ```bash
   pnpm dev
   ```

4. **Access the applications**
   - **Frontend**: http://localhost:3100
   - **Backend API**: http://localhost:3101

## 🏢 Architecture Overview

### Monorepo Structure
```
v0-boilerplate/
├── apps/
│   ├── frontend/          # Next.js 15 client application
│   └── backend/           # Next.js 15 API server
├── packages/
│   ├── config/            # Shared configurations
│   └── types/             # Shared TypeScript types
├── package.json           # Root workspace configuration
└── turbo.json            # Turborepo configuration
```

### Technology Stack

#### **Frontend (`apps/frontend`)**
- **Next.js 15** with App Router and React 19
- **TanStack Query** for server state management
- **Tailwind CSS** with shadcn/ui components
- **Radix UI** primitives for accessibility
- **next-themes** for theme management
- **next-pwa** for Progressive Web App features

#### **Backend (`apps/backend`)**
- **Next.js 15** with API Routes
- **Better-auth** for authentication
- **Prisma ORM** with PostgreSQL
- **Server-Sent Events** for real-time features

#### **Shared Packages**
- **`@boilerplate/config`** - ESLint, Tailwind, TypeScript, and project configs
- **`@boilerplate/types`** - Shared TypeScript interfaces and types

## 🎯 Key Features in Detail

### Authentication Flow
- **Layout-based protection** eliminates per-page auth checks
- **Cross-domain cookie support** for production deployments
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
pnpm dev          # Start all development servers
pnpm build        # Build all applications and packages
pnpm lint         # Lint all code
pnpm type-check   # TypeScript type checking
pnpm test         # Run all tests
pnpm clean        # Clean build outputs
```

### Individual Applications
```bash
pnpm --filter @boilerplate/frontend dev    # Frontend only
pnpm --filter @boilerplate/backend dev     # Backend only
```

### Database Operations
```bash
pnpm --filter @boilerplate/backend db:migrate    # Run migrations
pnpm --filter @boilerplate/backend db:generate   # Generate Prisma client
pnpm --filter @boilerplate/backend db:studio     # Open Prisma Studio
```

## 🌐 Deployment

### Vercel Deployment

The project is optimized for Vercel with separate frontend and backend deployments:

1. **Frontend**: [boilerplate.lumineau.app](https://boilerplate.lumineau.app)
2. **Backend API**: [api.boilerplate.lumineau.app](https://api.boilerplate.lumineau.app)

### Environment Variables

**Frontend (`.env.local`)**
```env
NEXT_PUBLIC_BACKEND_URL=https://api.boilerplate.lumineau.app
```

**Backend (`.env`)**
```env
DATABASE_URL=your_postgresql_connection_string
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=https://api.boilerplate.lumineau.app
```

## 🛡️ Security Features

- **CORS configuration** for cross-origin requests
- **Helmet.js** for security headers
- **Environment variable validation**
- **Secure cookie configuration** for production
- **CSRF protection** with Better-auth

## 🎨 Customization

### 🚀 **Project Setup Script**

This boilerplate includes a comprehensive setup script that automates project configuration:

```bash
npx tsx scripts/setup-project.ts
```

**What it does:**
- **Project Branding**: Updates names, descriptions, and metadata
- **Database Configuration**: Sets up PostgreSQL credentials and connection strings
- **Environment Files**: Generates `.env` files with secure secrets
- **Package Namespaces**: Updates all package.json files with your project namespace
- **Docker Setup**: Configures container names and networking
- **PWA Manifest**: Updates app metadata for Progressive Web App features
- **Documentation**: Updates setup guides and README with your project details

**Interactive Configuration:**
- Project name and description
- Author information and repository URL
- Database credentials (auto-generated or custom)
- Development and production URLs
- Secure authentication secrets (auto-generated)

### Adding New Themes
1. Add theme colors to `themeColors` object in `apps/frontend/components/settings/color-theme-selector.tsx`
2. Update available themes in `packages/config/project.config.ts`
3. Theme will automatically appear in the settings panel

### Adding New Languages
1. Create translation files in `apps/frontend/locales/`
2. Update i18n configuration in `apps/frontend/lib/i18n.ts`
3. Update supported locales in project config

### Extending the API
1. Add new routes in `apps/backend/app/api/`
2. Update Prisma schema for database changes
3. Generate types in `@boilerplate/types`

## 📖 Documentation

- **Component Documentation**: Built with Storybook (coming soon)
- **Type Documentation**: Auto-generated from TypeScript interfaces

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
- **Vercel** for deployment platform
- **Better-auth** for authentication solution
- **Radix UI** for accessible component primitives
- **shadcn/ui** for beautiful component designs

---

**Ready to build something amazing?** 🚀

Start with `pnpm dev` and customize this boilerplate to match your project needs!