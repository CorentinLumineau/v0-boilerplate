# V0 Boilerplate Makefile
# Commands for managing the development environment

# Load environment variables from .env.project if it exists
ifneq (,$(wildcard .env.project))
    include .env.project
    export
endif

# Default database configuration (fallback values)
DB_USER ?= auth_user
DB_PASSWORD ?= auth_password
DB_NAME ?= auth_db
PROJECT_NAME ?= boilerplate

# Construct DATABASE_URL from environment variables
DATABASE_URL := postgresql://$(DB_USER):$(DB_PASSWORD)@localhost:5432/$(DB_NAME)

.PHONY: all help db-up db-down db-restart db-logs db-clean db-migrate db-migrate-deploy db-migrate-reset db-studio dev dev-backend dev-frontend build install clean version-patch version-minor version-major version-sync release-patch release-minor release-major

# Default target - show help
help:
	@echo "Available commands:"
	@echo "  make all          - Complete setup: install dependencies + start database"
	@echo "  make db-up        - Start PostgreSQL database"
	@echo "  make db-up-all    - Start PostgreSQL database + Prisma Studio"
	@echo "  make db-down      - Stop PostgreSQL database"
	@echo "  make db-down-all  - Stop all database services"
	@echo "  make db-restart   - Restart PostgreSQL database"
	@echo "  make db-logs      - Show database logs"
	@echo "  make db-clean     - Remove database container and volumes"
	@echo "  make db-migrate   - Run database migrations (development)"
	@echo "  make db-migrate-deploy - Deploy migrations (production)"
	@echo "  make db-migrate-reset  - Reset database with fresh migrations"
	@echo "  make db-studio    - Open Prisma Studio for database management"
	@echo "  make dev          - Start all development servers"
	@echo "  make dev-web      - Start web application development server"
	@echo "  make build        - Build all apps"
	@echo "  make install      - Install all dependencies"
	@echo "  make clean        - Clean build outputs"
	@echo ""
	@echo "Database Configuration:"
	@echo "  DB_USER: $(DB_USER)"
	@echo "  DB_NAME: $(DB_NAME)"
	@echo "  DATABASE_URL: $(DATABASE_URL)"
	@echo ""
	@echo "Version Management:"
	@echo "  make version-patch   - Increment patch version (1.0.0 -> 1.0.1)"
	@echo "  make version-minor   - Increment minor version (1.0.0 -> 1.1.0)"
	@echo "  make version-major   - Increment major version (1.0.0 -> 2.0.0)"
	@echo "  make version-sync    - Sync all package.json versions with config"
	@echo ""
	@echo "Release Management:"
	@echo "  make release-patch   - Create patch release with git tag"
	@echo "  make release-minor   - Create minor release with git tag"
	@echo "  make release-major   - Create major release with git tag"

# Complete setup target
all: install db-up
	@echo "✅ Complete setup finished!"
	@echo "🚀 Run 'make dev' to start development servers"

# Database commands
db-up:
	@echo "Starting PostgreSQL database with docker compose..."
	@echo "Database configuration:"
	@echo "  User: $(DB_USER)"
	@echo "  Database: $(DB_NAME)"
	@echo "  Project: $(PROJECT_NAME)"
	@echo "Stopping any running containers and cleaning up networks..."
	@docker compose down 2>/dev/null || true
	@docker network rm $(PROJECT_NAME)-network 2>/dev/null || true
	@docker network rm app-network 2>/dev/null || true
	@echo "Starting fresh database setup..."
	docker compose up -d
	@echo "Database started! Waiting for it to be ready..."
	@sleep 5
	@echo "Running database migrations..."
	DATABASE_URL="$(DATABASE_URL)" pnpm --filter @boilerplate/web db:migrate

db-down:
	@echo "Stopping PostgreSQL database..."
	docker compose down
	@echo "Database stopped!"

db-restart: db-down db-up

db-logs:
	@echo "Showing database logs..."
	docker compose logs -f postgres

