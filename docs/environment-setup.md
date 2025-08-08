# Environment Setup Guide

This guide will help you set up the required environment variables for the boilerplate project.

## Quick Setup

1. **Copy the example environment file:**
   ```bash
   cp apps/web/.env.example apps/web/.env
   ```

2. **Start the database:**
   ```bash
   docker-compose up -d
   ```

3. **Check your environment:**
   ```bash
   pnpm check-env
   ```

## Required Environment Variables

### Database Configuration
- `DATABASE_URL`: PostgreSQL connection string
  ```
  DATABASE_URL="postgresql://auth_user:auth_password@localhost:5432/auth_db"
  ```

### Authentication
- `AUTH_SECRET`: Secret key for authentication (generate with `openssl rand -base64 32`)
  ```
  AUTH_SECRET="your-generated-secret-key-here"
  ```
- `AUTH_URL`: Base URL for authentication
  ```
  AUTH_URL="http://localhost:3000"
  ```

## Optional Environment Variables

### NextAuth.js (if using)
- `NEXTAUTH_URL`: NextAuth.js URL
- `NEXTAUTH_SECRET`: NextAuth.js secret

### OAuth Providers
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GITHUB_CLIENT_ID`: GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth client secret

## Development Setup

1. **Create your environment file:**
   ```bash
   # In apps/web/ directory
   touch .env
   ```

2. **Add the minimum required variables:**
   ```bash
   # apps/web/.env
   DATABASE_URL="postgresql://auth_user:auth_password@localhost:5432/auth_db"
   AUTH_SECRET="your-secret-key-here"
   AUTH_URL="http://localhost:3000"
   ```

3. **Start the database:**
   ```bash
   docker-compose up -d
   ```

4. **Verify setup:**
   ```bash
   pnpm check-env
   ```

## Production Setup

For production, make sure to:

1. Use strong, unique secrets
2. Set proper database URLs
3. Configure OAuth providers if needed
4. Set `NODE_ENV=production`

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `docker-compose ps`
- Check database logs: `docker-compose logs postgres`
- Verify connection string format

### Authentication Issues
- Generate a new secret: `openssl rand -base64 32`
- Ensure `AUTH_URL` matches your application URL
- Check that secrets are properly set

### Build Failures
- Run `pnpm check-env` to verify environment variables
- Ensure database is running for full builds
- Use `pnpm build` for builds without database operations

## Environment File Locations

The application looks for environment files in this order:
1. `apps/web/.env.local` (highest priority)
2. `apps/web/.env`
3. System environment variables

## Security Notes

- Never commit `.env` files to version control
- Use different secrets for development and production
- Rotate secrets regularly in production
- Use environment-specific configuration files 