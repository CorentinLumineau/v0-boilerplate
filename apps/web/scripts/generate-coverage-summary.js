#!/usr/bin/env node

/**
 * Coverage Summary Generator with @packages/testing Integration
 * 
 * Generates dynamic coverage summaries from Jest coverage data with
 * intelligent recommendations leveraging @packages/testing utilities.
 * 
 * Usage:
 *   node scripts/generate-coverage-summary.js
 *   node scripts/generate-coverage-summary.js --format json
 *   node scripts/generate-coverage-summary.js --help
 */

const fs = require('fs');
const path = require('path');

// Configuration
const COVERAGE_FILE = path.join(__dirname, '..', 'coverage', 'coverage-final.json');
const OUTPUT_FORMAT = process.argv.includes('--format') 
  ? process.argv[process.argv.indexOf('--format') + 1] 
  : 'markdown';

// Coverage thresholds for categorization
const THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 50,
  POOR: 0
};

// File priority mapping for recommendations with @packages/testing utilities
const PRIORITY_CONFIG = {
  // Quick Wins - High Impact, Low Effort (use @packages/testing helpers)
  'app/lib/utils.ts': { 
    priority: 'P1', effort: 'Very Low', impact: 'Medium', estimatedMinutes: 15,
    testingPackages: ['@boilerplate/testing'],
    helpers: ['createMockFn', 'waitForCondition'],
    template: 'utility'
  },
  'app/lib/i18n.ts': { 
    priority: 'P1', effort: 'Low', impact: 'Medium', estimatedMinutes: 30,
    testingPackages: ['@boilerplate/testing'],
    helpers: ['mockLocalStorage', 'createMockFn'],
    template: 'utility'
  },
  'app/api/health/route.ts': { 
    priority: 'P1', effort: 'Low', impact: 'High', estimatedMinutes: 20,
    testingPackages: ['@boilerplate/testing'],
    helpers: ['createMockRequest', 'testApiEndpoint', 'mockPrisma'],
    template: 'api'
  },

  // Authentication & Core - Use comprehensive testing utilities
  'app/lib/auth-client.ts': { 
    priority: 'P2', effort: 'Medium', impact: 'High', estimatedMinutes: 120,
    testingPackages: ['@boilerplate/testing', '@boilerplate/config'],
    helpers: ['customRender', 'createAuthHeaders', 'mockAuthSession', 'mockLocalStorage'],
    template: 'hook'
  },
  'app/lib/auth.ts': { 
    priority: 'P2', effort: 'Medium', impact: 'High', estimatedMinutes: 120,
    testingPackages: ['@boilerplate/testing', '@boilerplate/config'],
    helpers: ['mockAuthSession', 'createTestContext', 'mockPrisma'],
    template: 'config'
  },

  // Data Layer - Complex integration testing
  'app/lib/query-client.ts': { 
    priority: 'P3', effort: 'High', impact: 'Medium', estimatedMinutes: 180,
    testingPackages: ['@boilerplate/testing'],
    helpers: ['mockFetch', 'createMockFn', 'waitForCondition', 'mockConsole'],
    template: 'query'
  },
  'app/lib/queries/auth.ts': { 
    priority: 'P3', effort: 'High', impact: 'High', estimatedMinutes: 240,
    testingPackages: ['@boilerplate/testing', '@boilerplate/config'],
    helpers: ['mockPrisma', 'createMockDatabaseRecords', 'createTestContext', 'mockFetch'],
    template: 'query'
  },

  // Notifications - Full system integration
  'app/lib/queries/notifications.ts': { 
    priority: 'P4', effort: 'Very High', impact: 'High', estimatedMinutes: 360,
    testingPackages: ['@boilerplate/testing'],
    helpers: ['mockPrisma', 'createMockDatabaseRecords', 'testApiEndpoint', 'mockFetch', 'mockTimers'],
    template: 'complex-query'
  },

  // API Routes - Use comprehensive API testing utilities
  'app/api/notifications/route.ts': {
    priority: 'P4', effort: 'Very High', impact: 'Medium', estimatedMinutes: 300,
    testingPackages: ['@boilerplate/testing'],
    helpers: ['testApiEndpoint', 'mockPrisma', 'createAuthHeaders', 'createMockRequest'],
    template: 'api'
  },
  'app/api/notifications/[id]/route.ts': {
    priority: 'P4', effort: 'High', impact: 'Medium', estimatedMinutes: 240,
    testingPackages: ['@boilerplate/testing'],
    helpers: ['testApiEndpoint', 'mockPrisma', 'createAuthHeaders'],
    template: 'api'
  },
  'app/api/notifications/stream/route.ts': {
    priority: 'P5', effort: 'Very High', impact: 'Low', estimatedMinutes: 480,
    testingPackages: ['@boilerplate/testing'],
    helpers: ['mockTimers', 'testApiEndpoint', 'mockPrisma', 'waitForCondition'],
    template: 'streaming-api'
  },

  // Theme files - Simple constant testing
  'app/lib/theme/base.ts': { 
    priority: 'P2', effort: 'Very Low', impact: 'Low', estimatedMinutes: 10,
    testingPackages: ['@boilerplate/config'],
    helpers: [],
    template: 'constant'
  },
  'app/lib/theme/blue.ts': { 
    priority: 'P2', effort: 'Very Low', impact: 'Low', estimatedMinutes: 10,
    testingPackages: ['@boilerplate/config'],
    helpers: [],
    template: 'constant'
  },
  'app/lib/theme/default.ts': { 
    priority: 'P2', effort: 'Very Low', impact: 'Low', estimatedMinutes: 10,
    testingPackages: ['@boilerplate/config'],
    helpers: [],
    template: 'constant'
  }
};

