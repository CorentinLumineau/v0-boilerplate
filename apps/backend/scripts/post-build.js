#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create .next directory if it doesn't exist
const nextDir = path.join(__dirname, '../.next');
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir, { recursive: true });
}

// Create export-detail.json to prevent Vercel file tracing errors
const exportDetailPath = path.join(nextDir, 'export-detail.json');
fs.writeFileSync(exportDetailPath, '{}');
console.log('✓ Created export-detail.json for Vercel compatibility');

console.log('✓ Post-build tasks completed');