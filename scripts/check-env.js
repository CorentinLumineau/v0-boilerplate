#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(process.cwd(), 'apps/web/.env');
  const envLocalPath = path.join(process.cwd(), 'apps/web/.env.local');
  
  let envFile = null;
  if (fs.existsSync(envLocalPath)) {
    envFile = envLocalPath;
  } else if (fs.existsSync(envPath)) {
    envFile = envPath;
  }
  
  if (envFile) {
    const envContent = fs.readFileSync(envFile, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          envVars[key] = value;
        }
      }
    });
    
    // Set environment variables
    Object.entries(envVars).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }
}

// Required environment variables for the application
const requiredEnvVars = {
  'DATABASE_URL': 'Database connection string (e.g., postgresql://user:pass@localhost:5432/db)',
  'AUTH_SECRET': 'Secret key for authentication (generate with: openssl rand -base64 32)',
  'AUTH_URL': 'Base URL for authentication (e.g., http://localhost:3000)',
};

// Optional but recommended environment variables
const optionalEnvVars = {
  'NEXTAUTH_URL': 'NextAuth.js URL (e.g., http://localhost:3000)',
  'NEXTAUTH_SECRET': 'NextAuth.js secret (generate with: openssl rand -base64 32)',
  'GOOGLE_CLIENT_ID': 'Google OAuth client ID',
  'GOOGLE_CLIENT_SECRET': 'Google OAuth client secret',
  'GITHUB_CLIENT_ID': 'GitHub OAuth client ID',
  'GITHUB_CLIENT_SECRET': 'GitHub OAuth client secret',
};

function checkEnvFile() {
  const envPath = path.join(process.cwd(), 'apps/web/.env');
  const envLocalPath = path.join(process.cwd(), 'apps/web/.env.local');
  
  if (fs.existsSync(envPath)) {
    console.log('✅ Found .env file');
    return envPath;
  } else if (fs.existsSync(envLocalPath)) {
    console.log('✅ Found .env.local file');
    return envLocalPath;
  } else {
    console.log('❌ No .env or .env.local file found');
    return null;
  }
}

function checkEnvironmentVariables() {
  const missing = [];
  const present = [];
  
  // Check required variables
  for (const [varName, description] of Object.entries(requiredEnvVars)) {
    if (process.env[varName]) {
      present.push(`✅ ${varName}`);
    } else {
      missing.push(`❌ ${varName}: ${description}`);
    }
  }
  
  // Check optional variables
  for (const [varName, description] of Object.entries(optionalEnvVars)) {
    if (process.env[varName]) {
      present.push(`✅ ${varName} (optional)`);
    } else {
      present.push(`⚠️  ${varName} (optional): ${description}`);
    }
  }
  
  return { missing, present };
}

function main() {
  console.log('🔍 Checking environment variables...\n');
  
  // Load environment variables from .env file
  loadEnvFile();
  
  const envFile = checkEnvFile();
  const { missing, present } = checkEnvironmentVariables();
  
  console.log('\n📋 Environment Variables Status:');
  console.log('================================');
  
  present.forEach(item => console.log(item));
  
  if (missing.length > 0) {
    console.log('\n❌ Missing Required Environment Variables:');
    console.log('==========================================');
    missing.forEach(item => console.log(item));
    
    console.log('\n📝 To fix this:');
    console.log('1. Create a .env file in apps/web/ directory');
    console.log('2. Add the missing environment variables');
    console.log('3. For development, you can use these example values:');
    console.log('');
    console.log('   DATABASE_URL="postgresql://auth_user:auth_password@localhost:5432/auth_db"');
    console.log('   AUTH_SECRET="your-secret-key-here"');
    console.log('   AUTH_URL="http://localhost:3000"');
    console.log('');
    console.log('4. Start the database with: docker-compose up -d');
    
    process.exit(1);
  } else {
    console.log('\n✅ All required environment variables are set!');
    console.log('\n💡 For development, make sure your database is running:');
    console.log('   docker-compose up -d');
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkEnvironmentVariables, checkEnvFile }; 