function showHelp() {
  console.log(`
Coverage Summary Generator with @packages/testing Integration

Usage:
  node scripts/generate-coverage-summary.js [options]

Options:
  --format <type>           Output format: 'json', 'markdown', 'table' (default: markdown)
  --generate-test <file>    Generate test template for specific file using @packages/testing
  --help                   Show this help message

Examples:
  # Generate coverage summary
  node scripts/generate-coverage-summary.js
  node scripts/generate-coverage-summary.js --format json
  node scripts/generate-coverage-summary.js --format table
  
  # Generate test templates using @packages/testing utilities
  node scripts/generate-coverage-summary.js --generate-test app/lib/utils.ts
  node scripts/generate-coverage-summary.js --generate-test app/api/health/route.ts
  node scripts/generate-coverage-summary.js --generate-test app/lib/auth-client.ts

Features:
  ✅ Dynamic coverage analysis from Jest coverage data
  ✅ Prioritized recommendations with effort estimates  
  ✅ @packages/testing integration with helper suggestions
  ✅ @packages/config integration for shared configurations
  ✅ Template generation for different file types (API, hooks, utilities)
  ✅ Quick wins identification for immediate impact

Supported Templates:
  - utility:     Simple utility functions (uses createMockFn, waitForCondition)
  - api:         Next.js API routes (uses testApiEndpoint, mockPrisma, createAuthHeaders)
  - hook:        React hooks (uses customRender, mockLocalStorage, mockTimers)  
  - query:       React Query hooks (uses mockFetch, QueryClient setup)
  - config:      Configuration modules (uses @packages/config integration)
  - constant:    Theme and constant files (minimal testing setup)
`);
}

function loadCoverageData() {
  try {
    if (!fs.existsSync(COVERAGE_FILE)) {
      throw new Error(`Coverage file not found: ${COVERAGE_FILE}`);
    }
    
    const coverageData = JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf8'));
    return coverageData;
  } catch (error) {
    console.error('Error loading coverage data:', error.message);
    process.exit(1);
  }
}

