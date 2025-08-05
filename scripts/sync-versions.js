#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Package.json files to sync
const packagesToSync = [
  'apps/web/package.json',
  'packages/config/package.json',
  'packages/types/package.json',
];

function getVersionFromConfig() {
  try {
    const configPath = path.join(__dirname, '../packages/config/project.config.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');
    const versionMatch = configContent.match(/version:\s*["']([^"']+)["']/);
    
    if (!versionMatch) {
      throw new Error('Could not find version in project config');
    }
    
    return versionMatch[1];
  } catch (error) {
    console.error('❌ Error reading config version:', error.message);
    process.exit(1);
  }
}

function syncPackageVersion(packagePath, newVersion) {
  const fullPath = path.join(__dirname, '..', packagePath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  Package not found: ${packagePath}`);
    return false;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    
    // Update version if it exists
    if (packageJson.version) {
      const oldVersion = packageJson.version;
      packageJson.version = newVersion;
      
      // Write back to file with proper formatting
      fs.writeFileSync(fullPath, JSON.stringify(packageJson, null, 2) + '\n');
      console.log(`✅ Updated ${packagePath}: ${oldVersion} -> ${newVersion}`);
      return true;
    } else {
      console.warn(`⚠️  No version field in ${packagePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${packagePath}:`, error.message);
    return false;
  }
}

function main() {
  try {
    const configVersion = getVersionFromConfig();
    console.log(`Syncing all packages to version: ${configVersion}`);
    console.log('');
    
    let successCount = 0;
    let totalCount = 0;
    
    packagesToSync.forEach(packagePath => {
      totalCount++;
      if (syncPackageVersion(packagePath, configVersion)) {
        successCount++;
      }
    });
    
    console.log('');
    console.log(`✅ Sync complete: ${successCount}/${totalCount} packages updated`);
    
    if (successCount < totalCount) {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error syncing versions:', error.message);
    process.exit(1);
  }
}

main();