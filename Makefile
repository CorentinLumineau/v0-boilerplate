# V0 Boilerplate Makefile
# Commands for managing the development environment

.PHONY: help db-up db-down db-restart db-logs db-clean dev dev-backend dev-frontend build install clean version-patch version-minor version-major version-sync release-patch release-minor release-major

# Default target
help:
	@echo "Available commands:"
	@echo "  make db-up        - Start PostgreSQL database"
	@echo "  make db-down      - Stop PostgreSQL database"
	@echo "  make db-restart   - Restart PostgreSQL database"
	@echo "  make db-logs      - Show database logs"
	@echo "  make db-clean     - Remove database container and volumes"
	@echo "  make dev          - Start all development servers"
	@echo "  make dev-backend  - Start only backend development server"
	@echo "  make dev-frontend - Start only frontend development server"
	@echo "  make build        - Build all apps"
	@echo "  make install      - Install all dependencies"
	@echo "  make clean        - Clean build outputs"
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

# Database commands
db-up:
	@echo "Starting PostgreSQL database with docker compose..."
	docker compose up -d
	@echo "Database started! Waiting for it to be ready..."
	@sleep 5
	@echo "Running database migrations..."
	pnpm --filter @boilerplate/backend db:push

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
	@echo "Database cleaned!"

# Development commands
dev:
	@echo "Starting all development servers..."
	pnpm dev

dev-backend:
	@echo "Starting backend development server..."
	pnpm --filter @boilerplate/backend dev

dev-frontend:
	@echo "Starting frontend development server..."
	pnpm --filter @boilerplate/frontend dev

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