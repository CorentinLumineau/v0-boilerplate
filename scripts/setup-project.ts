#!/usr/bin/env tsx
/**
 * Complete Project Setup Script
 * 
 * Run this script after cloning the template to fully setup your project.
 * Usage: npx tsx scripts/setup-project.ts
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, cpSync } from 'fs';
import { join } from 'path';
import * as readline from 'readline';
import { randomBytes } from 'crypto';

interface ProjectAnswers {
  name: string;
  displayName: string;
  description: string;
  authorName: string;
  authorEmail: string;
  authorUrl: string;
  repositoryUrl: string;
  homepageUrl: string;
  namespace: string;
  
  // Database configuration
  dbName: string;
  dbUser: string;
  dbPassword: string;
  
  // Development configuration
  frontendPort: string;
  backendPort: string;
  
  // Production configuration
  productionFrontendUrl: string;
  productionBackendUrl: string;
  
  // Staging configuration
  stagingFrontendUrl: string;
  stagingBackendUrl: string;
  
  // Security
  authSecret: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function generateSecretKey(): string {
  return randomBytes(64).toString('hex');
}

async function collectProjectInfo(): Promise<ProjectAnswers> {
  console.log('🚀 Welcome to the V0 Boilerplate Complete Setup!\n');
  console.log('This script will configure your entire project in one go.\n');

  // Project Information
  console.log('📋 PROJECT INFORMATION');
  const name = await question('Project name (kebab-case): ');
  const displayName = await question('Display name: ');
  const description = await question('Project description: ');
  
  // Author Information
  console.log('\n👤 AUTHOR INFORMATION');
  const authorName = await question('Author name: ');
  const authorEmail = await question('Author email: ');
  const authorUrl = await question('Author website (optional): ');
  
  // Repository Information
  console.log('\n🔗 REPOSITORY INFORMATION');
  const repositoryUrl = await question('Repository URL: ');
  const homepageUrl = await question('Homepage URL (optional): ');
  
  // Database Configuration
  console.log('\n🗄️  DATABASE CONFIGURATION');
  const dbName = await question(`Database name [${name}_db]: `) || `${name}_db`;
  const dbUser = await question(`Database user [${name}_user]: `) || `${name}_user`;
  const dbPassword = await question('Database password [auto-generated]: ') || randomBytes(16).toString('hex');
  
  // Development Configuration
  console.log('\n⚙️  DEVELOPMENT CONFIGURATION');
  const frontendPort = await question('Frontend port [3100]: ') || '3100';
  const backendPort = await question('Backend port [3101]: ') || '3101';
  
  // Production Configuration
  console.log('\n🌐 PRODUCTION CONFIGURATION');
  const productionFrontendUrl = await question('Production frontend URL (e.g., https://myapp.com): ');
  const productionBackendUrl = await question('Production backend URL (e.g., https://api.myapp.com): ');
  
  // Staging Configuration
  console.log('\n🎭 STAGING CONFIGURATION');
  const stagingFrontendUrl = await question('Staging frontend URL (e.g., https://myapp-staging.com): ');
  const stagingBackendUrl = await question('Staging backend URL (e.g., https://api.myapp-staging.com): ');
  
  // Security
  console.log('\n🔐 SECURITY CONFIGURATION');
  console.log('Generating secure authentication secret...');
  const authSecret = generateSecretKey();
  
  const namespace = `@${name}`;

  return {
    name,
    displayName,
    description,
    authorName,
    authorEmail,
    authorUrl,
    repositoryUrl,
    homepageUrl,
    namespace,
    dbName,
    dbUser,
    dbPassword,
    frontendPort,
    backendPort,
    productionFrontendUrl,
    productionBackendUrl,
    stagingFrontendUrl,
    stagingBackendUrl,
    authSecret,
  };
}

function updateProjectConfig(answers: ProjectAnswers) {
  const configPath = join(process.cwd(), 'packages/config/project.config.ts');
  let config = readFileSync(configPath, 'utf-8');

  // Update basic info
  config = config.replace(/name: ".*?"/, `name: "${answers.name}"`);
  config = config.replace(/displayName: ".*?"/, `displayName: "${answers.displayName}"`);
  config = config.replace(/description: ".*?"/, `description: "${answers.description}"`);

  // Update author info
  config = config.replace(/name: "Your Name"/, `name: "${answers.authorName}"`);
  config = config.replace(/email: "your-email@example.com"/, `email: "${answers.authorEmail}"`);
  config = config.replace(/url: "https:\/\/your-website.com"/, `url: "${answers.authorUrl}"`);

  // Update URLs
  config = config.replace(/repository: ".*?"/, `repository: "${answers.repositoryUrl}"`);
  config = config.replace(/homepage: ".*?"/, `homepage: "${answers.homepageUrl}"`);

  // Update production URLs
  config = config.replace(/url: "https:\/\/boilerplate\.lumineau\.app"/, `url: "${answers.productionFrontendUrl}"`);
  config = config.replace(/url: "https:\/\/api\.boilerplate\.lumineau\.app"/, `url: "${answers.productionBackendUrl}"`);
  
  // Update staging URLs
  config = config.replace(/url: "https:\/\/boilerplate-staging\.lumineau\.app"/, `url: "${answers.stagingFrontendUrl}"`);
  config = config.replace(/url: "https:\/\/api\.boilerplate-staging\.lumineau\.app"/, `url: "${answers.stagingBackendUrl}"`);

  // Update namespace
  config = config.replace(/namespace: "@boilerplate"/, `namespace: "${answers.namespace}"`);

  // Update development configuration
  config = config.replace(/port: 3100/, `port: ${answers.frontendPort}`);
  config = config.replace(/url: "http:\/\/localhost:3100"/, `url: "http://localhost:${answers.frontendPort}"`);
  config = config.replace(/port: 3101/, `port: ${answers.backendPort}`);
  config = config.replace(/url: "http:\/\/localhost:3101"/, `url: "http://localhost:${answers.backendPort}"`);

  // Update database configuration
  config = config.replace(/name: "auth_db"/, `name: "${answers.dbName}"`);
  config = config.replace(/user: "auth_user"/, `user: "${answers.dbUser}"`);
  config = config.replace(/password: "auth_password"/, `password: "${answers.dbPassword}"`);

  // Update Docker container name
  config = config.replace(/containerName: "v0-boilerplate-postgres"/, `containerName: "${answers.name}-postgres"`);

  writeFileSync(configPath, config);
  console.log('✅ Updated packages/config/project.config.ts');
}

function updatePackageJson(answers: ProjectAnswers) {
  const rootPackagePath = join(process.cwd(), 'package.json');
  const rootPackage = JSON.parse(readFileSync(rootPackagePath, 'utf-8'));
  
  rootPackage.name = `${answers.name}-monorepo`;
  rootPackage.description = answers.description;
  rootPackage.author = {
    name: answers.authorName,
    email: answers.authorEmail,
    url: answers.authorUrl,
  };
  rootPackage.repository = {
    type: 'git',
    url: answers.repositoryUrl,
  };
  rootPackage.homepage = answers.homepageUrl;

  writeFileSync(rootPackagePath, JSON.stringify(rootPackage, null, 2));
  console.log('✅ Updated root package.json');

  // Update frontend package.json
  const frontendPackagePath = join(process.cwd(), 'apps/frontend/package.json');
  if (existsSync(frontendPackagePath)) {
    const frontendPackage = JSON.parse(readFileSync(frontendPackagePath, 'utf-8'));
    frontendPackage.name = `${answers.namespace}/frontend`;
    frontendPackage.description = `${answers.displayName} - Frontend Application`;
    writeFileSync(frontendPackagePath, JSON.stringify(frontendPackage, null, 2));
    console.log('✅ Updated frontend package.json');
  }

  // Update backend package.json
  const backendPackagePath = join(process.cwd(), 'apps/backend/package.json');
  if (existsSync(backendPackagePath)) {
    const backendPackage = JSON.parse(readFileSync(backendPackagePath, 'utf-8'));
    backendPackage.name = `${answers.namespace}/backend`;
    backendPackage.description = `${answers.displayName} - Backend API`;
    writeFileSync(backendPackagePath, JSON.stringify(backendPackage, null, 2));
    console.log('✅ Updated backend package.json');
  }
}

function updateDockerCompose(answers: ProjectAnswers) {
  const dockerComposePath = join(process.cwd(), 'docker-compose.yml');
  let dockerCompose = readFileSync(dockerComposePath, 'utf-8');

  // Update container name
  dockerCompose = dockerCompose.replace(/container_name: v0-boilerplate-postgres/, `container_name: ${answers.name}-postgres`);
  
  // Update database configuration
  dockerCompose = dockerCompose.replace(/POSTGRES_USER: auth_user/, `POSTGRES_USER: ${answers.dbUser}`);
  dockerCompose = dockerCompose.replace(/POSTGRES_PASSWORD: auth_password/, `POSTGRES_PASSWORD: ${answers.dbPassword}`);
  dockerCompose = dockerCompose.replace(/POSTGRES_DB: auth_db/, `POSTGRES_DB: ${answers.dbName}`);
  
  // Update health check
  dockerCompose = dockerCompose.replace(/pg_isready -U auth_user -d auth_db/, `pg_isready -U ${answers.dbUser} -d ${answers.dbName}`);
  
  // Update volume name
  dockerCompose = dockerCompose.replace(/name: v0-boilerplate-postgres-data/, `name: ${answers.name}-postgres-data`);
  
  // Update network name
  dockerCompose = dockerCompose.replace(/name: v0-boilerplate-network/g, `name: ${answers.name}-network`);
  dockerCompose = dockerCompose.replace(/- v0-boilerplate-network/, `- ${answers.name}-network`);
  dockerCompose = dockerCompose.replace(/v0-boilerplate-network:/, `${answers.name}-network:`);

  writeFileSync(dockerComposePath, dockerCompose);
  console.log('✅ Updated docker-compose.yml');
}

function createEnvironmentFiles(answers: ProjectAnswers) {
  // Create backend .env file
  const backendEnvPath = join(process.cwd(), 'apps/backend/.env');
  const databaseUrl = `postgresql://${answers.dbUser}:${answers.dbPassword}@localhost:5432/${answers.dbName}`;
  
  const backendEnvContent = `# Database Configuration
DATABASE_URL="${databaseUrl}"

# Authentication Configuration
BETTER_AUTH_SECRET="${answers.authSecret}"
BETTER_AUTH_URL="http://localhost:${answers.backendPort}"

# CORS Configuration
FRONTEND_URL="http://localhost:${answers.frontendPort}"

# Development Configuration (optional)
NODE_ENV="development"
DEBUG="1"
`;

  writeFileSync(backendEnvPath, backendEnvContent);
  console.log('✅ Created apps/backend/.env');

  // Create frontend .env.local file (optional)
  const frontendEnvPath = join(process.cwd(), 'apps/frontend/.env.local');
  const frontendEnvContent = `# Frontend Configuration (optional)
NEXT_PUBLIC_API_URL="http://localhost:${answers.backendPort}"

# Development Configuration
NODE_ENV="development"
`;

  writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Created apps/frontend/.env.local');

  // Create .env.project file for Docker Compose
  const projectEnvPath = join(process.cwd(), '.env.project');
  const projectEnvContent = `# Project configuration environment variables
# This file is generated from project.config.ts by the setup script
# These variables are used by docker-compose.yml

PROJECT_NAME=${answers.name}
DB_NAME=${answers.dbName}
DB_USER=${answers.dbUser}
DB_PASSWORD=${answers.dbPassword}
DB_PORT=5432
`;

  writeFileSync(projectEnvPath, projectEnvContent);
  console.log('✅ Created .env.project for Docker Compose');

  // Update .env.example files
  const backendEnvExamplePath = join(process.cwd(), 'apps/backend/.env.example');
  if (existsSync(backendEnvExamplePath)) {
    const exampleContent = `# Database Configuration
DATABASE_URL="postgresql://${answers.dbUser}:${answers.dbPassword}@localhost:5432/${answers.dbName}"

# Authentication Configuration
BETTER_AUTH_SECRET="your-super-secret-key-here"
BETTER_AUTH_URL="http://localhost:${answers.backendPort}"

# CORS Configuration
FRONTEND_URL="http://localhost:${answers.frontendPort}"

# Development Configuration (optional)
NODE_ENV="development"
DEBUG="1"
`;
    writeFileSync(backendEnvExamplePath, exampleContent);
    console.log('✅ Updated apps/backend/.env.example');
  }
}

function updateMakefile(answers: ProjectAnswers) {
  const makefilePath = join(process.cwd(), 'Makefile');
  let makefile = readFileSync(makefilePath, 'utf-8');

  // Update title comment
  makefile = makefile.replace(/# V0 Boilerplate Makefile/, `# ${answers.displayName} Makefile`);

  // Update db:push filter
  makefile = makefile.replace(/pnpm --filter @boilerplate\/backend/, `pnpm --filter ${answers.namespace}/backend`);

  writeFileSync(makefilePath, makefile);
  console.log('✅ Updated Makefile');
}

function updateManifestJson(answers: ProjectAnswers) {
  const manifestPath = join(process.cwd(), 'apps/frontend/public/manifest.json');
  
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    
    // Update app metadata
    manifest.name = answers.displayName;
    manifest.short_name = answers.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    manifest.description = answers.description;
    
    // Update start URL based on frontend URL
    if (answers.productionFrontendUrl) {
      manifest.start_url = new URL('/', answers.productionFrontendUrl).pathname;
    }
    
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Updated PWA manifest.json');
  }
}

function updateSetupGuide(answers: ProjectAnswers) {
  const setupPath = join(process.cwd(), 'SETUP.md');
  let setup = readFileSync(setupPath, 'utf-8');

  // Update title and descriptions
  setup = setup.replace(/This guide will help you bootstrap a new project using this Next\.js 15 monorepo template with authentication\./, 
    `This guide will help you set up ${answers.displayName}.`);
  
  // Update git clone example
  setup = setup.replace(/git clone <your-repo-url> my-new-project/, 
    `git clone ${answers.repositoryUrl} ${answers.name}`);
  setup = setup.replace(/cd my-new-project/, `cd ${answers.name}`);

  // Update package filter examples
  setup = setup.replace(/pnpm --filter @boilerplate\/backend/g, `pnpm --filter ${answers.namespace}/backend`);
  setup = setup.replace(/pnpm --filter @boilerplate\/frontend/g, `pnpm --filter ${answers.namespace}/frontend`);

  // Update port references
  setup = setup.replace(/localhost:3100/g, `localhost:${answers.frontendPort}`);
  setup = setup.replace(/localhost:3101/g, `localhost:${answers.backendPort}`);
  setup = setup.replace(/port 3100/g, `port ${answers.frontendPort}`);
  setup = setup.replace(/port 3101/g, `port ${answers.backendPort}`);

  // Update database configuration in setup guide
  setup = setup.replace(/postgresql:\/\/auth_user:auth_password@localhost:5432\/auth_db/, 
    `postgresql://${answers.dbUser}:${answers.dbPassword}@localhost:5432/${answers.dbName}`);

  writeFileSync(setupPath, setup);
  console.log('✅ Updated SETUP.md');
}

function displaySummary(answers: ProjectAnswers) {
  console.log('\n📋 PROJECT CONFIGURATION SUMMARY');
  console.log('==================================');
  console.log(`Project Name: ${answers.displayName}`);
  console.log(`Package Namespace: ${answers.namespace}`);
  console.log(`Repository: ${answers.repositoryUrl}`);
  console.log(`Author: ${answers.authorName} <${answers.authorEmail}>`);
  console.log('');
  console.log('🗄️  DATABASE:');
  console.log(`  Name: ${answers.dbName}`);
  console.log(`  User: ${answers.dbUser}`);
  console.log(`  Password: ${answers.dbPassword}`);
  console.log('');
  console.log('🌐 DEVELOPMENT URLS:');
  console.log(`  Frontend: http://localhost:${answers.frontendPort}`);
  console.log(`  Backend: http://localhost:${answers.backendPort}`);
  console.log(`  API Health: http://localhost:${answers.backendPort}/api/health`);
  console.log('');
  console.log('🌍 PRODUCTION URLS:');
  console.log(`  Frontend: ${answers.productionFrontendUrl}`);
  console.log(`  Backend: ${answers.productionBackendUrl}`);
  console.log('');
  console.log('🎭 STAGING URLS:');
  console.log(`  Frontend: ${answers.stagingFrontendUrl}`);
  console.log(`  Backend: ${answers.stagingBackendUrl}`);
  console.log('');
  console.log('🔐 SECURITY:');
  console.log(`  Auth Secret: ${answers.authSecret.substring(0, 16)}... (64 chars)`);
}

async function main() {
  try {
    const answers = await collectProjectInfo();
    
    console.log('\n🔧 Configuring your project...\n');
    
    updateProjectConfig(answers);
    updatePackageJson(answers);
    updateDockerCompose(answers);
    createEnvironmentFiles(answers);
    updateMakefile(answers);
    updateManifestJson(answers);
    updateSetupGuide(answers);
    
    displaySummary(answers);
    
    console.log('\n🎉 Complete setup finished successfully!');
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Run `pnpm install` to install dependencies');
    console.log('2. Run `make db-up` to start the database');
    console.log('3. Run `make dev` to start development servers');
    console.log(`4. Open http://localhost:${answers.frontendPort} in your browser`);
    console.log('5. Create your first account and start building!');
    console.log('');
    console.log('💡 OPTIONAL:');
    console.log('- Delete this setup script: rm scripts/setup-project.ts');
    console.log('- Commit your initial configuration: git add . && git commit -m "Initial project setup"');
    console.log('');
    console.log('📚 For more details, check the updated SETUP.md file.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();