function analyzeCoverage(coverageData) {
  const summary = {
    files: {},
    totals: {
      statements: { covered: 0, total: 0 },
      functions: { covered: 0, total: 0 },
      branches: { covered: 0, total: 0 }
    },
    categories: {
      excellent: [],
      good: [],
      poor: []
    }
  };

  for (const file in coverageData) {
    const fileCoverage = coverageData[file];
    const statements = fileCoverage.s;
    const functions = fileCoverage.f;
    const branches = fileCoverage.b;
    
    // Count covered/total for each metric
    const coveredStatements = Object.values(statements).filter(count => count > 0).length;
    const totalStatements = Object.keys(statements).length;
    
    const coveredFunctions = Object.values(functions).filter(count => count > 0).length;
    const totalFunctions = Object.keys(functions).length;
    
    const coveredBranches = Object.values(branches).flat().filter(count => count > 0).length;
    const totalBranches = Object.values(branches).flat().length;
    
    // Calculate percentages
    const stmtPct = totalStatements > 0 ? (coveredStatements / totalStatements * 100) : 0;
    const funcPct = totalFunctions > 0 ? (coveredFunctions / totalFunctions * 100) : 0;
    const branchPct = totalBranches > 0 ? (coveredBranches / totalBranches * 100) : 0;
    
    // Overall percentage (weighted average)
    const totalMetrics = totalStatements + totalFunctions + totalBranches;
    const coveredMetrics = coveredStatements + coveredFunctions + coveredBranches;
    const overallPct = totalMetrics > 0 ? (coveredMetrics / totalMetrics * 100) : 0;
    
    // Extract relative path
    const relativePath = file.replace('/home/clumineau@e-xpertsolutions.lan/Documents/Git/perso/boilerplate/apps/web/', '');
    
    const fileAnalysis = {
      path: relativePath,
      statements: { covered: coveredStatements, total: totalStatements, pct: stmtPct },
      functions: { covered: coveredFunctions, total: totalFunctions, pct: funcPct },
      branches: { covered: coveredBranches, total: totalBranches, pct: branchPct },
      overall: overallPct,
      priority: PRIORITY_CONFIG[relativePath] || { priority: 'P5', effort: 'Unknown', impact: 'Low', estimatedMinutes: 60 }
    };
    
    // Update totals
    summary.totals.statements.covered += coveredStatements;
    summary.totals.statements.total += totalStatements;
    summary.totals.functions.covered += coveredFunctions;
    summary.totals.functions.total += totalFunctions;
    summary.totals.branches.covered += coveredBranches;
    summary.totals.branches.total += totalBranches;
    
    // Categorize by coverage level
    if (overallPct >= THRESHOLDS.EXCELLENT) {
      summary.categories.excellent.push(fileAnalysis);
    } else if (overallPct >= THRESHOLDS.GOOD) {
      summary.categories.good.push(fileAnalysis);
    } else {
      summary.categories.poor.push(fileAnalysis);
    }
    
    summary.files[relativePath] = fileAnalysis;
  }
  
  // Calculate overall percentages
  summary.totals.statements.pct = summary.totals.statements.total > 0 
    ? (summary.totals.statements.covered / summary.totals.statements.total * 100) 
    : 0;
  summary.totals.functions.pct = summary.totals.functions.total > 0 
    ? (summary.totals.functions.covered / summary.totals.functions.total * 100) 
    : 0;
  summary.totals.branches.pct = summary.totals.branches.total > 0 
    ? (summary.totals.branches.covered / summary.totals.branches.total * 100) 
    : 0;
    
  // Overall coverage (weighted average)
  const totalAll = summary.totals.statements.total + summary.totals.functions.total + summary.totals.branches.total;
  const coveredAll = summary.totals.statements.covered + summary.totals.functions.covered + summary.totals.branches.covered;
  summary.totals.overall = totalAll > 0 ? (coveredAll / totalAll * 100) : 0;
  
  // Sort categories by priority and coverage
  summary.categories.excellent.sort((a, b) => b.overall - a.overall);
  summary.categories.good.sort((a, b) => b.overall - a.overall);
  summary.categories.poor.sort((a, b) => {
    const priorityOrder = { P1: 1, P2: 2, P3: 3, P4: 4, P5: 5 };
    return priorityOrder[a.priority.priority] - priorityOrder[b.priority.priority];
  });
  
  return summary;
}

