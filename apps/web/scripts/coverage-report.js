#!/usr/bin/env node

/**
 * Enhanced coverage reporting with dynamic, intelligent recommendations
 * Analyzes coverage data and provides prioritized, actionable insights
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// File sensitivity weights (higher = more critical)
const FILE_SENSITIVITY = {
  // Critical infrastructure (P1)
  'auth': 10,
  'auth-client': 10,
  'prisma': 9,
  'queries': 9,
  'hooks': 8,
  
  // Core business logic (P2)
  'api': 7,
  'preferences': 7,
  'validations': 6,
  
  // State management (P3)
  'store': 6,
  'context': 6,
  'providers': 5,
  
  // Utilities (P4)
  'utils': 4,
  'lib': 4,
  'helpers': 3,
  
  // UI/Components (P5)
  'components': 2,
  'ui': 2,
  'layout': 1
}

// Coverage thresholds for different file types
const COVERAGE_TARGETS = {
  'auth': 95,
  'api': 90,
  'hooks': 85,
  'queries': 85,
  'validations': 90,
  'utils': 80,
  'components': 70,
  'ui': 60
}

function getFileSensitivity(filePath) {
  const fileName = path.basename(filePath).toLowerCase()
  const dirName = path.dirname(filePath).toLowerCase()
  
  // Check for exact matches first
  for (const [pattern, weight] of Object.entries(FILE_SENSITIVITY)) {
    if (fileName.includes(pattern) || dirName.includes(pattern)) {
      return weight
    }
  }
  
  // Default weight for unmatched files
  return 3
}

function getCoverageTarget(filePath) {
  const fileName = path.basename(filePath).toLowerCase()
  const dirName = path.dirname(filePath).toLowerCase()
  
  for (const [pattern, target] of Object.entries(COVERAGE_TARGETS)) {
    if (fileName.includes(pattern) || dirName.includes(pattern)) {
      return target
    }
  }
  
  return 75 // Default target
}

function analyzeCoverageData() {
  const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-final.json')
  
  if (!fs.existsSync(coveragePath)) {
    return null
  }
  
  try {
    const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
    const fileAnalysis = []
    
    for (const [filePath, data] of Object.entries(coverageData)) {
      const relativePath = filePath.replace(process.cwd() + '/', '')
      
      // Skip test files and config files
      if (relativePath.includes('test') || relativePath.includes('.config.')) {
        continue
      }
      
      // Calculate coverage percentages
      const stmtCoverage = calculatePercentage(data.s)
      const fnCoverage = calculatePercentage(data.f)
      const branchCoverage = calculatePercentage(data.b, true)
      
      // Overall coverage (weighted average)
      const overallCoverage = (stmtCoverage * 0.5 + fnCoverage * 0.3 + branchCoverage * 0.2)
      
      // Get sensitivity and target
      const sensitivity = getFileSensitivity(relativePath)
      const target = getCoverageTarget(relativePath)
      
      // Calculate priority score (higher = more urgent)
      const gap = target - overallCoverage
      const priorityScore = (sensitivity * gap) / 10
      
      fileAnalysis.push({
        path: relativePath,
        coverage: {
          statements: stmtCoverage,
          functions: fnCoverage,
          branches: branchCoverage,
          overall: overallCoverage
        },
        sensitivity,
        target,
        gap,
        priorityScore,
        uncoveredLines: countUncovered(data.s),
        uncoveredFunctions: countUncovered(data.f),
        uncoveredBranches: countUncoveredBranches(data.b)
      })
    }
    
    // Sort by priority score (highest first)
    fileAnalysis.sort((a, b) => b.priorityScore - a.priorityScore)
    
    return fileAnalysis
  } catch (error) {
    console.error('Error analyzing coverage data:', error.message)
    return null
  }
}

function calculatePercentage(coverage, isBranch = false) {
  if (!coverage) return 0
  
  if (isBranch) {
    let total = 0
    let covered = 0
    for (const branch of Object.values(coverage)) {
      total += branch.length
      covered += branch.filter(v => v > 0).length
    }
    return total === 0 ? 100 : (covered / total) * 100
  }
  
  const values = Object.values(coverage)
  if (values.length === 0) return 100
  
  const covered = values.filter(v => v > 0).length
  return (covered / values.length) * 100
}

function countUncovered(coverage) {
  if (!coverage) return 0
  return Object.values(coverage).filter(v => v === 0).length
}

function countUncoveredBranches(branches) {
  if (!branches) return 0
  let uncovered = 0
  for (const branch of Object.values(branches)) {
    uncovered += branch.filter(v => v === 0).length
  }
  return uncovered
}

function generateDynamicRecommendations(analysis) {
  if (!analysis || analysis.length === 0) {
    return generateStaticRecommendations()
  }
  
  const recommendations = {
    critical: [],
    high: [],
    medium: [],
    low: []
  }
  
  // Group files by priority
  for (const file of analysis) {
    // Skip files with excellent coverage
    if (file.coverage.overall >= file.target) {
      continue
    }
    
    const effort = estimateTestingEffort(file)
    const impact = calculateImpact(file)
    
    const recommendation = {
      file: file.path,
      currentCoverage: `${file.coverage.overall.toFixed(1)}%`,
      targetCoverage: `${file.target}%`,
      gap: `${file.gap.toFixed(1)}%`,
      effort,
      impact,
      uncovered: {
        lines: file.uncoveredLines,
        functions: file.uncoveredFunctions,
        branches: file.uncoveredBranches
      },
      strategy: generateTestStrategy(file)
    }
    
    // Categorize by priority
    if (file.priorityScore >= 50) {
      recommendations.critical.push(recommendation)
    } else if (file.priorityScore >= 30) {
      recommendations.high.push(recommendation)
    } else if (file.priorityScore >= 15) {
      recommendations.medium.push(recommendation)
    } else {
      recommendations.low.push(recommendation)
    }
  }
  
  // Limit recommendations to top items in each category
  recommendations.critical = recommendations.critical.slice(0, 3)
  recommendations.high = recommendations.high.slice(0, 5)
  recommendations.medium = recommendations.medium.slice(0, 5)
  recommendations.low = recommendations.low.slice(0, 3)
  
  return recommendations
}

function estimateTestingEffort(file) {
  const totalUncovered = file.uncoveredLines + file.uncoveredFunctions * 5 + file.uncoveredBranches * 2
  
  if (totalUncovered <= 10) return '15-30 min'
  if (totalUncovered <= 25) return '30-60 min'
  if (totalUncovered <= 50) return '1-2 hours'
  if (totalUncovered <= 100) return '2-4 hours'
  return '4+ hours'
}

function calculateImpact(file) {
  if (file.sensitivity >= 8) return 'CRITICAL'
  if (file.sensitivity >= 6) return 'HIGH'
  if (file.sensitivity >= 4) return 'MEDIUM'
  return 'LOW'
}

function generateTestStrategy(file) {
  const strategies = []
  
  if (file.uncoveredFunctions > 0) {
    strategies.push(`Test ${file.uncoveredFunctions} uncovered function(s)`)
  }
  
  if (file.uncoveredBranches > 0) {
    strategies.push(`Add ${file.uncoveredBranches} branch test(s)`)
  }
  
  if (file.coverage.overall < 20) {
    strategies.push('Start with basic happy path tests')
  } else if (file.coverage.overall < 50) {
    strategies.push('Add error handling and edge cases')
  } else {
    strategies.push('Focus on remaining edge cases')
  }
  
  // File-specific strategies
  if (file.path.includes('api')) {
    strategies.push('Use @packages/testing API utilities')
  }
  if (file.path.includes('hook')) {
    strategies.push('Use @testing-library/react-hooks')
  }
  if (file.path.includes('auth')) {
    strategies.push('Mock authentication with @packages/testing')
  }
  
  return strategies.slice(0, 3)
}

function generateStaticRecommendations() {
  // Fallback static recommendations when no coverage data
  return {
    critical: [
      {
        file: 'app/lib/auth.ts',
        strategy: ['Add authentication flow tests', 'Mock Better Auth methods'],
        effort: '2-4 hours',
        impact: 'CRITICAL'
      }
    ],
    high: [
      {
        file: 'app/hooks/use-settings-store.tsx',
        strategy: ['Test state updates', 'Test localStorage sync'],
        effort: '1-2 hours',
        impact: 'HIGH'
      }
    ],
    medium: [],
    low: []
  }
}

function formatRecommendations(recommendations) {
  console.log('\n📊 DYNAMIC TEST COVERAGE RECOMMENDATIONS')
  console.log('========================================\n')
  
  // Critical recommendations (P1)
  if (recommendations.critical.length > 0) {
    console.log('🔴 CRITICAL PRIORITY (P1) - Immediate Action Required')
    console.log('─────────────────────────────────────────────────────')
    for (const rec of recommendations.critical) {
      console.log(`\n📁 ${rec.file}`)
      console.log(`   Coverage: ${rec.currentCoverage} → Target: ${rec.targetCoverage} (Gap: ${rec.gap})`)
      console.log(`   Impact: ${rec.impact} | Effort: ${rec.effort}`)
      console.log(`   Uncovered: ${rec.uncovered.lines} lines, ${rec.uncovered.functions} functions, ${rec.uncovered.branches} branches`)
      console.log('   Strategy:')
      rec.strategy.forEach(s => console.log(`     • ${s}`))
    }
    console.log('')
  }
  
  // High priority recommendations (P2)
  if (recommendations.high.length > 0) {
    console.log('🟠 HIGH PRIORITY (P2) - Address This Sprint')
    console.log('──────────────────────────────────────────')
    for (const rec of recommendations.high) {
      console.log(`\n📁 ${rec.file}`)
      console.log(`   Coverage: ${rec.currentCoverage} → ${rec.targetCoverage}`)
      console.log(`   Impact: ${rec.impact} | Effort: ${rec.effort}`)
      console.log('   Quick wins:')
      rec.strategy.slice(0, 2).forEach(s => console.log(`     • ${s}`))
    }
    console.log('')
  }
  
  // Medium priority (P3)
  if (recommendations.medium.length > 0) {
    console.log('🟡 MEDIUM PRIORITY (P3) - Plan for Next Sprint')
    console.log('───────────────────────────────────────────────')
    const fileList = recommendations.medium.map(r => r.file).slice(0, 5)
    console.log('   Files to improve:')
    fileList.forEach(f => console.log(`     • ${f}`))
    console.log('')
  }
  
  // Low priority (P4-P5)
  if (recommendations.low.length > 0) {
    console.log('🟢 LOW PRIORITY (P4-P5) - Nice to Have')
    console.log('───────────────────────────────────────')
    console.log(`   ${recommendations.low.length} files with minor coverage gaps`)
    console.log('')
  }
}

// Main execution
console.log('🧪 Running comprehensive test coverage analysis...\n')

try {
  // Run jest with coverage
  let result
  try {
    result = execSync('npx jest --coverage --passWithNoTests 2>&1', {
      cwd: process.cwd(),
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10
    })
  } catch (error) {
    result = error.stdout || error.output?.join('') || ''
    if (!result.includes('Coverage summary')) {
      throw error
    }
  }

  // Extract and display coverage summary
  const coverageMatch = result.match(/=============================== Coverage summary ===============================\n([\s\S]*?)===============================================================================/)
  
  if (coverageMatch) {
    console.log('📊 COVERAGE SUMMARY')
    console.log('==================')
    console.log(coverageMatch[1])
  }

  // Extract test results
  const testMatch = result.match(/Test Suites: (.+)\nTests: (.+)\nSnapshots: (.+)\nTime: (.+)/)
  
  if (testMatch) {
    console.log('\n🎯 TEST RESULTS SUMMARY')
    console.log('======================')
    console.log(`Test Suites: ${testMatch[1]}`)
    console.log(`Tests: ${testMatch[2]}`)
    console.log(`Snapshots: ${testMatch[3]}`)
    console.log(`Time: ${testMatch[4]}`)
  }

  // Analyze coverage data for dynamic recommendations
  const analysis = analyzeCoverageData()
  const recommendations = generateDynamicRecommendations(analysis)
  formatRecommendations(recommendations)

  // Testing package integration tips
  console.log('🔧 TESTING UTILITIES AVAILABLE')
  console.log('==============================')
  console.log('Use @packages/testing for:')
  console.log('  • API mocks: createMockRequest, testApiEndpoint')
  console.log('  • Auth mocks: mockAuthSession, createAuthHeaders')
  console.log('  • DB mocks: mockPrisma, createMockDatabaseRecords')
  console.log('  • React testing: customRender, mockLocalStorage')
  console.log('  • Async utilities: mockFetch, mockTimers\n')

  // HTML report location
  const htmlReportPath = path.join(process.cwd(), 'coverage', 'lcov-report', 'index.html')
  if (fs.existsSync(htmlReportPath)) {
    console.log('📋 DETAILED COVERAGE REPORT')
    console.log('===========================')
    console.log(`📁 HTML Report: file://${htmlReportPath}`)
    console.log('🔍 Open in browser for line-by-line coverage analysis\n')
  }

  // Quick action items
  console.log('⚡ QUICK WINS (Can be done in < 30 minutes each)')
  console.log('================================================')
  if (analysis && analysis.length > 0) {
    const quickWins = analysis
      .filter(f => f.uncoveredLines <= 20 && f.gap > 10)
      .slice(0, 5)
    
    if (quickWins.length > 0) {
      quickWins.forEach((f, i) => {
        console.log(`${i + 1}. ${f.path} (${f.uncoveredLines} lines, +${f.gap.toFixed(0)}% coverage)`)
      })
    } else {
      console.log('No quick wins identified. Focus on high-priority items above.')
    }
  }
  console.log('')

  // Exit code based on coverage
  const stmtsMatch = result.match(/Statements\s+:\s+(\d+(?:\.\d+)?)%/)
  const currentCoverage = stmtsMatch ? parseFloat(stmtsMatch[1]) : 0
  
  if (currentCoverage >= 80) {
    console.log('✅ EXCELLENT: Coverage meets 80% target threshold!')
    process.exit(0)
  } else if (currentCoverage >= 60) {
    console.log('🟡 GOOD PROGRESS: Coverage at ' + currentCoverage.toFixed(1) + '%, continue to 80%!')
    process.exit(0)
  } else if (currentCoverage >= 40) {
    console.log('🟠 IMPROVING: Coverage at ' + currentCoverage.toFixed(1) + '%, focus on critical files!')
    process.exit(0)
  } else {
    console.log('🔴 NEEDS ATTENTION: Coverage at ' + currentCoverage.toFixed(1) + '%, prioritize P1 items!')
    process.exit(1)
  }

} catch (error) {
  console.error('❌ Coverage analysis failed:')
  console.error(error.message)
  
  console.log('\n💡 TROUBLESHOOTING')
  console.log('==================')
  console.log('1. Check test syntax: pnpm jest --listTests')
  console.log('2. Run specific test: pnpm jest <test-file>')
  console.log('3. Check Jest config: jest.config.js')
  console.log('4. Verify mocks: jest.setup.node.js & jest.setup.jsdom.js')
  console.log('5. Install deps: pnpm install')
  
  process.exit(1)
}