db-clean:
	@echo "Cleaning database (this will delete all data)..."
	docker compose down -v
	@echo "Cleaning up Docker networks..."
	@docker network rm $(PROJECT_NAME)-network 2>/dev/null || true
	@docker network rm app-network 2>/dev/null || true
	@echo "Database cleaned!"

db-migrate:
	@echo "Running database migrations (development)..."
	@echo "Using DATABASE_URL: $(DATABASE_URL)"
	DATABASE_URL="$(DATABASE_URL)" pnpm --filter @boilerplate/web db:migrate
	@echo "Migrations completed!"

db-migrate-deploy:
	@echo "Deploying database migrations (production)..."
	@echo "Using DATABASE_URL: $(DATABASE_URL)"
	DATABASE_URL="$(DATABASE_URL)" pnpm --filter @boilerplate/web db:migrate
	@echo "Migrations deployed!"

db-migrate-reset:
	@echo "⚠️  Resetting database with fresh migrations (this will delete all data)..."
	@echo "Using DATABASE_URL: $(DATABASE_URL)"
	@read -p "Are you sure? Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ]
	DATABASE_URL="$(DATABASE_URL)" pnpm --filter @boilerplate/web db:migrate:reset
	@echo "Database reset completed!"

db-studio:
	@echo "Opening Prisma Studio for database management..."
	@echo "Prisma Studio will open in your browser at http://localhost:5555"
	@echo "Using DATABASE_URL: $(DATABASE_URL)"
	DATABASE_URL="$(DATABASE_URL)" pnpm --filter @boilerplate/web db:studio

# Development commands
dev:
	@echo "Starting all development servers..."
	pnpm dev

dev-web:
	@echo "Starting web application development server..."
	pnpm --filter @boilerplate/web dev

# Build commands
build:
	@echo "Building all apps..."
	pnpm build

install:
	@echo "Installing dependencies..."
	pnpm install

clean:
	@echo "Cleaning build outputs..."
	pnpm clean

# Quick setup for new developers
setup: install db-up
	@echo "Setup complete! Run 'make dev' to start development."

# Version Management Commands
CURRENT_VERSION := $(shell node -e "const config = require('./packages/config/project.config.ts'); console.log(config.PROJECT_CONFIG.version)" 2>/dev/null || echo "1.0.0")

version-patch: ## Increment patch version
	@echo "Current version: $(CURRENT_VERSION)"
	@echo "Updating patch version..."
	@node scripts/update-version.js patch
	@$(MAKE) version-sync
	@echo "✅ Patch version updated successfully"

version-minor: ## Increment minor version
	@echo "Current version: $(CURRENT_VERSION)"
	@echo "Updating minor version..."
	@node scripts/update-version.js minor
	@$(MAKE) version-sync
	@echo "✅ Minor version updated successfully"

version-major: ## Increment major version
	@echo "Current version: $(CURRENT_VERSION)"
	@echo "Updating major version..."
	@node scripts/update-version.js major
	@$(MAKE) version-sync
	@echo "✅ Major version updated successfully"

version-sync: ## Sync all package.json versions with config
	@echo "Syncing package versions..."
	@node scripts/sync-versions.js
	@echo "✅ All package versions synced"

# Release Management Commands
release-patch: version-patch ## Create patch release with git tag
	@$(MAKE) _create-release

release-minor: version-minor ## Create minor release with git tag
	@$(MAKE) _create-release

release-major: version-major ## Create major release with git tag
	@$(MAKE) _create-release

_create-release:
	@NEW_VERSION=$$(node -e "const config = require('./packages/config/project.config.ts'); console.log(config.PROJECT_CONFIG.version)" 2>/dev/null || echo "1.0.0"); \
	echo "Creating release v$$NEW_VERSION..."; \
	git add .; \
	git commit -m "chore: release v$$NEW_VERSION" || echo "Nothing to commit"; \
	git tag "v$$NEW_VERSION"; \
	echo "✅ Release v$$NEW_VERSION created. Push with: git push origin main --tags"