function formatAsMarkdown(summary) {
  const { totals, categories } = summary;
  
  let output = `# Test Coverage Summary\n\n`;
  output += `**Generated**: ${new Date().toISOString()}\n\n`;
  
  // Overall summary
  output += `## Overall Coverage\n`;
  output += `**Total Coverage: ${totals.overall.toFixed(2)}%**\n\n`;
  output += `- **Statements**: ${totals.statements.pct.toFixed(2)}% (${totals.statements.covered}/${totals.statements.total})\n`;
  output += `- **Functions**: ${totals.functions.pct.toFixed(2)}% (${totals.functions.covered}/${totals.functions.total})\n`;
  output += `- **Branches**: ${totals.branches.pct.toFixed(2)}% (${totals.branches.covered}/${totals.branches.total})\n\n`;
  
  // Excellent coverage
  if (categories.excellent.length > 0) {
    output += `## 🟢 Excellent Coverage (≥90%)\n\n`;
    output += `| File | Overall | Statements | Functions | Branches |\n`;
    output += `|------|---------|------------|-----------|----------|\n`;
    categories.excellent.forEach(file => {
      output += `| \`${file.path}\` | ${file.overall.toFixed(1)}% | ${file.statements.pct.toFixed(1)}% | ${file.functions.pct.toFixed(1)}% | ${file.branches.pct.toFixed(1)}% |\n`;
    });
    output += `\n`;
  }
  
  // Good coverage
  if (categories.good.length > 0) {
    output += `## 🟡 Good Coverage (50-89%)\n\n`;
    output += `| File | Overall | Statements | Functions | Branches |\n`;
    output += `|------|---------|------------|-----------|----------|\n`;
    categories.good.forEach(file => {
      output += `| \`${file.path}\` | ${file.overall.toFixed(1)}% | ${file.statements.pct.toFixed(1)}% | ${file.functions.pct.toFixed(1)}% | ${file.branches.pct.toFixed(1)}% |\n`;
    });
    output += `\n`;
  }
  
  // Poor coverage with recommendations
  if (categories.poor.length > 0) {
    output += `## 🔴 Needs Improvement (<50%)\n\n`;
    output += `| File | Coverage | Priority | Effort | Impact | Est. Time |\n`;
    output += `|------|----------|----------|--------|--------|-----------|\n`;
    categories.poor.forEach(file => {
      const priority = file.priority;
      const timeStr = priority.estimatedMinutes >= 60 
        ? `${Math.round(priority.estimatedMinutes / 60)}h` 
        : `${priority.estimatedMinutes}m`;
      output += `| \`${file.path}\` | ${file.overall.toFixed(1)}% | ${priority.priority} | ${priority.effort} | ${priority.impact} | ${timeStr} |\n`;
    });
    output += `\n`;
  }
  
  // Quick wins with @packages/testing integration
  const quickWins = categories.poor.filter(f => f.priority.priority === 'P1');
  if (quickWins.length > 0) {
    output += `## 🎯 Quick Wins (Priority P1)\n\n`;
    const totalMinutes = quickWins.reduce((sum, f) => sum + f.priority.estimatedMinutes, 0);
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
    
    output += `**Total Effort**: ${totalHours}h for ${quickWins.length} files\n`;
    output += `**Packages Used**: \`@boilerplate/testing\`, \`@boilerplate/config\`\n\n`;
    
    quickWins.forEach(file => {
      const priority = file.priority;
      const timeStr = priority.estimatedMinutes >= 60 
        ? `${Math.round(priority.estimatedMinutes / 60)}h` 
        : `${priority.estimatedMinutes}m`;
      
      output += `### \`${file.path}\` (${timeStr} effort)\n`;
      output += `- **Coverage**: ${file.overall.toFixed(1)}% → Target: 90%+\n`;
      output += `- **Testing Packages**: ${priority.testingPackages.map(p => `\`${p}\``).join(', ')}\n`;
      if (priority.helpers.length > 0) {
        output += `- **Recommended Helpers**: ${priority.helpers.map(h => `\`${h}\``).join(', ')}\n`;
      }
      output += `- **Template**: ${priority.template}\n\n`;
    });
  }

  // Testing package integration recommendations
  output += `## 📦 @packages/testing Integration\n\n`;
  output += `The monorepo includes a comprehensive \`@packages/testing\` package with:\n\n`;
  output += `### Core Testing Utilities\n`;
  output += `- **API Testing**: \`createMockRequest\`, \`testApiEndpoint\`, \`mockAuthSession\`\n`;
  output += `- **Database Mocking**: \`mockPrisma\`, \`createMockDatabaseRecords\`\n`;
  output += `- **React Testing**: \`customRender\`, \`mockLocalStorage\`, \`mockTimers\`\n`;
  output += `- **General Helpers**: \`createMockFn\`, \`waitForCondition\`, \`mockFetch\`\n\n`;
  
  output += `### Usage Example\n`;
  output += `\`\`\`typescript\n`;
  output += `import { testApiEndpoint, mockPrisma, createAuthHeaders } from '@boilerplate/testing'\n`;
  output += `import { GET } from '@/app/api/health/route'\n\n`;
  output += `describe('/api/health', () => {\n`;
  output += `  const { prisma } = mockPrisma()\n\n`;
  output += `  testApiEndpoint(GET, 'GET', '/api/health', [\n`;
  output += `    {\n`;
  output += `      name: 'should return health status',\n`;
  output += `      expectations: { status: 200, body: { status: 'ok' } }\n`;
  output += `    }\n`;
  output += `  ])\n`;
  output += `})\n`;
  output += `\`\`\`\n\n`;

  // Configuration integration
  output += `### @packages/config Integration\n`;
  output += `Leverage shared configurations for consistent testing:\n`;
  output += `- **Theme Constants**: Test theme configuration from \`@boilerplate/config\`\n`;
  output += `- **Project Settings**: Validate environment-specific configurations\n`;
  output += `- **Shared Types**: Use consistent type definitions across tests\n\n`;
  
  return output;
}

function formatAsJSON(summary) {
  return JSON.stringify(summary, null, 2);
}

function formatAsTable(summary) {
  const { totals, files } = summary;
  
  console.log('\n📊 COVERAGE SUMMARY');
  console.log('='.repeat(50));
  console.log(`Overall Coverage: ${totals.overall.toFixed(2)}%`);
  console.log(`Statements: ${totals.statements.pct.toFixed(2)}% (${totals.statements.covered}/${totals.statements.total})`);
  console.log(`Functions: ${totals.functions.pct.toFixed(2)}% (${totals.functions.covered}/${totals.functions.total})`);
  console.log(`Branches: ${totals.branches.pct.toFixed(2)}% (${totals.branches.covered}/${totals.branches.total})`);
  console.log('');
  
  // Sort files by overall coverage
  const sortedFiles = Object.values(files).sort((a, b) => b.overall - a.overall);
  
  console.log('📁 FILES BY COVERAGE');
  console.log('-'.repeat(80));
  console.log(`${'File'.padEnd(40)} ${'Coverage'.padEnd(10)} ${'Priority'.padEnd(8)} ${'Effort'.padEnd(10)}`);
  console.log('-'.repeat(80));
  
  sortedFiles.forEach(file => {
    const coverage = `${file.overall.toFixed(1)}%`;
    const priority = file.priority.priority;
    const effort = file.priority.effort;
    
    console.log(`${file.path.padEnd(40)} ${coverage.padEnd(10)} ${priority.padEnd(8)} ${effort.padEnd(10)}`);
  });
  
  return '';
}

function main() {
  if (process.argv.includes('--help')) {
    showHelp();
    return;
  }
  
  const coverageData = loadCoverageData();
  const summary = analyzeCoverage(coverageData);
  
  let output;
  switch (OUTPUT_FORMAT) {
    case 'json':
      output = formatAsJSON(summary);
      break;
    case 'table':
      output = formatAsTable(summary);
      break;
    case 'markdown':
    default:
      output = formatAsMarkdown(summary);
      break;
  }
  
  if (output) {
    console.log(output);
  }
}

/**
 * Generate test templates based on file type and testing packages
 */
function generateTestTemplate(filePath, priority) {
  const { template, helpers, testingPackages } = priority;
  
  const imports = testingPackages.includes('@boilerplate/testing') 
    ? `import { ${helpers.join(', ')} } from '@boilerplate/testing'` 
    : '';
  
  const configImport = testingPackages.includes('@boilerplate/config')
    ? `import { /* project config */ } from '@boilerplate/config'`
    : '';
  
  let templateContent = '';
  
  switch (template) {
    case 'utility':
      templateContent = `${imports}
${configImport}
import { /* function to test */ } from '@/${filePath.replace('.ts', '')}'

describe('${filePath}', () => {
  it('should handle basic functionality', () => {
    // Test core function
    expect(functionName(input)).toBe(expected)
  })
  
  it('should handle edge cases', () => {
    // Test edge cases
    expect(functionName(null)).toBe(fallback)
  })
})`;
      break;
      
    case 'api':
      templateContent = `${imports}
import { GET, POST } from '@/${filePath.replace('.ts', '')}'

describe('${filePath}', () => {
  const { prisma } = mockPrisma()
  
  testApiEndpoint(GET, 'GET', '/${filePath.replace('app/api/', '').replace('/route.ts', '')}', [
    {
      name: 'should require authentication',
      expectations: { status: 401 }
    },
    {
      name: 'should handle valid requests',
      auth: { session: { userId: 'test_user' } },
      expectations: { status: 200 }
    }
  ])
})`;
      break;
      
    case 'hook':
      templateContent = `${imports}
import { renderHook } from '@testing-library/react'
import { /* hook to test */ } from '@/${filePath.replace('.ts', '')}'

describe('${filePath}', () => {
  const { localStorage } = mockLocalStorage()
  
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useHook())
    expect(result.current).toBeDefined()
  })
  
  it('should handle state updates', async () => {
    const { result } = renderHook(() => useHook())
    // Test state changes
  })
})`;
      break;
      
    case 'query':
      templateContent = `${imports}
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { /* query to test */ } from '@/${filePath.replace('.ts', '')}'

describe('${filePath}', () => {
  const mockFetchFn = mockFetch({ json: () => Promise.resolve({}) })
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  
  it('should fetch data correctly', async () => {
    // Test query functionality
  })
  
  it('should handle errors gracefully', async () => {
    // Test error scenarios
  })
})`;
      break;
      
    default:
      templateContent = `${imports}
import { /* module to test */ } from '@/${filePath.replace('.ts', '')}'

describe('${filePath}', () => {
  it('should work correctly', () => {
    // Add tests here
  })
})`;
  }
  
  return templateContent.trim();
}

/**
 * CLI command to generate a test file template
 */
function generateTestFile(filePath) {
  const priority = PRIORITY_CONFIG[filePath];
  if (!priority) {
    console.error(`No priority configuration found for ${filePath}`);
    process.exit(1);
  }
  
  const template = generateTestTemplate(filePath, priority);
  console.log(template);
}

if (require.main === module) {
  // Handle special commands
  if (process.argv.includes('--generate-test')) {
    const fileIndex = process.argv.indexOf('--generate-test') + 1;
    const filePath = process.argv[fileIndex];
    if (!filePath) {
      console.error('Please specify a file path after --generate-test');
      process.exit(1);
    }
    generateTestFile(filePath);
    return;
  }
  
  main();
}

module.exports = {
  loadCoverageData,
  analyzeCoverage,
  formatAsMarkdown,
  formatAsJSON,
  formatAsTable,
  generateTestTemplate,
  generateTestFile
};