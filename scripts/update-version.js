#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function incrementVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid version type: ${type}. Use major, minor, or patch.`);
  }
}

function updateProjectConfig(newVersion) {
  const configPath = path.join(__dirname, '../packages/config/project.config.ts');
  let content = fs.readFileSync(configPath, 'utf8');
  
  // Replace the version using regex
  const versionRegex = /version:\s*["']([^"']+)["']/;
  content = content.replace(versionRegex, `version: "${newVersion}"`);
  
  fs.writeFileSync(configPath, content);
  console.log(`✅ Updated config version to ${newVersion}`);
}

function main() {
  const type = process.argv[2];
  
  if (!type || !['major', 'minor', 'patch'].includes(type)) {
    console.error('Usage: node update-version.js <major|minor|patch>');
    process.exit(1);
  }
  
  try {
    // Read current version from config
    const configPath = path.join(__dirname, '../packages/config/project.config.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');
    const versionMatch = configContent.match(/version:\s*["']([^"']+)["']/);
    
    if (!versionMatch) {
      throw new Error('Could not find version in project config');
    }
    
    const currentVersion = versionMatch[1];
    const newVersion = incrementVersion(currentVersion, type);
    
    console.log(`Updating version: ${currentVersion} -> ${newVersion}`);
    
    // Update the config file
    updateProjectConfig(newVersion);
    
    console.log(`✅ Version updated successfully!`);
    
  } catch (error) {
    console.error('❌ Error updating version:', error.message);
    process.exit(1);
  }
}

main();